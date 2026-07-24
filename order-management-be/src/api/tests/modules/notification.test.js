import webpush from 'web-push';
import { Op } from 'sequelize';

import { db } from '../../../config/database.js';
import { emitToPushEndpoint, isPushEndpointVisible } from '../../../config/socket.js';
import notificationRepo from '../../repositories/notification.repository.js';
import pushSubscriptionRepo from '../../repositories/pushSubscription.repository.js';
import notificationService from '../../services/notification.service.js';

jest.mock('web-push', () => ({ sendNotification: jest.fn() }));
jest.mock('../../../config/database.js', () => ({
    db: {
        notifications: {},
        preferences: {}
    }
}));
jest.mock('../../../config/env.js', () => ({
    jwtSecret: 'test-jwt-secret',
    notification: { publicKey: 'test-public-key' }
}));
jest.mock('../../../config/notification.js', () => ({ isWebPushReady: jest.fn(() => true) }));
jest.mock('../../../config/socket.js', () => ({
    emitToPushEndpoint: jest.fn(),
    isPushEndpointVisible: jest.fn()
}));
jest.mock('../../repositories/notification.repository.js', () => ({
    save: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    restore: jest.fn()
}));
jest.mock('../../repositories/pushSubscription.repository.js', () => ({
    upsert: jest.fn(),
    find: jest.fn(),
    remove: jest.fn()
}));

const makeSubscription = (overrides = {}) => ({
    id: 'subscription-1',
    userId: 'user-1',
    customerId: null,
    phoneNumber: null,
    endpoint: 'https://push.example/device-1',
    endpointHash: 'hash-1',
    expiration: null,
    p256dh: 'p256dh',
    auth: 'auth',
    update: jest.fn(),
    ...overrides
});

describe('Notification service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        emitToPushEndpoint.mockResolvedValue(true);
        webpush.sendNotification.mockResolvedValue({ statusCode: 201 });
        pushSubscriptionRepo.remove.mockResolvedValue(0);
        db.notifications = {
            findOne: jest.fn().mockResolvedValue(null),
            count: jest.fn().mockResolvedValue(0)
        };
        db.preferences = {
            findOne: jest.fn().mockResolvedValue({ notification: 'ON' })
        };
        notificationRepo.save.mockImplementation(async (payload) => ({
            ...payload,
            createdAt: new Date('2026-07-19T00:00:00.000Z')
        }));
    });

    test('upserts the current endpoint and removes stale endpoints for the same device', async () => {
        pushSubscriptionRepo.upsert.mockResolvedValue({ id: 'subscription-1', deviceId: 'device-1' });

        const result = await notificationService.subscribe({
            userId: 'user-1',
            deviceId: 'device-1',
            endpoint: 'https://push.example/device-1',
            expirationTime: null,
            keys: { p256dh: 'p256dh', auth: 'auth' }
        });

        expect(pushSubscriptionRepo.upsert).toHaveBeenCalledTimes(1);
        expect(pushSubscriptionRepo.remove).toHaveBeenCalledWith({
            where: {
                deviceId: 'device-1',
                endpointHash: { [Op.ne]: expect.any(String) }
            }
        });
        expect(result.presenceToken).toEqual(expect.any(String));
        expect(result.vapidPublicKey).toBe('test-public-key');
    });

    test('stores once and uses Socket.IO instead of Push for a visible device', async () => {
        const subscription = makeSubscription();
        pushSubscriptionRepo.find.mockResolvedValue({ rows: [subscription] });
        isPushEndpointVisible.mockReturnValue(true);

        const result = await notificationService.sendNotification(['user-1'], {
            title: 'New order',
            message: 'Table 4 placed an order',
            dedupeKey: 'new-order:order-1',
            entityId: 'order-1'
        });

        expect(notificationRepo.save).toHaveBeenCalledTimes(1);
        expect(emitToPushEndpoint).toHaveBeenCalledTimes(1);
        expect(webpush.sendNotification).not.toHaveBeenCalled();
        expect(result).toEqual({ successCount: 1, failureCount: 0 });
    });

    test('falls back to Web Push when visible presence does not acknowledge Socket.IO delivery', async () => {
        const subscription = makeSubscription();
        pushSubscriptionRepo.find.mockResolvedValue({ rows: [subscription] });
        isPushEndpointVisible.mockReturnValue(true);
        emitToPushEndpoint.mockResolvedValue(false);

        const result = await notificationService.sendNotification(['user-1'], {
            title: 'Order ready',
            message: 'Order 1 is ready',
            dedupeKey: 'order-ready:order-1'
        });

        expect(emitToPushEndpoint).toHaveBeenCalledTimes(1);
        expect(webpush.sendNotification).toHaveBeenCalledTimes(1);
        expect(result).toEqual({ successCount: 1, failureCount: 0 });
    });

    test('uses Web Push in the background and removes expired endpoints', async () => {
        const subscription = makeSubscription();
        pushSubscriptionRepo.find.mockResolvedValue({ rows: [subscription] });
        isPushEndpointVisible.mockReturnValue(false);
        webpush.sendNotification.mockRejectedValue({ statusCode: 410, message: 'Gone' });

        const result = await notificationService.sendNotification(['user-1'], {
            title: 'Order ready',
            message: 'Order 1 is ready',
            dedupeKey: 'order-ready:order-1'
        });

        expect(webpush.sendNotification).toHaveBeenCalledTimes(1);
        expect(pushSubscriptionRepo.remove).toHaveBeenCalledWith({ where: { id: 'subscription-1' } });
        expect(result).toEqual({ successCount: 0, failureCount: 1 });
    });
});
