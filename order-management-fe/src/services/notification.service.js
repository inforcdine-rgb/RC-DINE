import { api, instance, method } from '../api/apiClient';
import env from '../config/env';
import { bindNotificationPresence, clearNotificationPresence } from './socket.service';

const DEVICE_ID_KEY = 'rcdinePushDeviceId';
const PRESENCE_TOKEN_KEY = 'rcdinePushPresenceToken';
const LAST_SYNC_KEY = 'rcdinePushLastSync';
const SYNC_INTERVAL_MS = 5 * 60 * 1000;
let lifecycleInitialized = false;
const syncPromises = new Map();

const logPushEvent = (event, details = {}) => {
    console.info('[RCDINE_PUSH]', { event, ...details, timestamp: new Date().toISOString() });
};

const normalizeVapidKey = (value) => String(value || '')
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

export const getPushCapability = () => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent || '');
    const standalone = window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
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
    registration.update().catch(() => {});
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

const syncSubscription = async ({ audience, token }) => {
    const registration = await registerServiceWorker();
    const configuredVapidKey = normalizeVapidKey(env.notificationKey);
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
            applicationServerKey: urlBase64ToUint8Array(configuredVapidKey)
        });
        logPushEvent('subscription_created', { audience });
    }

    const deviceId = getDeviceId();
    const payload = {
        ...subscription.toJSON(),
        deviceId,
        platform: getPlatform()
    };
    const result = audience === 'customer'
        ? await customerApi('post', '/subscribe', payload, token)
        : await subscribe(payload);

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
    if (!env.notificationKey) {
        logPushEvent('subscription_sync_failed', { message: 'REACT_APP_NOTIFICATION_KEY is missing' });
        throw new Error('REACT_APP_NOTIFICATION_KEY is missing');
    }

    let permission = Notification.permission;
    if (permission === 'default' && requestPermission) {
        permission = await Notification.requestPermission();
    }
    logPushEvent('permission_checked', { permission, requested: requestPermission });
    if (permission !== 'granted') return { status: permission };

    const syncKey = `${audience}:${token || 'authenticated-manager'}`;
    if (!syncPromises.has(syncKey)) {
        const promise = syncSubscription({ audience, token }).finally(() => {
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
        await subscription?.unsubscribe();
        clearNotificationPresence();
        localStorage.removeItem(PRESENCE_TOKEN_KEY);
        localStorage.removeItem(LAST_SYNC_KEY);
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
    });

    window.addEventListener('online', () => silentSync(), { passive: true });
    window.addEventListener('focus', () => silentSync(), { passive: true });
    window.addEventListener('rcdine:push-presence-invalid', () => {
        localStorage.removeItem(PRESENCE_TOKEN_KEY);
        localStorage.removeItem(LAST_SYNC_KEY);
        silentSync(true);
    });
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') silentSync();
    }, { passive: true });
    navigator.serviceWorker.addEventListener('controllerchange', () => silentSync(true));
    window.setInterval(silentSync, SYNC_INTERVAL_MS);
};

export const registerWebPush = () => enableWebPush({ audience: 'manager', requestPermission: true });
