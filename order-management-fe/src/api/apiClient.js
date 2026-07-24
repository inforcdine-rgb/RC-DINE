import axios from 'axios';
import CryptoJS from 'crypto-js';
import { toast } from 'react-toastify';
import env from '../config/env';
import store from '../store';
import { setIsLoading } from '../store/slice/app.slice';
import { trackBackgroundRequestEnd, trackBackgroundRequestStart } from '../utils/refreshBus';

export const instance = axios.create({
    baseURL: env.baseUrl,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

const ERROR_MESSAGE = ['TOKEN_NOT_FOUND', 'TOKEN_VERIFICATION_FAILED'];
const CACHE_PREFIX = 'rcdine-api-cache:';
const MAX_CACHE_BYTES = 350000;
const MAX_CACHE_ENTRIES = 40;
const CACHE_MAX_AGE = 24 * 60 * 60 * 1000;
const CACHEABLE_PATHS = [
    /^\/menu\//,
    /^\/notification(?:\/customer)?(?:\?|$)/,
    /^\/table\//,
    /^\/hotel\/dashboard\//,
    /^\/hotel\/[^/]+\/payment-settings(?:\?|$)/,
    /^\/order\/(?:active|completed|details|table)\//,
    /^\/order\/menu(?:\?|$)/,
    /^\/order\/[^/]+(?:\/status|\/details)?(?:\?|$)/
];

const isGetRequest = (config = {}) => String(config.method).toLowerCase() === 'get';
const isCacheableRequest = (config = {}) => {
    const path = String(config.url || '').replace(instance.defaults.baseURL || '', '');
    return isGetRequest(config) && CACHEABLE_PATHS.some((pattern) => pattern.test(path));
};
const getCacheKey = (config = {}) => {
    const token = localStorage.getItem('token') || localStorage.getItem('rcCustomerToken') || 'public';
    const scope = CryptoJS.SHA256(token).toString().slice(0, 12);
    return `${CACHE_PREFIX}${scope}:${config.url || ''}:${JSON.stringify(config.params || {})}`;
};

let foregroundRequestCount = 0;

const startRequest = (config) => {
    if (config.__showGlobalLoader) {
        foregroundRequestCount += 1;
        if (foregroundRequestCount === 1) store.dispatch(setIsLoading(true));
    }
    if (config.__backgroundRequest) trackBackgroundRequestStart();
};

const finishRequest = (config = {}) => {
    if (config.__requestFinished) return;
    config.__requestFinished = true;

    if (config.__showGlobalLoader) {
        foregroundRequestCount = Math.max(0, foregroundRequestCount - 1);
        if (foregroundRequestCount === 0) store.dispatch(setIsLoading(false));
    }
    if (config.__backgroundRequest) trackBackgroundRequestEnd();
};

const pruneCache = () => {
    const entries = [];
    for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        if (!key?.startsWith(CACHE_PREFIX)) continue;
        try {
            const cached = JSON.parse(localStorage.getItem(key) || 'null');
            if (!cached || Date.now() - cached.cachedAt > CACHE_MAX_AGE) {
                localStorage.removeItem(key);
            } else {
                entries.push({ key, cachedAt: cached.cachedAt });
            }
        } catch (error) {
            localStorage.removeItem(key);
        }
    }

    entries
        .sort((first, second) => second.cachedAt - first.cachedAt)
        .slice(MAX_CACHE_ENTRIES)
        .forEach(({ key }) => localStorage.removeItem(key));
};

const getCachedResponse = (config) => {
    if (!isCacheableRequest(config)) return null;
    try {
        const key = getCacheKey(config);
        const cached = JSON.parse(localStorage.getItem(key) || 'null');
        if (!cached) return null;
        if (Date.now() - cached.cachedAt > CACHE_MAX_AGE) {
            localStorage.removeItem(key);
            return null;
        }
        return cached;
    } catch (error) {
        return null;
    }
};

const reportNetworkState = (online) => {
    window.__rcdineNetworkOffline = !online;
    window.dispatchEvent(new CustomEvent('rcdine:network-state', { detail: { online } }));
};

const cacheGetResponse = (response) => {
    if (!isCacheableRequest(response?.config) || response?.fromCache) return;
    try {
        const value = JSON.stringify({ data: response.data, cachedAt: Date.now() });
        if (value.length <= MAX_CACHE_BYTES) {
            localStorage.setItem(getCacheKey(response.config), value);
            pruneCache();
        }
    } catch (error) {
        // Storage can be unavailable or full; live data must still render.
    }
};

instance.interceptors.request.use(
    (config) => {
        const availableCache = getCachedResponse(config);
        const knownOffline = !navigator.onLine || window.__rcdineNetworkOffline;
        const cached = knownOffline ? availableCache : null;
        if (cached) {
            config.adapter = () => Promise.resolve({
                data: cached.data,
                status: 200,
                statusText: 'Offline cache',
                headers: {},
                config,
                request: null,
                fromCache: true
            });
        }

        if (availableCache && !cached) config.timeout = Math.min(config.timeout || 30000, 8000);
        config.__backgroundRequest = Boolean(window.__rcdineBackgroundRefresh);
        config.__showGlobalLoader = !config.__backgroundRequest && !cached;
        startRequest(config);
        const token = localStorage.getItem('token');
        if (token && !config.headers.Authorization) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Let the browser generate the multipart boundary for FormData uploads.
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
            delete config.headers.common?.['Content-Type'];
        }

        return config;
    },
    (error) => {
        finishRequest(error.config);
        return Promise.reject(error);
    }
);
instance.interceptors.response.use(
    (response) => {
        finishRequest(response.config);
        cacheGetResponse(response);
        if (!response.fromCache && navigator.onLine) reportNetworkState(true);
        return response;
    },
    (error) => {
        finishRequest(error.config);
        if (!error.response && isGetRequest(error.config)) {
            reportNetworkState(false);
            const cached = getCachedResponse(error.config);
            if (cached) {
                return {
                    data: cached.data,
                    status: 200,
                    statusText: 'Offline cache',
                    headers: {},
                    config: error.config,
                    request: error.request,
                    fromCache: true
                };
            }
        }
        if (error.response && ERROR_MESSAGE.includes(error.response.data?.message)) {
            localStorage.removeItem('token');
            localStorage.removeItem('data');
            localStorage.removeItem('user');
            sessionStorage.removeItem('token');

            const isCustomerPage =
                    window.location.pathname.includes('/order-placement') ||
                    window.location.pathname.includes('/order-tracking');

            if (!isCustomerPage) {
                window.location.replace('/login');
            }
        }

        if (
            error.response &&
            error.response.status === 403 &&
            error.response.data?.message === 'Subscription expired'
        ) {
            if (
                window.location.pathname !== '/subscription' &&
                window.location.pathname !== '/login' &&
                window.location.pathname !== '/'
            ) {
                let role = 'OWNER';
                try {
                    const encryptedData = localStorage.getItem('data');
                    if (encryptedData) {
                        const decrypted = CryptoJS.AES.decrypt(encryptedData, env.cryptoSecret).toString(
                            CryptoJS.enc.Utf8
                        );
                        if (decrypted) {
                            role = JSON.parse(decrypted).role;
                        }
                    }
                } catch (e) {
                    console.error('Failed to parse user role in apiClient:', e);
                }

                if (role === 'MANAGER') {
                    toast.error('Your cafe\'s subscription has expired. Please contact the owner.');
                    localStorage.clear();
                    sessionStorage.clear();
                    window.location.replace('/login');
                } else {
                    toast.error('Your trial/subscription has expired. Please subscribe to continue.');
                    window.location.replace('/subscription');
                }
            }
        }
        throw error;
    }
);

export const method = {
    GET: 'get',
    POST: 'post',
    PUT: 'put',
    PATCH: 'patch',
    DELETE: 'delete'
};

export const api = async (method, path, body) => {
    try {
        let res = {};
        switch (method) {
            case 'get':
                res = await instance.get(path);
                break;
            case 'post':
                res = await instance.post(path, body);
                break;
            case 'put':
                res = await instance.put(path, body);
                break;
            case 'patch':
                res = await instance.patch(path, body);
                break;
            case 'delete':
                res = await instance.delete(path, { data: body });
                break;
            default:
                throw new Error('Invalid Method');
        }
        return res.data;
    } catch (error) {
        throw new Error(error?.response?.data?.message || error.message);
    }
};
