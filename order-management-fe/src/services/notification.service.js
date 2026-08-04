import { getApp, getApps, initializeApp } from 'firebase/app';
import { deleteToken, getMessaging, getToken, isSupported as isFirebaseMessagingSupported } from 'firebase/messaging';
import { api, instance, method } from '../api/apiClient';
import env from '../config/env';
import { bindNotificationPresence, clearNotificationPresence } from './socket.service';

const DEVICE_ID_KEY = 'rcdinePushDeviceId';
const PRESENCE_TOKEN_KEY = 'rcdinePushPresenceToken';
const LAST_SYNC_KEY = 'rcdinePushLastSync';
const FCM_TOKEN_KEY = 'rcdineFcmToken';
const SYNC_INTERVAL_MS = 5 * 60 * 1000;
const NOTIFICATION_QUERY_KEY = 'rcNotification';
let lifecycleInitialized = false;
let vapidKeyPromise = null;
const syncPromises = new Map();
let firebaseMessagingPromise = null;

const logPushEvent = (event, details = {}) => {
    console.info('[RCDINE_PUSH]', { event, ...details, timestamp: new Date().toISOString() });
};

const normalizeVapidKey = (value) =>
    String(value || '')
        .trim()
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};

const validateVapidKey = (value) => {
    const key = urlBase64ToUint8Array(value);
    if (key.length !== 65) throw new Error('REACT_APP_NOTIFICATION_KEY is not a valid Web Push public key');
    return key;
};

const getVapidPublicKey = async () => {
    if (!vapidKeyPromise) {
        vapidKeyPromise = instance
            .get('/notification/public-config')
            .then((response) => {
                const config = response.data || {};
                if (!config.enabled || !config.vapidPublicKey) {
                    throw new Error(
                        'Backend Web Push is not configured. Set WEB_PUSH_PUBLIC_KEY, WEB_PUSH_PRIVATE_KEY and WEB_PUSH_EMAIL.'
                    );
                }
                const key = normalizeVapidKey(config.vapidPublicKey);
                validateVapidKey(key);
                return key;
            })
            .catch((error) => {
                const fallbackKey = normalizeVapidKey(env.notificationKey);
                if (fallbackKey) {
                    validateVapidKey(fallbackKey);
                    logPushEvent('vapid_key_fallback', { source: 'frontend_env' });
                    return fallbackKey;
                }
                vapidKeyPromise = null;
                throw error;
            });
    }
    return vapidKeyPromise;
};

const arrayBufferToBase64Url = (buffer) => {
    if (!buffer) return '';
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
    });
    return normalizeVapidKey(window.btoa(binary));
};

