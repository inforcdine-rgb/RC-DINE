import crypto from 'crypto';
import webpush from 'web-push';
import env from './env.js';
import logger from './logger.js';

let webPushReady = false;

const decodeKey = (value) => {
    try {
        const normalized = String(value || '')
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
        return Buffer.from(normalized + padding, 'base64');
    } catch (_error) {
        return Buffer.alloc(0);
    }
};

const vapidKeysMatch = (publicKey, privateKey) => {
    try {
        const expectedPublicKey = decodeKey(publicKey);
        const ecdh = crypto.createECDH('prime256v1');
        ecdh.setPrivateKey(decodeKey(privateKey));
        const derivedPublicKey = ecdh.getPublicKey(undefined, 'uncompressed');
        return expectedPublicKey.length === derivedPublicKey.length &&
            crypto.timingSafeEqual(expectedPublicKey, derivedPublicKey);
    } catch (_error) {
        return false;
    }
};

export const initNotifications = async () => {
    webPushReady = false;
    const publicKeyValid = decodeKey(env.notification.publicKey).length === 65;
    const privateKeyValid = decodeKey(env.notification.privateKey).length === 32;
    const emailValid = Boolean(String(env.notification.email || '').trim());
    const keyPairValid = publicKeyValid && privateKeyValid &&
        vapidKeysMatch(env.notification.publicKey, env.notification.privateKey);

    if (!keyPairValid || !emailValid) {
        const message =
            'Web Push disabled: invalid or mismatched WEB_PUSH_PUBLIC_KEY/WEB_PUSH_PRIVATE_KEY, or invalid WEB_PUSH_EMAIL. ' +
            'Generate matching keys with: npx web-push generate-vapid-keys';

        if (env.app.env === 'production') throw new Error(message);
        logger('warn', message);
        return false;
    }

    const subject = String(env.notification.email).startsWith('mailto:')
        ? env.notification.email
        : `mailto:${env.notification.email}`;

    webpush.setVapidDetails(
        subject,
        env.notification.publicKey,
        env.notification.privateKey
    );

    webPushReady = true;
    logger('info', 'Web Push notification connection successful');
    return true;
};

export const isWebPushReady = () => webPushReady;
