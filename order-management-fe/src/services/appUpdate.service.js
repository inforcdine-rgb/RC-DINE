import { APP_VERSION } from '../generated/appVersion';

const APP_UPDATE_STATE_KEY = 'rcdineAppUpdateState';
const APP_UPDATE_NOTIFICATION_ID = 'rcdine-app-update';
const REMINDER_INTERVAL_MS = 5 * 60 * 60 * 1000;
const VERSION_CHECK_INTERVAL_MS = 30 * 60 * 1000;

let currentRegistration = null;
let lifecycleInitialized = false;
let reminderTimer = null;
let checkPromise = null;
let lastVersionCheckAt = 0;
let applyingUpdate = false;

const readState = () => {
    try {
        return JSON.parse(localStorage.getItem(APP_UPDATE_STATE_KEY) || 'null');
    } catch (_error) {
        return null;
    }
};

const saveState = (state) => {
    if (state) localStorage.setItem(APP_UPDATE_STATE_KEY, JSON.stringify(state));
    else localStorage.removeItem(APP_UPDATE_STATE_KEY);
};

export const getAppUpdateNotification = () => {
    const state = readState();
    if (!state?.available || !state.visible || state.targetVersion === APP_VERSION) return null;
    return {
        id: `${APP_UPDATE_NOTIFICATION_ID}-${state.targetVersion}`,
        notificationId: `${APP_UPDATE_NOTIFICATION_ID}-${state.targetVersion}`,
        title: state.applying ? 'Updating R&C Dine...' : 'R&C Dine update ready',
        message: state.applying
            ? 'Please wait. The latest app files are being prepared.'
            : 'A new improved version is ready. Update now to use the latest features.',
        category: 'GENERAL',
        type: 'APP_UPDATE',
        createdAt: new Date(state.lastPromptAt || state.availableAt || Date.now()).toISOString(),
        isRead: false,
        status: 'ACTIVE',
        localOnly: true,
        appUpdate: true,
        applying: Boolean(state.applying),
        targetVersion: state.targetVersion
    };
};

const publishState = ({ ring = false } = {}) => {
    const notification = getAppUpdateNotification();
    window.dispatchEvent(new CustomEvent('rcdine:app-update-state', { detail: { notification } }));
    if (ring && notification) {
        window.dispatchEvent(new CustomEvent('rcdine:notification', { detail: notification }));
    }
};

const scheduleReminder = () => {
    if (reminderTimer) window.clearTimeout(reminderTimer);
    const state = readState();
    if (!state?.available || state.targetVersion === APP_VERSION) return;
    const delay = Math.max(1000, Number(state.nextPromptAt || Date.now()) - Date.now());
    reminderTimer = window.setTimeout(
        () => {
            const latestState = readState();
            if (!latestState?.available || latestState.targetVersion === APP_VERSION) return;
            const now = Date.now();
            saveState({
                ...latestState,
                visible: true,
                applying: false,
                lastPromptAt: now,
                nextPromptAt: now + REMINDER_INTERVAL_MS
            });
            publishState({ ring: true });
            scheduleReminder();
        },
        Math.min(delay, 2147483647)
    );
};

const clearAppUpdate = () => {
    if (reminderTimer) window.clearTimeout(reminderTimer);
    reminderTimer = null;
    saveState(null);
    publishState();
};

const registerAvailableVersion = ({ version, builtAt }) => {
    const now = Date.now();
    const current = readState();
    const targetChanged = current?.targetVersion !== version;
    const reminderDue = !current?.nextPromptAt || now >= Number(current.nextPromptAt);
    const shouldPrompt = targetChanged || reminderDue;
    const next = {
        available: true,
        targetVersion: version,
        builtAt: builtAt || null,
        availableAt: targetChanged ? now : current.availableAt || now,
        visible: shouldPrompt ? true : Boolean(current.visible),
        applying: false,
        lastPromptAt: shouldPrompt ? now : current.lastPromptAt || now,
        nextPromptAt: shouldPrompt ? now + REMINDER_INTERVAL_MS : current.nextPromptAt
    };
    saveState(next);
    publishState({ ring: shouldPrompt });
    scheduleReminder();
};

export const checkForAppUpdate = async ({ force = false } = {}) => {
    if (!navigator.onLine) return null;
    if (!force && Date.now() - lastVersionCheckAt < 60 * 1000) return getAppUpdateNotification();
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
            clearAppUpdate();
            return null;
        }
        registerAvailableVersion(latest);
        return getAppUpdateNotification();
    })()
        .catch((error) => {
            console.warn('R&C Dine update check failed:', error?.message || error);
            return getAppUpdateNotification();
        })
        .finally(() => {
            checkPromise = null;
        });

    return checkPromise;
};

export const snoozeAppUpdate = () => {
    const state = readState();
    if (!state?.available) return;
    const now = Date.now();
    saveState({
        ...state,
        visible: false,
        applying: false,
        nextPromptAt: now + REMINDER_INTERVAL_MS
    });
    publishState();
    scheduleReminder();
};

const requestServiceWorkerUpdate = (registration, targetVersion) =>
    new Promise((resolve, reject) => {
        const messageChannel = new MessageChannel();
        const timeout = window.setTimeout(() => reject(new Error('App update timed out. Please try again.')), 30000);
        messageChannel.port1.onmessage = (event) => {
            window.clearTimeout(timeout);
            if (event.data?.ok) resolve(event.data);
            else reject(new Error(event.data?.message || 'App update could not be prepared'));
        };
        registration.active.postMessage(
            {
                type: 'APPLY_APP_UPDATE',
                version: targetVersion
            },
            [messageChannel.port2]
        );
    });

export const applyAppUpdate = async () => {
    if (applyingUpdate) return;
    const state = readState();
    if (!state?.available) throw new Error('No app update is currently available');
    applyingUpdate = true;
    saveState({ ...state, visible: true, applying: true });
    publishState();

    try {
        const registration = currentRegistration || (await navigator.serviceWorker.ready);
        if (!registration?.active) throw new Error('App update service is not ready');
        await requestServiceWorkerUpdate(registration, state.targetVersion);
        saveState(null);
        publishState();
        window.setTimeout(() => window.location.reload(), 80);
    } catch (error) {
        applyingUpdate = false;
        const latestState = readState();
        if (latestState) saveState({ ...latestState, visible: true, applying: false });
        publishState();
        throw error;
    }
};

export const initializeAppUpdateLifecycle = (registration) => {
    if (registration) currentRegistration = registration;
    if (lifecycleInitialized) {
        checkForAppUpdate({ force: true });
        return;
    }
    lifecycleInitialized = true;

    const checkWhenAvailable = () => checkForAppUpdate();
    const checkWhenVisible = () => {
        if (document.visibilityState === 'visible') checkForAppUpdate();
    };

    window.addEventListener('online', checkWhenAvailable, { passive: true });
    window.addEventListener('focus', checkWhenAvailable, { passive: true });
    document.addEventListener('visibilitychange', checkWhenVisible, { passive: true });
    window.setInterval(() => checkForAppUpdate({ force: true }), VERSION_CHECK_INTERVAL_MS);
    checkForAppUpdate({ force: true });
    scheduleReminder();
};

export const getCurrentAppVersion = () => APP_VERSION;
