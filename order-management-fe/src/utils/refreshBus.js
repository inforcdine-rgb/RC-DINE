const refreshHandlers = new Map();
let activeRefresh = null;
let backgroundTasks = 0;
let backgroundRequestCount = 0;
let backgroundRequestVersion = 0;
const backgroundRequestWaiters = new Set();

const setBackgroundState = (active) => {
    backgroundTasks = Math.max(0, backgroundTasks + (active ? 1 : -1));
    window.__rcdineBackgroundRefresh = backgroundTasks > 0;
};

const captureScrollPosition = () => ({
    x: window.scrollX,
    y: window.scrollY,
    elements: [...document.querySelectorAll('[data-preserve-scroll]')].map((element) => ({
        element,
        left: element.scrollLeft,
        top: element.scrollTop
    }))
});

const restoreScrollPosition = ({ x, y, elements }) => {
    window.requestAnimationFrame(() => {
        window.scrollTo(x, y);
        elements.forEach(({ element, left, top }) => {
            if (document.contains(element)) element.scrollTo(left, top);
        });
    });
};

const notifyBackgroundRequestWaiters = () => {
    backgroundRequestWaiters.forEach((check) => check());
};

const afterNextPaint = (callback) => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(callback));
};

export const registerRefreshHandler = (key, handler) => {
    refreshHandlers.set(key, handler);
    return () => {
        if (refreshHandlers.get(key) === handler) refreshHandlers.delete(key);
    };
};

export const hasRefreshHandlers = () => refreshHandlers.size > 0;

export const getBackgroundRequestVersion = () => backgroundRequestVersion;

export const trackBackgroundRequestStart = () => {
    backgroundRequestCount += 1;
    backgroundRequestVersion += 1;
    notifyBackgroundRequestWaiters();
};

export const trackBackgroundRequestEnd = () => {
    backgroundRequestCount = Math.max(0, backgroundRequestCount - 1);
    backgroundRequestVersion += 1;
    notifyBackgroundRequestWaiters();
};

export const waitForBackgroundRequests = ({
    checkpoint = backgroundRequestVersion,
    startTimeout = 300,
    timeout = 30000
} = {}) => new Promise((resolve) => {
    let complete = false;
    let observedRequest = backgroundRequestVersion > checkpoint || backgroundRequestCount > 0;

    const finish = () => {
        if (complete) return;
        complete = true;
        backgroundRequestWaiters.delete(check);
        window.clearTimeout(startTimer);
        window.clearTimeout(timeoutTimer);
        afterNextPaint(resolve);
    };

    const check = () => {
        observedRequest = observedRequest || backgroundRequestVersion > checkpoint;
        if (observedRequest && backgroundRequestCount === 0) finish();
    };

    const startTimer = window.setTimeout(() => {
        if (!observedRequest) finish();
    }, startTimeout);
    const timeoutTimer = window.setTimeout(finish, timeout);

    backgroundRequestWaiters.add(check);
    check();
});

export const runBackgroundTask = async (task) => {
    setBackgroundState(true);
    try {
        return await task();
    } finally {
        setBackgroundState(false);
    }
};

export const runRefreshHandlers = () => {
    if (!navigator.onLine) return Promise.reject(new Error('You\'re offline'));
    if (activeRefresh) return activeRefresh;

    const scrollPosition = captureScrollPosition();
    const handlers = [...refreshHandlers.values()];

    activeRefresh = runBackgroundTask(async () => {
        const results = await Promise.allSettled(
            handlers.map((handler) => Promise.resolve().then(handler))
        );
        const successful = results.filter((result) => result.status === 'fulfilled');

        if (!successful.length && results.length) {
            throw results.find((result) => result.status === 'rejected').reason;
        }

        return successful.some(
            (result) => result.value === true || result.value?.changed === true
        );
    }).finally(() => {
        restoreScrollPosition(scrollPosition);
        activeRefresh = null;
    });

    return activeRefresh;
};
