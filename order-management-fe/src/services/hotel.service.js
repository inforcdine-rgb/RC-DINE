import { api, method } from '../api/apiClient';

export const create = async (payload) => {
    try {
        return await api(method.POST, '/hotel', payload);
    } catch (error) {
        console.error(`Error while creating hotel ${error}`);
        throw error;
    }
};

export const fetch = async () => {
    try {
        return await api(method.GET, '/hotel');
    } catch (error) {
        console.error(`Error while fetching hotel ${error}`);
        throw error;
    }
};

export const remove = async (id) => {
    try {
        return await api(method.DELETE, `/hotel/${id}`);
    } catch (error) {
        console.error(`Error while removing hotel ${error}`);
        throw error;
    }
};

export const update = async (payload) => {
    try {
        const { id, data } = payload;
        return await api(method.PUT, `/hotel/${id}`, data);
    } catch (error) {
        console.error(`Error while updating hotel ${error}`);
        throw error;
    }
};

export const dashboard = async (hotelId) => {
    try {
        return await api(method.GET, `/hotel/dashboard/${hotelId}`);
    } catch (error) {
        console.error(`Error fetching dashboard data ${error}`);
        throw error;
    }
};

export const revenue = async () => {
    try {
        return await api(method.GET, '/hotel/revenue');
    } catch (error) {
        console.error(`Error fetching revenue analytics ${error}`);
        throw error;
    }
};

export const getPaymentSettings = async (hotelId) => {
    try {
        return await api(method.GET, `/hotel/${hotelId}/payment-settings`);
    } catch (error) {
        console.error(`Error while fetching hotel payment settings ${error}`);
        throw error;
    }
};

export const updatePaymentSettings = async (hotelId, payload) => {
    try {
        return await api(method.PUT, `/hotel/${hotelId}/payment-settings`, payload);
    } catch (error) {
        console.error(`Error while updating hotel payment settings ${error}`);
        throw error;
    }
};

export const testPaymentSettings = async (hotelId, payload) => {
    try {
        return await api(method.POST, `/hotel/${hotelId}/payment-settings/test`, payload);
    } catch (error) {
        console.error(`Error while testing hotel payment settings ${error}`);
        throw error;
    }
};
