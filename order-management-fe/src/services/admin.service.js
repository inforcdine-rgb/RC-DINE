import { api, method } from '../api/apiClient';

export const dashboard = async () => {
    try {
        return await api(method.GET, '/admin/dashboard');
    } catch (error) {
        console.error(`Error fetching admin dashboard ${error}`);
        throw error;
    }
};

export const owners = async (query = {}) => {
    try {
        const searchParam = query.search ? `?search=${encodeURIComponent(query.search)}` : '';
        return await api(method.GET, `/admin/owners${searchParam}`);
    } catch (error) {
        console.error(`Error fetching admin owners ${error}`);
        throw error;
    }
};

export const ownerDetail = async (id) => {
    try {
        return await api(method.GET, `/admin/owners/${id}`);
    } catch (error) {
        console.error(`Error fetching admin owner detail ${error}`);
        throw error;
    }
};

export const blockOwner = async (id) => {
    try {
        return await api(method.PATCH, `/admin/owners/${id}/block`);
    } catch (error) {
        console.error(`Error blocking owner ${error}`);
        throw error;
    }
};

export const extendSubscription = async (id, days) => {
    try {
        return await api(method.PATCH, `/admin/owners/${id}/extend`, { days });
    } catch (error) {
        console.error(`Error extending subscription ${error}`);
        throw error;
    }
};

export const revenue = async () => {
    try {
        return await api(method.GET, '/admin/revenue');
    } catch (error) {
        console.error(`Error fetching admin revenue ${error}`);
        throw error;
    }
};

export const getSettings = async () => {
    try {
        return await api(method.GET, '/admin/settings');
    } catch (error) {
        console.error(`Error fetching admin settings ${error}`);
        throw error;
    }
};

export const updateSettings = async (payload) => {
    try {
        return await api(method.PUT, '/admin/settings', payload);
    } catch (error) {
        console.error(`Error updating admin settings ${error}`);
        throw error;
    }
};
