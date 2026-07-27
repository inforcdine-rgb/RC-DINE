import { api, method } from '../api/apiClient';
export const getPublic = () => api(method.GET, '/website-settings/public');
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
