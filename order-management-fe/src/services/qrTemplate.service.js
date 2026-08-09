import { api, method } from '../api/apiClient';

export const getActive = () => api(method.GET, '/admin/qr-templates/active');
