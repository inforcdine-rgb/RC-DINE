import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import webpush from 'web-push';

import { db } from '../../config/database.js';
import env from '../../config/env.js';
import logger from '../../config/logger.js';
import { isWebPushReady } from '../../config/notification.js';
import { emitToPushEndpoint, isPushEndpointVisible } from '../../config/socket.js';
import { NOTIFICATION_STATUS } from '../models/notification.model.js';
import { NOTIFICATION_PREFERENCE } from '../models/preferences.model.js';
import notificationRepo from '../repositories/notification.repository.js';
import pushSubscriptionRepo from '../repositories/pushSubscription.repository.js';
import { CustomError, STATUS_CODE } from '../utils/common.js';

const DEFAULT_PUSH_TTL_SECONDS = 7 * 24 * 60 * 60;
const MAX_PUSH_TTL_SECONDS = 28 * 24 * 60 * 60;

const normalizePhone = (value) =>
    String(value || '')
        .replace(/\D/g, '')
        .slice(-10) || null;
const endpointHash = (endpoint) => crypto.createHash('sha256').update(endpoint).digest('hex');
const unique = (values = []) => [...new Set(values.filter(Boolean))];
const getType = (data) => data.type || data.meta?.action || 'UPDATE';
const getCategory = (data) => {
    if (data.category || data.meta?.category) return data.category || data.meta.category;
    const type = String(getType(data)).toUpperCase();
    if (type.includes('PAYMENT')) return 'PAYMENTS';
    if (type.includes('ORDER') || type.includes('CUSTOMER-REGISTERATION')) return 'ORDERS';
    if (type.includes('SESSION') || type.startsWith('RC_')) return 'RC_SESSION';
    return 'GENERAL';
};

const recipientWhere = ({ userId, customerId, phoneNumber }) => {
    if (userId) return { userId };
    if (customerId) return { customerId };
    if (phoneNumber) return { phoneNumber: normalizePhone(phoneNumber) };
    throw CustomError(STATUS_CODE.BAD_REQUEST, 'Notification recipient is required');
};

const getPublicConfig = () => ({
    enabled: isWebPushReady(),
    vapidPublicKey: isWebPushReady() ? env.notification.publicKey : ''
});

const subscribe = async (payload) => {
    try {
        if (!isWebPushReady()) {
            throw CustomError(
                STATUS_CODE.SERVICE_UNAVAILABLE,
                'Web Push is not configured. Verify the backend VAPID keys and restart the server.'
            );
        }
        const hash = endpointHash(payload.endpoint);
        const data = {
            id: uuidv4(),
            userId: payload.userId || null,
            customerId: payload.customerId || null,
            phoneNumber: normalizePhone(payload.phoneNumber),
            deviceId: payload.deviceId || hash.slice(0, 32),
            endpoint: payload.endpoint,
            endpointHash: hash,
            expiration: payload.expirationTime ? new Date(payload.expirationTime) : null,
            p256dh: payload.keys.p256dh,
            auth: payload.keys.auth,
            platform: String(payload.platform || '').slice(0, 50) || null,
            lastSeenAt: new Date()
        };

        const subscription = await pushSubscriptionRepo.upsert(data);
        const removedDuplicates = await pushSubscriptionRepo.remove({
            where: {
                deviceId: data.deviceId,
                endpointHash: { [Op.ne]: hash }
            }
        });
        const presenceToken = jwt.sign({ type: 'PUSH_PRESENCE', endpointHash: hash }, env.jwtSecret, {
            expiresIn: '30d'
        });

        logger('info', 'Notification subscription synchronized', {
            userId: data.userId,
            customerId: data.customerId,
            deviceId: data.deviceId,
            duplicateSubscriptionsRemoved: removedDuplicates
        });

        return {
            id: subscription.id,
            deviceId: subscription.deviceId,
            presenceToken,
            vapidPublicKey: env.notification.publicKey
        };
    } catch (error) {
        logger('error', 'Error while subscribing notification', {
            message: error?.message,
            code: error?.code
        });
        throw CustomError(error.code || STATUS_CODE.INTERNAL_SERVER_ERROR, error.message);
    }
};

