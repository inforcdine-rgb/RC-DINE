/* global AbortController, caches, clients */

// Navigation HTML is always fetched from the network and is never cached.
// Hashed assets are verified and cached atomically so a partial deployment
// cannot leave the application on a blank screen.
const CACHE_VERSION = 'v13-network-first-shell';
const APP_SHELL_CACHE = `rcdine-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `rcdine-runtime-${CACHE_VERSION}`;
const NAVIGATION_TIMEOUT_MS = 6000;
const ASSET_TIMEOUT_MS = 12000;
const APP_SHELL = [
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
            caches.open(APP_SHELL_CACHE).then((cache) => cache.delete('/')),
            clients.claim()
        ])
    );
});

const fetchWithTimeout = async (input, options = {}, timeoutMs = NAVIGATION_TIMEOUT_MS) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(input, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(timeout);
    }
};

const cacheSuccessfulResponse = async (request, response) => {
    if (!response || !response.ok || response.type === 'opaque') return response;
    const cache = await caches.open(RUNTIME_CACHE);
    await cache.put(request, response.clone());
    return response;
};

const getStaticAssetUrls = (html) => {
    const urls = new Set();
    const attributePattern = /\b(?:src|href)=["']([^"']+)["']/g;
    let match = attributePattern.exec(html);
    while (match) {
        try {
            const url = new URL(match[1], self.location.origin);
            if (url.origin === self.location.origin && url.pathname.startsWith('/static/')) urls.add(url.href);
        } catch (_error) {
            // Ignore malformed optional asset URLs.
        }
        match = attributePattern.exec(html);
    }
    return [...urls];
};

const isUsableStaticAsset = (assetUrl, response) => {
    if (!response?.ok) return false;
    const pathname = new URL(assetUrl).pathname;
    const contentType = String(response.headers.get('content-type') || '').toLowerCase();
    if (pathname.endsWith('.js')) return /javascript|ecmascript/.test(contentType);
    if (pathname.endsWith('.css')) return contentType.includes('text/css');
    return true;
};

const getShellAssets = async (shellResponse) => {
    if (!shellResponse?.ok) return [];
    const html = await shellResponse.clone().text();
    return getStaticAssetUrls(html);
};

const cleanupOldCaches = async () => {
    const cacheKeys = await caches.keys();
    await Promise.all(
        cacheKeys
            .filter((key) => key.startsWith('rcdine-') && ![APP_SHELL_CACHE, RUNTIME_CACHE].includes(key))
            .map((key) => caches.delete(key))
    );
};

const cacheCompleteShellSnapshot = async (shellResponse, expectedVersion) => {
    const assetUrls = await getShellAssets(shellResponse);
    if (!assetUrls.length) throw new Error('Fresh app shell does not contain static assets');

    let versionVerified = !expectedVersion;
    const verifiedAssets = await Promise.all(
        assetUrls.map(async (assetUrl) => {
            let response = await caches.match(assetUrl);

            if (!isUsableStaticAsset(assetUrl, response)) {
                const request = new Request(assetUrl, { cache: 'no-store', credentials: 'same-origin' });
                response = await fetchWithTimeout(request, {}, ASSET_TIMEOUT_MS);
            }

            if (!isUsableStaticAsset(assetUrl, response)) {
                throw new Error(`Fresh app asset is unavailable: ${new URL(assetUrl).pathname}`);
            }

            if (expectedVersion && new URL(assetUrl).pathname.endsWith('.js')) {
                const source = await response.clone().text();
                if (source.includes(expectedVersion)) versionVerified = true;
            }

            return { assetUrl, response };
        })
    );

    if (!versionVerified) throw new Error('New deployment is still propagating. Please try again shortly.');

    const runtimeCache = await caches.open(RUNTIME_CACHE);
    await Promise.all(verifiedAssets.map(({ assetUrl, response }) => runtimeCache.put(assetUrl, response.clone())));
    const currentAssets = new Set(assetUrls);
    const cachedRequests = await runtimeCache.keys();
    await Promise.all(
        cachedRequests
            .filter((request) => {
                const url = new URL(request.url);
                return url.pathname.startsWith('/static/') && !currentAssets.has(url.href);
            })
            .map((request) => runtimeCache.delete(request))
    );

    await cleanupOldCaches();
    return assetUrls.length;
};

const fetchAndCacheFreshShell = async (request, expectedVersion) => {
    const shellUrl = new URL(request?.url || '/', self.location.origin);
    shellUrl.pathname = '/';
    shellUrl.search = '';
    shellUrl.searchParams.set(expectedVersion ? 'rcAppUpdate' : 'rcNavigation', expectedVersion || String(Date.now()));

    const shellResponse = await fetchWithTimeout(
        shellUrl.href,
        {
            cache: 'no-store',
            credentials: 'same-origin'
        },
        NAVIGATION_TIMEOUT_MS
    );
    if (!shellResponse.ok) throw new Error(`Fresh app shell returned ${shellResponse.status}`);
    const contentType = String(shellResponse.headers.get('content-type') || '').toLowerCase();
    if (!contentType.includes('text/html')) throw new Error('Fresh app shell did not return HTML');

    const assetCount = await cacheCompleteShellSnapshot(shellResponse, expectedVersion);
    return { shellResponse, assetCount };
};

const handleNavigationRequest = async (request) => {
    const requestUrl = new URL(request.url);
    const isFileNavigation = /\/[^/]+\.[a-z0-9]+$/i.test(requestUrl.pathname);
    const isStandaloneStaticPage = requestUrl.pathname.startsWith('/portfolio/');

    try {
        if (isFileNavigation || isStandaloneStaticPage) {
            return await fetchWithTimeout(request, { cache: 'no-store' });
        }

        // Return network HTML only after every referenced hashed asset is
        // available, so an incomplete/blank application is never shown.
        const { shellResponse } = await fetchAndCacheFreshShell(request);
        return shellResponse;
    } catch (_error) {
        if (isFileNavigation || isStandaloneStaticPage) {
            return (await caches.match(request)) || (await caches.match('/offline.html')) || Response.error();
        }
        return (await caches.match('/offline.html')) || Response.error();
    }
};

const prepareAppUpdate = async (version) => {
    const { assetCount } = await fetchAndCacheFreshShell(null, version);
    return { version, assetCount };
};

const handleStaticAssetRequest = async (request) => {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    const networkResponse = await fetch(request);
    return cacheSuccessfulResponse(request, networkResponse);
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
                icon: '/icons/icon-192.png',
                badge: '/icons/notification-badge.png',
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

    const requestedUrl = data.actionUrls?.[event.action] || data.url || '/orders';

    const targetUrl = addNotificationContext(requestedUrl, data.notificationId);

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
                    console.error('[RCDINE_PUSH_SW] Existing window navigation failed', error);
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
    if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
        return;
    }
    if (event.data?.type === 'APPLY_APP_UPDATE') {
        event.waitUntil(
            prepareAppUpdate(event.data.version)
                .then((result) => event.ports?.[0]?.postMessage({ ok: true, ...result }))
                .catch((error) =>
                    event.ports?.[0]?.postMessage({
                        ok: false,
                        message: error?.message || 'App update failed'
                    })
                )
        );
    }
});
