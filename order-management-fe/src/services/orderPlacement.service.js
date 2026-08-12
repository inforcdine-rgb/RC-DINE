import { api, getCachedApiData, method } from '../api/apiClient';

export const getCachedTableDetail = (id) => getCachedApiData(`/order/table/${id}`);

export const getTableDetail = async (id, config = {}) => {
    try {
        return await api(method.GET, `/order/table/${id}`, undefined, config);
    } catch (error) {
        console.error(`Error while getting table by id ${error}`);
        throw error;
    }
};

export const registerCustomer = async (payload) => {
    try {
        return await api(method.POST, `/order/customer`, payload);
    } catch (error) {
        console.error(`Error while creating customer ${error}`);
        throw error;
    }
};

export const getCachedMenuDetails = (hotelId, customerId) =>
    getCachedApiData(`/order/menu?hotelId=${hotelId}&customerId=${customerId}`);

export const getMenuDetails = async (hotelId, customerId, config = {}) => {
    try {
        return await api(method.GET, `/order/menu?hotelId=${hotelId}&customerId=${customerId}`, undefined, config);
    } catch (error) {
        console.error(`Error while fetching menu card details ${error}`);
        throw error;
    }
};

export const placeOrder = async (payload) => {
    try {
        return await api(method.POST, '/order', payload);
    } catch (error) {
        console.error(`Error while fetching menu card details ${error}`);
        throw error;
    }
};

export const getOrder = async (customerId) => {
    try {
        return await api(method.GET, `/order/${customerId}`);
    } catch (error) {
        console.error(`Error while fetching order details ${error}`);
        throw error;
    }
};

export const createCustomerPaymentOrder = async (payload) => {
    try {
        return await api(method.POST, '/customer-payment/create-order', payload);
    } catch (error) {
        console.error(`Error while creating customer payment order ${error}`);
        throw error;
    }
};

export const verifyCustomerPayment = async (payload) => {
    try {
        return await api(method.POST, '/customer-payment/verify', payload);
    } catch (error) {
        console.error(`Error while verifying customer payment ${error}`);
        throw error;
    }
};