const unsubscribe = async (identityOrUserId, legacyCustomerId, criteria = {}) => {
    try {
        const identity =
            typeof identityOrUserId === 'object'
                ? identityOrUserId
                : { userId: identityOrUserId, customerId: legacyCustomerId, ...criteria };
        const owner = recipientWhere(identity);
        const where = { ...owner };

        if (identity.endpoint) where.endpointHash = endpointHash(identity.endpoint);
        if (identity.deviceId) where.deviceId = identity.deviceId;

        if (!identity.endpoint && !identity.deviceId && !identity.allDevices) {
            throw CustomError(STATUS_CODE.BAD_REQUEST, 'A device subscription is required');
        }

        await pushSubscriptionRepo.remove({ where });
        return { message: 'Success' };
    } catch (error) {
        logger('error', 'Error while un-subscribing notification', {
            message: error?.message,
            code: error?.code
        });
        throw CustomError(error.code || STATUS_CODE.INTERNAL_SERVER_ERROR, error.message);
    }
};

const getRecipients = (userIds, customerId, options = {}) => [
    ...unique(userIds).map((userId) => ({ userId })),
    ...unique([...(Array.isArray(customerId) ? customerId : [customerId]), ...(options.customerIds || [])]).map(
        (id) => ({ customerId: id })
    ),
    ...unique(options.phoneNumbers).map((phoneNumber) => ({ phoneNumber: normalizePhone(phoneNumber) }))
];

const buildStoredNotification = (recipient, data) => ({
    id: uuidv4(),
    ...recipient,
    title: data.title || 'R&C Dine',
    message: data.message || data.body || 'New update received',
    path: data.path || (recipient.userId ? '/analytics' : '/'),
    type: getType(data),
    category: getCategory(data),
    entityId: data.entityId || data.orderId || data.meta?.orderId || data.meta?.requestId || null,
    dedupeKey: data.dedupeKey || null,
    payload: data
});

const getPushTtl = (payload) => {
    const requestedTtl = Number(payload.ttl);
    if (!Number.isFinite(requestedTtl)) return DEFAULT_PUSH_TTL_SECONDS;
    return Math.min(MAX_PUSH_TTL_SECONDS, Math.max(60, Math.round(requestedTtl)));
};

const storeNotification = async (recipient, data) => {
    if (data.dedupeKey) {
        const existing = await db.notifications.findOne({
            where: { ...recipient, dedupeKey: data.dedupeKey },
            order: [['createdAt', 'DESC']]
        });
        if (existing) return existing;
    }
    return notificationRepo.save(buildStoredNotification(recipient, data));
};

const isManagerNotificationEnabled = async (userId, preferenceCache) => {
    if (!userId) return true;
    if (preferenceCache.has(userId)) return preferenceCache.get(userId);

    const preference = await db.preferences.findOne({
        where: { userId },
        attributes: ['notification']
    });
    const enabled = !preference || preference.notification === NOTIFICATION_PREFERENCE[0];
    preferenceCache.set(userId, enabled);
    return enabled;
};

const matchesRecipient = (subscription, recipient) =>
    (recipient.userId && subscription.userId === recipient.userId) ||
    (recipient.customerId && subscription.customerId === recipient.customerId) ||
    (recipient.phoneNumber && normalizePhone(subscription.phoneNumber) === recipient.phoneNumber);

const deliverToSubscription = async (subscription, payload) => {
    try {
        // Always use Web Push as the primary channel. A page can remain connected to
        // Socket.IO while it is minimized or being suspended; treating that socket as
        // the delivery channel can prevent the OS notification from ever appearing.
        const response = await webpush.sendNotification(
            {
                endpoint: subscription.endpoint,
                expirationTime: subscription.expiration || null,
                keys: { p256dh: subscription.p256dh, auth: subscription.auth }
            },
            JSON.stringify(payload),
            { TTL: getPushTtl(payload), urgency: payload.urgency || 'high' }
        );
        logger('info', 'Web Push notification sent', {
            event: 'notification_delivered',
            channel: 'web_push',
            subscriptionId: subscription.id,
            notificationId: payload.notificationId,
            statusCode: response?.statusCode
        });
        return 'push';
    } catch (pushError) {
        // Keep the live socket only as a foreground fallback. Background and closed
        // clients must never depend on it for notification delivery.
        const invalidEndpoint = pushError?.statusCode === 404 || pushError?.statusCode === 410;
        if (!invalidEndpoint && isPushEndpointVisible(subscription.endpointHash)) {
            const acknowledged = await emitToPushEndpoint(subscription.endpointHash, payload);
            if (acknowledged) {
                logger('warn', 'Web Push failed; notification delivered through foreground Socket.IO fallback', {
                    event: 'notification_delivered',
                    channel: 'socket_fallback',
                    subscriptionId: subscription.id,
                    notificationId: payload.notificationId,
                    pushStatusCode: pushError?.statusCode,
                    pushMessage: pushError?.message
                });
                return 'socket';
            }
        }
        throw pushError;
    }
};

