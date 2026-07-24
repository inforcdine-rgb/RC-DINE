import { api, method } from '../api/apiClient';

export const getManagerRcSession = (tableId) => api(method.GET, `/rc-session/manager/table/${tableId}`);
export const setManagerTableAction = (tableId, action) =>
    api(method.PATCH, `/rc-session/manager/table/${tableId}/action`, { action });
export const closeManagerRcSession = (tableId, keepTableActive = false) =>
    api(method.POST, `/rc-session/manager/table/${tableId}/close`, { keepTableActive });
