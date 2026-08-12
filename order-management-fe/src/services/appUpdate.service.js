import { APP_VERSION } from '../generated/appVersion';

// App updates are deliberately silent and automatic. The old implementation
// stored an update notification and waited for the user to press a button;
// keep only its storage key long enough to remove stale cards on existing
// installations.
const LEGACY_APP_UPDATE_STATE_KEY = 'rcdineAppUpdateState';
const AUTO_UPDATE_SIGNAL_KEY = 'rcdineAutoUpdateSignal';
const VERSION_CHECK_INTERVAL_MS = 60 * 1000;
const VERSION_CHECK_THROTTLE_MS = 15 * 1000;

let currentRegistration = null;
let lifecycleInitialized = false;
let checkPromise = null;
let lastVersionCheckAt = 0;
let applyingUpdate = false;
let pendingTargetVersion = null;
let reloadScheduled = false;

const clearLegacyUpdateNotification = () => {
    let hadLegacyState = false;

    try {
        hadLegacyState = localStorage.getItem(LEGACY_APP_UPDATE_STATE_KEY) !== null;
        localStorage.removeItem(LEGACY_APP_UPDATE_STATE_KEY);
    } catch (_error) {
        // A blocked localStorage must never prevent an application update.
    }

    if (hadLegacyState) {
        window.dispatchEvent(
            new CustomEvent('rcdine:app-update-state', {
                detail: { notification: null }
            })
        );
    }
};

const scheduleReload = () => {
    if (reloadScheduled) return;
    reloadScheduled = true;
    window.setTimeout(() => window.location.reload(), 80);
};

const broadcastReload = (targetVersion) => {
    try {
        localStorage.setItem(AUTO_UPDATE_SIGNAL_KEY, JSON.stringify({ version: targetVersion, updatedAt: Date.now() }));
    } catch (_error) {
        // The current tab can still reload even if cross-tab signalling fails.
    }
};

// NotificationCenter still imports these functions. Returning null keeps old
// installations compatible while permanently removing the update card,
// update sound and Yes/Later controls from the visible notification list.
export const getAppUpdateNotification = () => null;

export const snoozeAppUpdate = () => {
    clearLegacyUpdateNotification();
};

const requestServiceWorkerUpdate = (registration, targetVersion) =>
    new Promise((resolve, reject) => {
        const messageChannel = new MessageChannel();
        const timeout = window.setTimeout(() => reject(new Error('Automatic app update timed out')), 30000);

        messageChannel.port1.onmessage = (event) => {
            window.clearTimeout(timeout);
            if (event.data?.ok) resolve(event.data);
            else reject(new Error(event.data?.message || 'Automatic app update could not be prepared'));
        };

        registration.active.postMessage(
            {
                type: 'APPLY_APP_UPDATE',
                version: targetVersion
            },
            [messageChannel.port2]
        );
    });

const installPendingUpdate = async (targetVersion) => {
    if (!targetVersion || targetVersion === APP_VERSION || applyingUpdate || reloadScheduled) return;

    applyingUpdate = true;
    clearLegacyUpdateNotification();

    try {
        const registration = currentRegistration || (await navigator.serviceWorker.ready);
        if (!registration?.active) throw new Error('App update service is not ready');

        // The worker verifies the new HTML and every hashed asset before this
        // resolves, so an incomplete deployment can never replace the current
        // working screen.
        await requestServiceWorkerUpdate(registration, targetVersion);
        pendingTargetVersion = null;
        broadcastReload(targetVersion);
        scheduleReload();
    } catch (error) {
        applyingUpdate = false;
        console.warn('R&C Dine automatic update deferred:', error?.message || error);
        // Keep the current working app open. The focus/online/timer checks will
        // retry automatically after Vercel finishes propagating the deployment.
    }
};

export const checkForAppUpdate = async ({ force = false } = {}) => {
    if (!navigator.onLine || reloadScheduled) return null;
    if (!force && Date.now() - lastVersionCheckAt < VERSION_CHECK_THROTTLE_MS) return null;
    if (checkPromise) return checkPromise;

    checkPromise = (async () => {
        lastVersionCheckAt = Date.now();
        const response = await fetch(`/app-version.json?check=${Date.now()}`, {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' }
        });
        if (!response.ok) throw new Error('Unable to check the latest R&C Dine version');

        const latest = await response.json();
        if (!latest.version || latest.version === APP_VERSION) {
            pendingTargetVersion = null;
            clearLegacyUpdateNotification();
            return null;
        }

        pendingTargetVersion = latest.version;
        await installPendingUpdate(latest.version);
        return null;
    })()
        .catch((error) => {
            console.warn('R&C Dine automatic update check deferred:', error?.message || error);
            return null;
        })
        .finally(() => {
            checkPromise = null;
        });

    return checkPromise;
};

// Kept as a compatibility export for any already-loaded NotificationCenter.
// New versions never require the user to call it.
export const applyAppUpdate = async () => {
    if (pendingTargetVersion) return installPendingUpdate(pendingTargetVersion);
    return checkForAppUpdate({ force: true });
};

export const initializeAppUpdateLifecycle = (registration) => {
    if (registration) currentRegistration = registration;
    clearLegacyUpdateNotification();

    if (lifecycleInitialized) {
        checkForAppUpdate({ force: true });
        return;
    }
    lifecycleInitialized = true;

    const checkWhenAvailable = () => checkForAppUpdate();
    const checkWhenVisible = () => {
        if (document.visibilityState === 'visible') checkForAppUpdate();
    };
    const reloadUpdatedTabs = (event) => {
        if (event.key !== AUTO_UPDATE_SIGNAL_KEY || !event.newValue) return;
        try {
            const signal = JSON.parse(event.newValue);
            if (signal?.version && signal.version !== APP_VERSION) scheduleReload();
        } catch (_error) {
            // Ignore malformed data left by browser extensions or old builds.
        }
    };

    window.addEventListener('online', checkWhenAvailable, { passive: true });
    window.addEventListener('focus', checkWhenAvailable, { passive: true });
    window.addEventListener('storage', reloadUpdatedTabs);
    document.addEventListener('visibilitychange', checkWhenVisible, { passive: true });
    window.setInterval(() => checkForAppUpdate({ force: true }), VERSION_CHECK_INTERVAL_MS);

    // Every fresh launch checks immediately instead of first showing an old
    // cached build or asking the user to approve an update.
    checkForAppUpdate({ force: true });
};

export const getCurrentAppVersion = () => APP_VERSION;
