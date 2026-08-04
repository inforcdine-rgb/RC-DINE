import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

import env from './env.js';
import logger from './logger.js';

let firebaseReady = false;

export const initFirebaseNotifications = () => {
    firebaseReady = false;

    const { projectId, clientEmail, privateKey } = env.firebase;
    if (!projectId || !clientEmail || !privateKey) {
        logger(
            'warn',
            'Firebase Cloud Messaging disabled: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY are required'
        );
        return false;
    }

    try {
        if (!getApps().length) {
            initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
        }
        getMessaging();
        firebaseReady = true;
        logger('info', 'Firebase Cloud Messaging connection successful');
        return true;
    } catch (error) {
        logger('error', 'Firebase Cloud Messaging initialization failed', { message: error.message });
        return false;
    }
};

export const isFirebaseReady = () => firebaseReady;

export const getFirebaseMessaging = () => {
    if (!firebaseReady) throw new Error('Firebase Cloud Messaging is not configured');
    return getMessaging();
};