const createDeviceId = () => {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `web-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const getDeviceId = () => {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
        deviceId = createDeviceId();
        localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
};

export const getCustomerNotificationToken = () =>
    localStorage.getItem('rcCustomerToken') || localStorage.getItem('rcCustomerPushToken') || '';

const getPlatform = () => {
    const ua = navigator.userAgent || '';
    if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
    if (/Android/.test(ua)) return 'android';
    return 'desktop';
};

const hasFirebaseConfig = () =>
    Boolean(
        env.firebase.apiKey &&
        env.firebase.authDomain &&
        env.firebase.projectId &&
        env.firebase.messagingSenderId &&
        env.firebase.appId &&
        env.firebase.vapidKey
    );

const getFirebaseMessagingInstance = async () => {
    if (!hasFirebaseConfig()) return null;
    if (!firebaseMessagingPromise) {
        firebaseMessagingPromise = (async () => {
            if (!(await isFirebaseMessagingSupported())) return null;
            const app = getApps().length
                ? getApp()
                : initializeApp({
                    apiKey: env.firebase.apiKey,
                    authDomain: env.firebase.authDomain,
                    projectId: env.firebase.projectId,
                    storageBucket: env.firebase.storageBucket,
                    messagingSenderId: env.firebase.messagingSenderId,
                    appId: env.firebase.appId
                });
            return getMessaging(app);
        })().catch((error) => {
            firebaseMessagingPromise = null;
            throw error;
        });
    }
    return firebaseMessagingPromise;
};

export const getPushCapability = () => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent || '');
    const standalone =
        window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
    return {
        supported,
        permission: supported ? Notification.permission : 'unsupported',
        needsIosInstall: supported && ios && !standalone
    };
};

export const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) return null;
    const registration = await navigator.serviceWorker.register('/serviceWorker.js', { scope: '/' });
    const readyRegistration = await navigator.serviceWorker.ready;
    registration.update().catch(() => { });
    logPushEvent('service_worker_ready', { scope: readyRegistration.scope });
    return readyRegistration;
};

export const subscribe = async (payload) => api(method.POST, '/notification/subscribe', payload);
export const unsubscribe = async (payload) => api(method.POST, '/notification/unsubscribe', payload);
export const fetch = async (query = '') => api(method.GET, `/notification${query}`);
export const update = async (notificationId) =>
    api(method.PUT, notificationId ? `/notification/${notificationId}/read` : '/notification');
export const remove = async (notificationId) => api(method.DELETE, `/notification/${notificationId}`);
export const clear = async () => api(method.DELETE, '/notification');
export const restore = async (notificationId) => api(method.POST, `/notification/${notificationId}/restore`);

const customerApi = async (requestMethod, path, body, token = getCustomerNotificationToken()) => {
    if (!token) throw new Error('Customer notification login required');
    const response = await instance.request({
        method: requestMethod,
        url: `/notification/customer${path}`,
        data: body,
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const fetchCustomerNotifications = (query = '', token) => customerApi('get', `${query}`, undefined, token);
export const readCustomerNotification = (notificationId, token) =>
    customerApi('put', notificationId ? `/${notificationId}/read` : '/', undefined, token);
export const deleteCustomerNotification = (notificationId, token) =>
    customerApi('delete', `/${notificationId}`, undefined, token);
export const clearCustomerNotifications = (token) => customerApi('delete', '/', undefined, token);
export const restoreCustomerNotification = (notificationId, token) =>
    customerApi('post', `/${notificationId}/restore`, undefined, token);
export const testWebPush = ({ audience = 'manager', token } = {}) =>
    audience === 'customer'
        ? customerApi('post', '/test', {}, token)
        : api(method.POST, '/notification/test', {});

const syncSubscription = async ({ audience, token }) => {
    const registration = await registerServiceWorker();
    const configuredVapidKey = await getVapidPublicKey();
    let subscription = await registration.pushManager.getSubscription();
    const subscribedVapidKey = arrayBufferToBase64Url(subscription?.options?.applicationServerKey);

    if (subscription && subscribedVapidKey && subscribedVapidKey !== configuredVapidKey) {
        logPushEvent('subscription_key_changed');
        await subscription.unsubscribe();
        subscription = null;
    }

    if (!subscription) {
        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: validateVapidKey(configuredVapidKey)
        });
        logPushEvent('subscription_created', { audience });
    }

    const deviceId = getDeviceId();
    const payload = {
        ...subscription.toJSON(),
        deviceId,
        platform: getPlatform()
    };
    const result =
        audience === 'customer' ? await customerApi('post', '/subscribe', payload, token) : await subscribe(payload);

    if (result?.vapidPublicKey && normalizeVapidKey(result.vapidPublicKey) !== configuredVapidKey) {
        try {
            const unsubscribePayload = { deviceId, endpoint: subscription.endpoint };
            if (audience === 'customer') {
                await customerApi('post', '/unsubscribe', unsubscribePayload, token);
            } else {
                await unsubscribe(unsubscribePayload);
            }
        } catch (_error) {
            // The local subscription is still removed below so a bad key is never retained.
        }
        await subscription.unsubscribe();
        throw new Error('Frontend and backend Web Push public keys do not match');
    }

    if (result?.presenceToken) {
        localStorage.setItem(PRESENCE_TOKEN_KEY, result.presenceToken);
        bindNotificationPresence(result.presenceToken);
    }
    localStorage.setItem(LAST_SYNC_KEY, String(Date.now()));
    logPushEvent('subscription_synchronized', { audience, deviceId });
    return { subscription, ...result, status: 'enabled' };
};

const syncFcmSubscription = async ({ audience, token }) => {
    const registration = await registerServiceWorker();
    const messaging = await getFirebaseMessagingInstance();
    if (!messaging) throw new Error('Firebase Messaging is not supported on this browser');

    const fcmToken = await getToken(messaging, {
        vapidKey: env.firebase.vapidKey,
        serviceWorkerRegistration: registration
    });
    if (!fcmToken) throw new Error('Firebase did not return a notification token');

    const deviceId = getDeviceId();
    const payload = { token: fcmToken, deviceId, platform: getPlatform() };
    const result =
        audience === 'customer'
            ? await customerApi('post', '/fcm/subscribe', payload, token)
            : await api(method.POST, '/notification/fcm/subscribe', payload);

    localStorage.setItem(FCM_TOKEN_KEY, fcmToken);
    if (result?.presenceToken) {
        localStorage.setItem(PRESENCE_TOKEN_KEY, result.presenceToken);
        bindNotificationPresence(result.presenceToken);
    }
    localStorage.setItem(LAST_SYNC_KEY, String(Date.now()));
    logPushEvent('fcm_subscription_synchronized', { audience, deviceId });
    return { ...result, status: 'enabled', provider: 'FCM' };
};

export const enableWebPush = async ({ audience = 'manager', token, requestPermission = true } = {}) => {
    const capability = getPushCapability();
    if (!capability.supported) {
        logPushEvent('permission_checked', { permission: 'unsupported' });
        return { status: 'unsupported' };
    }
    if (capability.needsIosInstall) {
        logPushEvent('permission_checked', { permission: capability.permission, needsIosInstall: true });
        return { status: 'ios-install-required' };
    }
    let permission = Notification.permission;
    if (permission === 'default' && requestPermission) {
        permission = await Notification.requestPermission();
    }
    logPushEvent('permission_checked', { permission, requested: requestPermission });
    if (permission !== 'granted') return { status: permission };

    const syncKey = `${audience}:${token || 'authenticated-manager'}`;
    if (!syncPromises.has(syncKey)) {
        const promise = (async () => {
            if (hasFirebaseConfig()) {
                try {
                    return await syncFcmSubscription({ audience, token });
                } catch (error) {
                    logPushEvent('fcm_subscription_failed_using_web_push_fallback', {
                        message: error?.message || String(error)
                    });
                }
            }
            return syncSubscription({ audience, token });
        })().finally(() => {
            syncPromises.delete(syncKey);
        });
        syncPromises.set(syncKey, promise);
    }
    return syncPromises.get(syncKey);
};

export const initializeWebPush = async ({ audience = 'manager', token } = {}) => {
    const capability = getPushCapability();
    if (!capability.supported) return { status: 'unsupported' };
    await registerServiceWorker();

    const presenceToken = localStorage.getItem(PRESENCE_TOKEN_KEY);
    if (presenceToken) bindNotificationPresence(presenceToken);

    if (Notification.permission === 'granted') {
        return enableWebPush({ audience, token, requestPermission: false });
    }
    return { status: Notification.permission };
};

export const showSystemNotificationTest = async () => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        throw new Error('Allow notifications from browser site settings first');
    }

    const registration = await registerServiceWorker();
    await registration.showNotification('R&C Dine notifications enabled', {
        body: 'Background notifications will appear here when the app is minimized or closed.',
        icon: '/R-C DINE.png',
        badge: '/R-C DINE.png',
        tag: `rcdine-system-test-${Date.now()}`,
        renotify: true,
        silent: false,
        vibrate: [180, 80, 180],
        data: {
            url: window.location.href,
            type: 'SYSTEM_TEST',
            category: 'GENERAL'
        }
    });
    logPushEvent('system_notification_test_shown');
};

export const unregisterCurrentDevice = async ({ audience = 'manager', token } = {}) => {
    if (!('serviceWorker' in navigator)) return;
    const registration = await navigator.serviceWorker.getRegistration('/');
    const subscription = await registration?.pushManager.getSubscription();
    const payload = {
        deviceId: getDeviceId(),
        endpoint: subscription?.endpoint
    };

    try {
        if (audience === 'customer') await customerApi('post', '/unsubscribe', payload, token);
        else await unsubscribe(payload);
    } finally {
        const savedFcmToken = localStorage.getItem(FCM_TOKEN_KEY);
        if (savedFcmToken) {
            try {
                const messaging = await getFirebaseMessagingInstance();
                if (messaging) await deleteToken(messaging);
            } catch (error) {
                logPushEvent('fcm_token_delete_failed', { message: error?.message || String(error) });
            }
        }
        await subscription?.unsubscribe();
        clearNotificationPresence();
        localStorage.removeItem(PRESENCE_TOKEN_KEY);
        localStorage.removeItem(LAST_SYNC_KEY);
        localStorage.removeItem(FCM_TOKEN_KEY);
        logPushEvent('subscription_removed', { audience, hadSubscription: Boolean(subscription) });
    }
};

export const initializeNotificationLifecycle = () => {
    if (lifecycleInitialized || !('serviceWorker' in navigator)) return;
    lifecycleInitialized = true;

    const silentSync = (force = false) => {
        if (!('Notification' in window) || Notification.permission !== 'granted' || !navigator.onLine) return;
        const lastSync = Number(localStorage.getItem(LAST_SYNC_KEY) || 0);
        if (!force && Date.now() - lastSync < SYNC_INTERVAL_MS) return;
        const customerToken = getCustomerNotificationToken();
        const audience = localStorage.getItem('token') ? 'manager' : 'customer';
        if (audience === 'customer' && !customerToken) return;
        enableWebPush({ audience, token: customerToken, requestPermission: false }).catch((error) => {
            logPushEvent('subscription_sync_failed', { message: error?.message || String(error) });
        });
    };

    const markClickedNotificationRead = async (payload = {}) => {
        const notificationId = payload.notificationId;
        if (!notificationId) return;

        try {
            if (localStorage.getItem('token')) {
                await update(notificationId);
            } else {
                const customerToken = getCustomerNotificationToken();
                if (customerToken) await readCustomerNotification(notificationId, customerToken);
            }
            window.dispatchEvent(
                new CustomEvent('rcdine:notification-read', { detail: { notificationId } })
            );
        } catch (error) {
            logPushEvent('notification_read_failed', {
                notificationId,
                message: error?.message || String(error)
            });
        }
    };

    const consumeNotificationLaunch = () => {
        const url = new URL(window.location.href);
        const notificationId = url.searchParams.get(NOTIFICATION_QUERY_KEY);
        if (!notificationId) return;

        url.searchParams.delete(NOTIFICATION_QUERY_KEY);
        window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
        markClickedNotificationRead({ notificationId });
        window.dispatchEvent(
            new CustomEvent('rcdine:notification-clicked', {
                detail: { notificationId, url: window.location.href }
            })
        );
    };

    navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'PUSH_SUBSCRIPTION_CHANGED') {
            localStorage.removeItem(LAST_SYNC_KEY);
            logPushEvent('subscription_changed');
            silentSync(true);
        }
        if (event.data?.type === 'PUSH_NOTIFICATION') {
            window.dispatchEvent(new CustomEvent('rcdine:notification', { detail: event.data.payload }));
            logPushEvent('push_received', {
                notificationId: event.data.payload?.notificationId,
                type: event.data.payload?.type
            });
        }
        if (event.data?.type === 'NOTIFICATION_CLICKED') {
            const payload = event.data.payload || {};
            markClickedNotificationRead(payload);
            window.dispatchEvent(new CustomEvent('rcdine:notification-clicked', { detail: payload }));
        }
    });

    window.addEventListener('online', () => silentSync(), { passive: true });
    window.addEventListener(
        'focus',
        () => {
            silentSync();
            consumeNotificationLaunch();
        },
        { passive: true }
    );
    window.addEventListener('rcdine:push-presence-invalid', () => {
        localStorage.removeItem(PRESENCE_TOKEN_KEY);
        localStorage.removeItem(LAST_SYNC_KEY);
        silentSync(true);
    });
    document.addEventListener(
        'visibilitychange',
        () => {
            if (document.visibilityState === 'visible') silentSync();
        },
        { passive: true }
    );
    navigator.serviceWorker.addEventListener('controllerchange', () => silentSync(true));
    window.setInterval(silentSync, SYNC_INTERVAL_MS);
    consumeNotificationLaunch();
};

export const registerWebPush = () => enableWebPush({ audience: 'manager', requestPermission: true });
