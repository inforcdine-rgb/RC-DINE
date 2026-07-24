import { api, method } from '../api/apiClient';

const clearHotelDashboardCache = (hotelId) => {
    if (!hotelId) return;

    const keysToRemove = [];

    for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);

        if (
            key?.startsWith('rcdine-api-cache:') &&
            key.includes(`/hotel/dashboard/${hotelId}`)
        ) {
            keysToRemove.push(key);
        }
    }

    keysToRemove.forEach((key) => {
        localStorage.removeItem(key);
    });
};

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

export const dashboard = async (hotelId, options = {}) => {
    try {
        const { fresh = false } = options;

        if (fresh) {
            const { instance } = await import('../api/apiClient');

            const response = await instance.get(`/hotel/dashboard/${hotelId}`, {
                params: {
                    refreshBranding: Date.now()
                }
            });

            return response.data;
        }

        return await api(method.GET, `/hotel/dashboard/${hotelId}`);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
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

export const getPrinterSettings = async (hotelId) => {
    try {
        return await api(method.GET, `/hotel/${hotelId}/printer-settings`);
    } catch (error) {
        console.error(`Error while fetching printer settings ${error}`);
        throw error;
    }
};

export const updatePrinterSettings = async (hotelId, payload) => {
    try {
        return await api(method.PUT, `/hotel/${hotelId}/printer-settings`, payload);
    } catch (error) {
        console.error(`Error while updating printer settings ${error}`);
        throw error;
    }
};

export const uploadLogo = async (hotelId, file) => {
    if (!hotelId) {
        throw new Error('Hotel ID is required');
    }

    if (!file) {
        throw new Error('Please select hotel logo');
    }

    const formData = new FormData();
    formData.append('logo', file);

    const { instance } = await import('../api/apiClient');

    try {
        const response = await instance.post(
            `/hotel/${hotelId}/logo`,
            formData,
            {
                timeout: 60000
            }
        );

        clearHotelDashboardCache(hotelId);

        return response.data;
    } catch (error) {
        console.error('Hotel logo upload error:', {
            status: error?.response?.status,
            data: error?.response?.data,
            message: error?.message
        });

        throw new Error(
            error?.response?.data?.message ||
            'Hotel logo upload failed'
        );
    }
};

export const removeLogo = async (hotelId) => {
    return api(method.DELETE, `/hotel/${hotelId}/logo`);
};
