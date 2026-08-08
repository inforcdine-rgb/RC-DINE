/* global caches, clients */

const CACHE_VERSION = 'v8';
const APP_SHELL_CACHE = `rcdine-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `rcdine-runtime-${CACHE_VERSION}`;
const APP_SHELL = [
    '/',
    '/offline.html',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/icons/icon-maskable-192.png',
    '/icons/icon-maskable-512.png'
];

const toSameOriginUrl = (value, fallback = '/') => {
    try {
        const url = new URL(value || fallback, self.location.origin);
        return url.origin === self.location.origin ? url.href : new URL(fallback, self.location.origin).href;
    } catch (_error) {
        return new URL(fallback, self.location.origin).href;
    }
};

const addNotificationContext = (value, notificationId) => {
    const url = new URL(toSameOriginUrl(value));
    if (notificationId) url.searchParams.set('rcNotification', notificationId);
    return url.href;
};

const parseJsonValue = (value, fallback) => {
    if (typeof value !== 'string') return value ?? fallback;
    try {
        return JSON.parse(value);
    } catch (_error) {
        return fallback;
    }
};

const normalizePayload = (raw = {}) => {
    const data = raw.data || raw;
    const meta = parseJsonValue(data.meta, {}) || {};
    return {
        ...data,
        title: data.title || 'R&C Dine',
        body: data.message || data.body || 'New update received',
        image: data.image || '',
        icon: data.icon || '',
        badge: data.badge || '',
        path: data.path || '/',
        notificationId: data.notificationId || '',
        entityId: data.entityId || data.orderId || meta.orderId || meta.requestId || '',
        type: data.type || meta.action || 'UPDATE',
        category: data.category || meta.category || 'GENERAL',
        silent: data.silent === true || data.silent === 'true',
        requireInteraction: data.requireInteraction === true || data.requireInteraction === 'true',
        vibrate: parseJsonValue(data.vibrate, undefined),
        actions: parseJsonValue(data.actions, undefined),
        meta
    };
};

const getWindowClients = () => clients.matchAll({ type: 'window', includeUncontrolled: true });

const postToClients = async (payload, windowClients) => {
    const clientList = windowClients || (await getWindowClients());
    clientList.forEach((client) => client.postMessage({ type: 'PUSH_NOTIFICATION', payload }));
};

const logPushEvent = (event, details = {}) => {
    console.info('[RCDINE_PUSH_SW]', { event, ...details, timestamp: new Date().toISOString() });
};

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(APP_SHELL_CACHE)
            .then((cache) => Promise.allSettled(APP_SHELL.map((url) => cache.add(url))))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            caches
                .keys()
                .then((keys) =>
                    Promise.all(
                        keys
                            .filter(
                                (key) => key.startsWith('rcdine-') && ![APP_SHELL_CACHE, RUNTIME_CACHE].includes(key)
                            )
                            .map((key) => caches.delete(key))
                    )
                ),
            clients.claim()
        ])
    );
});

const cacheSuccessfulResponse = async (request, response) => {
    if (!response || !response.ok || response.type === 'opaque') return response;
    const cache = await caches.open(RUNTIME_CACHE);
    await cache.put(request, response.clone());
    return response;
};

const handleNavigationRequest = async (request) => {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            await cache.put('/', response.clone());
            return response;
        }

        // A static host without an SPA rewrite returns 404 for routes such as
        // /orders or /cart/:id. Serve the cached React shell in that case.
        return (await caches.match('/')) || response;
    } catch (_error) {
        return (await caches.match(request)) || (await caches.match('/')) || caches.match('/offline.html');
    }
};

const handleStaticAssetRequest = async (request) => {
    const cachedResponse = await caches.match(request);
    const networkResponse = fetch(request)
        .then((response) => cacheSuccessfulResponse(request, response))
        .catch(() => null);
    return cachedResponse || networkResponse;
};

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const requestUrl = new URL(request.url);
    if (requestUrl.origin !== self.location.origin) return;

    if (request.mode === 'navigate') {
        event.respondWith(handleNavigationRequest(request));
        return;
    }

    const cacheablePublicAsset =
        ['/static/', '/icons/', '/sounds/'].some((path) => requestUrl.pathname.startsWith(path)) ||
        ['/fevicon.ico', '/R-C%20DINE.png', '/R-C DINE.png'].includes(requestUrl.pathname);

    if (cacheablePublicAsset && ['style', 'script', 'image', 'font', 'audio'].includes(request.destination)) {
        event.respondWith(handleStaticAssetRequest(request));
    }
});

self.addEventListener('push', (event) => {
    let raw = {};
    try {
        raw = event.data ? event.data.json() : {};
    } catch (_error) {
        raw = { message: event.data?.text() || 'New update received' };
    }

    const payload = normalizePayload(raw);
    const isNewOrder = payload.type === 'NEW_ORDER';
    const targetUrl = toSameOriginUrl(payload.path);
    const payloadActions = Array.isArray(payload.actions) ? payload.actions.slice(0, 2) : [];
    const actions = payloadActions.map(({ action, title, icon }) => ({ action, title, icon }));
    const actionUrls = payloadActions.reduce((result, action) => {
        if (action.action && action.path) {
            result[action.action] = toSameOriginUrl(action.path);
        }
        return result;
    }, {});

    event.waitUntil(
        (async () => {
            const clientList = await getWindowClients();
            await postToClients(payload, clientList);
            // Always create an operating-system notification. This puts the
            // notification in Android's notification shade and the desktop
            // notification center whether the PWA is open, minimized or closed.
            await self.registration.showNotification(payload.title, {
                body: payload.body,
                icon: payload.icon || '/icons/icon-192.png',
                badge: payload.badge || '/icons/icon-192.png',
                image: payload.image || undefined,
                tag: payload.dedupeKey || payload.notificationId || payload.entityId || `rcdine-${payload.type}`,
                renotify: true,
                requireInteraction:
                    typeof payload.requireInteraction === 'boolean' ? payload.requireInteraction : isNewOrder,
                silent: payload.silent === true,
                vibrate: payload.vibrate || (isNewOrder ? [250, 100, 250, 100, 350] : [120, 60, 120]),
                timestamp: payload.createdAt ? new Date(payload.createdAt).getTime() : Date.now(),
                actions,
                data: {
                    url: targetUrl,
                    actionUrls,
                    preservePath: Boolean(payload.preservePath),
                    notificationId: payload.notificationId,
                    entityId: payload.entityId,
                    type: payload.type,
                    category: payload.category,
                    meta: payload.meta
                }
            });
            logPushEvent('browser_notification_shown', {
                notificationId: payload.notificationId,
                type: payload.type
            });
        })()
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'dismiss') return;

    const data = event.notification?.data || {};

    const requestedUrl =
        data.actionUrls?.[event.action] ||
        data.url ||
        '/orders';

    const targetUrl = addNotificationContext(
        requestedUrl,
        data.notificationId
    );

    event.waitUntil(
        (async () => {
            const clientList = await clients.matchAll({
                type: 'window',
                includeUncontrolled: true
            });

            for (const client of clientList) {
                try {
                    const clientUrl = new URL(client.url);

                    if (clientUrl.origin !== self.location.origin) {
                        continue;
                    }

                    let targetClient = client;

                    // Pehle required route par navigate karo
                    if ('navigate' in client) {
                        const navigatedClient = await client.navigate(targetUrl);

                        if (navigatedClient) {
                            targetClient = navigatedClient;
                        }
                    }

                    // Phir app ko foreground me lao
                    if ('focus' in targetClient) {
                        await targetClient.focus();
                    }

                    targetClient.postMessage({
                        type: 'NOTIFICATION_CLICKED',
                        payload: {
                            ...data,
                            url: targetUrl
                        }
                    });

                    return;
                } catch (error) {
                    console.error(
                        '[RCDINE_PUSH_SW] Existing window navigation failed',
                        error
                    );
                }
            }

            // App completely closed ho to nayi PWA/window kholo
            if (clients.openWindow) {
                const openedClient = await clients.openWindow(targetUrl);

                if (openedClient && 'focus' in openedClient) {
                    await openedClient.focus();
                }
            }
        })()
    );
});

self.addEventListener('pushsubscriptionchange', (event) => {
    const options = event.oldSubscription?.options;
    event.waitUntil(
        (async () => {
            let subscription = null;
            if (options?.applicationServerKey) {
                subscription = await self.registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: options.applicationServerKey
                });
            }
            const clientList = await getWindowClients();
            clientList.forEach((client) =>
                client.postMessage({
                    type: 'PUSH_SUBSCRIPTION_CHANGED',
                    subscription: subscription?.toJSON() || null
                })
            );
            logPushEvent('subscription_changed', { renewed: Boolean(subscription) });
        })()
    );
});

self.addEventListener('message', (event) => {
    if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
