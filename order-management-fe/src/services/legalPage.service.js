import { api, method } from '../api/apiClient';

export const getPublic = (slug) => api(method.GET, `/legal-pages/public/${slug}`);

export const getAdmin = (slug) => api(method.GET, `/legal-pages/${slug}`);

export const update = (slug, payload) => api(method.PUT, `/legal-pages/${slug}`, payload);