const sendNotification = async (userIds, data, customerId = undefined, options = {}) => {
    try {
        const recipients = getRecipients(userIds, customerId, options);
        if (!recipients.length) return { successCount: 0, failureCount: 0 };

        const notifications = await Promise.all(
            recipients.map(async (recipient) => ({
                recipient,
                notification: await storeNotification(recipient, data)
            }))
        );
        const recipientConditions = recipients.map(recipientWhere);
        const { rows: subscriptions = [] } = await pushSubscriptionRepo.find({
            where: { [Op.or]: recipientConditions }
        });

        let successCount = 0;
        let failureCount = 0;
        const preferenceCache = new Map();

        await Promise.all(
            subscriptions.map(async (subscription) => {
                const stored = notifications.find(({ recipient }) => matchesRecipient(subscription, recipient));
                if (!stored) return;
                if (!(await isManagerNotificationEnabled(subscription.userId, preferenceCache))) return;

                if (subscription.expiration && new Date(subscription.expiration).getTime() <= Date.now()) {
                    failureCount += 1;
                    await pushSubscriptionRepo.remove({ where: { id: subscription.id } });
                    logger('info', 'Expired Web Push subscription removed', {
                        event: 'subscription_removed',
                        reason: 'expired',
                        subscriptionId: subscription.id
                    });
                    return;
                }

                const payload = {
                    ...data,
                    title: stored.notification.title,
                    message: stored.notification.message,
                    path: stored.notification.path,
                    notificationId: stored.notification.id,
                    type: getType(data),
                    category: getCategory(data),
                    createdAt: stored.notification.createdAt,
                    silent: data.silent === true,
                    requireInteraction:
                        typeof data.requireInteraction === 'boolean'
                            ? data.requireInteraction
                            : getType(data) === 'NEW_ORDER',
                    vibrate:
                        data.vibrate ||
                        (getType(data) === 'NEW_ORDER' ? [250, 100, 250, 100, 350] : [120, 60, 120])
                };

                try {
                    await deliverToSubscription(subscription, payload);
                    successCount += 1;
                    await subscription.update({ lastSeenAt: new Date() });
                } catch (error) {
                    failureCount += 1;
                    logger('error', 'Web Push delivery failed', {
                        event: 'push_failed',
                        subscriptionId: subscription.id,
                        statusCode: error?.statusCode,
                        message: error?.message
                    });
                    if (error?.statusCode === 404 || error?.statusCode === 410) {
                        await pushSubscriptionRepo.remove({ where: { id: subscription.id } });
                        logger('info', 'Invalid Web Push subscription removed', {
                            event: 'subscription_removed',
                            reason: `push_${error.statusCode}`,
                            subscriptionId: subscription.id
                        });
                    }
                }
            })
        );

        return { successCount, failureCount };
    } catch (error) {
        logger('error', 'Error while sending notification', {
            message: error?.message,
            code: error?.code
        });
        return { successCount: 0, failureCount: 0 };
    }
};

const fetch = async (identity, query = {}) => {
    try {
        const where = recipientWhere(identity);
        if (query.status && NOTIFICATION_STATUS.includes(query.status)) where.status = query.status;
        if (query.type) where.type = query.type;
        const limit = Math.min(100, Math.max(1, Number(query.limit) || 50));
        const offset = Math.max(0, Number(query.offset) || 0);
        const result = await notificationRepo.find({
            where,
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });
        const unreadCount = await db.notifications.count({
            where: { ...recipientWhere(identity), status: NOTIFICATION_STATUS[0] }
        });
        return { ...result, unreadCount };
    } catch (error) {
        throw CustomError(error.code || STATUS_CODE.INTERNAL_SERVER_ERROR, error.message);
    }
};

const update = async (identity, notificationId) => {
    const where = { ...recipientWhere(identity), status: NOTIFICATION_STATUS[0] };
    if (notificationId) where.id = notificationId;
    await notificationRepo.update({ where }, { status: NOTIFICATION_STATUS[1], readAt: new Date() });
    return { message: 'SUCCESS' };
};

const remove = async (identity, notificationId) => {
    await notificationRepo.remove({ where: { ...recipientWhere(identity), id: notificationId } });
    return { message: 'SUCCESS' };
};

const clear = async (identity) => {
    await notificationRepo.remove({ where: recipientWhere(identity) });
    return { message: 'SUCCESS' };
};

const restore = async (identity, notificationId) => {
    await notificationRepo.restore({
        where: { ...recipientWhere(identity), id: notificationId },
        paranoid: false
    });
    return { message: 'SUCCESS' };
};

export default {
    getPublicConfig,
    subscribe,
    unsubscribe,
    sendNotification,
    fetch,
    update,
    remove,
    clear,
    restore
};
