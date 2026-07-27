import { api, method } from '../api/apiClient';

export const createEnquiry = (payload) => api(method.POST, '/contact-enquiries/public', payload);
export const getEnquiries = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api(method.GET, `/contact-enquiries${query ? `?${query}` : ''}`);
};
export const updateEnquiry = (id, payload) => api(method.PATCH, `/contact-enquiries/${id}`, payload);
