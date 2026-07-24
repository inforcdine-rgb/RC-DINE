import { api, method, instance } from '../api/apiClient';

export const getActiveOrders = async (tableId) => {
    try {
        return await api(method.GET, `/order/active/${tableId}`);
    } catch (error) {
        console.error(`Error while getting active orders ${error}`);
        throw error;
    }
};

export const getCompletedOrders = async ({
    hotelId,
    skip = 0,
    limit = 10,
    sortKey = '',
    sortOrder = '',
    filterKey = '',
    filterValue = '',
    dateFrom = '',
    dateTo = ''
}) => {
    try {
        const query = new URLSearchParams({
            skip,
            limit,
            sortKey,
            sortOrder,
            filterKey,
            filterValue,
            dateFrom,
            dateTo
        }).toString();
        return await api(method.GET, `/order/completed/${hotelId}?${query}`);
    } catch (error) {
        console.error(`Error while getting completed order details ${error}`);
        throw error;
    }
};

export const updatePendingOrders = async (payload) => {
    try {
        return await api(method.PUT, `/order/pending`, payload);
    } catch (error) {
        console.error(`Error while updating pending order details ${error}`);
        throw error;
    }
};

export const feedback = async (payload) => {
    try {
        return await api(method.POST, `/order/feedback`, payload);
    } catch (error) {
        console.error(`Error while sending order feedback ${error}`);
        throw error;
    }
};

export const getOrderDetails = async (hotelId, orderId) => {
    try {
        return await api(method.GET, `/order/details/${hotelId}/${orderId}`);
    } catch (error) {
        console.error(`Error while getting order details ${error}`);
        throw error;
    }
};

export const updateOrderStatus = async (hotelId, orderId, status) => {
    try {
        const payload = { orderId, status };
        return await api(method.PUT, `/order/status/${hotelId}`, payload);
    } catch (error) {
        console.error(`Error while updating order status ${error}`);
        throw error;
    }
};

export const downloadInvoice = async (hotelId, orderId, hotelName = 'hotel', orderNumber = 'order') => {
    try {
        if (!hotelId || !orderId) {
            throw new Error('hotelId or orderId missing');
        }

        const response = await instance.get(`/order/invoice/${hotelId}/${orderId}`, {
            responseType: 'blob'
        });

        const blob = new Blob([response.data], {
            type: 'application/pdf'
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');

        const cleanedHotelName = String(hotelName || 'hotel').toLowerCase().replace(/\s+/g, '-');
        const cleanedOrderNumber = String(orderNumber || 'order').toLowerCase();

        link.href = url;
        link.download = `${cleanedHotelName}-${cleanedOrderNumber}.pdf`;

        document.body.appendChild(link);
        link.click();
        link.remove();

        window.URL.revokeObjectURL(url);

        return { success: true };
    } catch (error) {
        console.error(`Error while downloading invoice ${error}`);
        throw error;
    }
};
export const getOrderStatus = async (orderId) => {
    try {
        return await api(method.GET, `/order/${orderId}/status`);
    } catch (error) {
        console.error(`Error while getting order status ${error}`);
        throw error;
    }
};

export const getPublicOrderDetails = async (orderId) => {
    try {
        return await api(method.GET, `/order/${orderId}/details`);
    } catch (error) {
        console.error(`Error while getting public order details ${error}`);
        throw error;
    }
};

export const resetTable = async (tableId) => {
    try {
        return await api(method.POST, `/order/table/${tableId}/reset`);
    } catch (error) {
        console.error(`Error while resetting table ${error}`);
        throw error;
    }
};

export const cancelOrder = async (orderId) => {
    try {
        return await api(method.PATCH, `/order/${orderId}/cancel`);
    } catch (error) {
        console.error(`Error while cancelling order ${error}`);
        throw error;
    }
};

export const createWalkInOrder = async (payload) => {
    try {
        return await api(method.POST, '/order/walk-in', payload);
    } catch (error) {
        console.error(`Error while creating walk-in order ${error}`);
        throw error;
    }
};

export const createOpenOrder = async (payload) => {
    return api(method.POST, '/orders/open', payload);
};

export const getOpenOrders = async (hotelId) => {
    const query = new URLSearchParams({ hotelId }).toString();
    return api(method.GET, `/orders/open?${query}`);
};

export const getCompletedOpenOrders = async ({ hotelId, dateFrom, dateTo }) => {
    const query = new URLSearchParams({ hotelId });
    if (dateFrom) query.set('dateFrom', dateFrom);
    if (dateTo) query.set('dateTo', dateTo);
    return api(method.GET, `/orders/open/completed?${query.toString()}`);
};

export const getOpenOrder = async (orderId) => {
    return api(method.GET, `/orders/${orderId}`);
};

export const addOpenOrderItems = async (orderId, payload) => {
    return api(method.PUT, `/orders/${orderId}/add-items`, payload);
};

export const generateOpenOrderBill = async (orderId, payload = {}) => {
    return api(method.POST, `/orders/${orderId}/generate-bill`, payload);
};

export const payOpenOrder = async (orderId, payload) => {
    return api(method.POST, `/orders/${orderId}/payment`, payload);
};

export const closeOpenOrder = async (orderId, payload = {}) => {
    return api(method.POST, `/orders/${orderId}/close`, payload);
};

export const printOpenOrderKot = async (orderId) => {
    return api(method.POST, `/orders/${orderId}/kot`, {});
};
