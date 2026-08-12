import { api, method } from '../api/apiClient';

const PUBLIC_SETTINGS_CACHE_KEY = 'rcdine-public-website-settings';

export const getCachedPublic = () => {
    try {
        return JSON.parse(localStorage.getItem(PUBLIC_SETTINGS_CACHE_KEY) || '{}');
    } catch (_error) {
        return {};
    }
};

export const getPublic = async ({ background = false } = {}) => {
    const settings = await api(method.GET, '/website-settings/public', undefined, {
        __backgroundRequest: background,
        timeout: background ? 10000 : 30000
    });

    try {
        localStorage.setItem(PUBLIC_SETTINGS_CACHE_KEY, JSON.stringify(settings || {}));
    } catch (_error) {
        // Landing content must still render when browser storage is unavailable.
    }

    return settings;
};
export const getAdmin = () => api(method.GET, '/website-settings');
export const update = (payload) => api(method.PUT, '/website-settings', payload);
export const uploadLogo = (file) => {
    const data = new FormData();
    data.append('logo', file);
    return api(method.POST, '/website-settings/logo', data);
};
export const uploadVideo = (file) => {
    const data = new FormData();
    data.append('video', file);
    return api(method.POST, '/website-settings/video', data);
};
export const deleteVideo = () => api(method.DELETE, '/website-settings/video');
