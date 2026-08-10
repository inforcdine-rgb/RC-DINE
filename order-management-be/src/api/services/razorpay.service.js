/* eslint-disable camelcase */
import crypto from 'crypto';
import Razorpay from 'razorpay';
import logger from '../../config/logger.js';
import { CustomError, STATUS_CODE } from '../utils/common.js';
import appSettingsService from './appSettings.service.js';

const getRazorpayInstance = async () => {
    const settings = await appSettingsService.get();
    if (!settings.razorpay.keyId || !settings.razorpay.keySecret) {
        throw CustomError(STATUS_CODE.SERVICE_UNAVAILABLE, 'Razorpay is not configured');
    }
    return new Razorpay({
        key_id: settings.razorpay.keyId,
        key_secret: settings.razorpay.keySecret
    });
};

const getKeyId = async () => (await appSettingsService.get()).razorpay.keyId;

const verifyPaymentSignature = async (orderId, paymentId, receivedSignature) => {
    const { keySecret } = (await appSettingsService.get()).razorpay;
    if (!keySecret) throw CustomError(STATUS_CODE.SERVICE_UNAVAILABLE, 'Razorpay is not configured');
    const generated = crypto.createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest('hex');
    const generatedBuffer = Buffer.from(generated, 'utf8');
    const receivedBuffer = Buffer.from(String(receivedSignature || ''), 'utf8');
    return generatedBuffer.length === receivedBuffer.length && crypto.timingSafeEqual(generatedBuffer, receivedBuffer);
};

const createLinkedAccount = async (payload) => {
    try {
        const linkedAccount = await (await getRazorpayInstance()).accounts.create(payload);
        return linkedAccount;
    } catch (error) {
        logger('error', 'Error while creating linked account', { error });
        throw CustomError(error.code, error.message);
    }
};

const createStakeholder = async (accountId, payload) => {
    try {
        const stakeholder = await (await getRazorpayInstance()).stakeholders.create(accountId, payload);
        return stakeholder;
    } catch (error) {
        logger('error', 'Error while creating stakeholder', { error });
        throw CustomError(error.code, error.message);
    }
};

const requestProduct = async (accountId, payload) => {
    try {
        const product = await (await getRazorpayInstance()).products.requestProductConfiguration(accountId, payload);
        return product;
    } catch (error) {
        logger('error', 'Error while requesting product', { error });
        throw CustomError(error.code, error.message);
    }
};

const updateProduct = async (accountId, productId, payload) => {
    try {
        const product = await (await getRazorpayInstance()).products.edit(accountId, productId, payload);
        return product;
    } catch (error) {
        logger('error', 'Error while updating product', { error });
        throw CustomError(error.code, error.message);
    }
};

const subscribe = async (payload) => {
    try {
        const subscription = await (await getRazorpayInstance()).subscriptions.create(payload);
        return subscription;
    } catch (error) {
        logger('error', 'Error while creating subscription product', { error });
        throw CustomError(error.code, error.message);
    }
};

const fetch = async (subscriptionId) => {
    try {
        const subscription = await (await getRazorpayInstance()).subscriptions.fetch(subscriptionId);
        return subscription;
    } catch (error) {
        logger('error', 'Error while fetching subscription product', { error });
        throw CustomError(error.code, error.message);
    }
};

const order = async (data) => {
    try {
        const order = await (await getRazorpayInstance()).orders.create(data);
        return order;
    } catch (error) {
        logger('error', 'Error while creating order', { error });

        const statusCode =
            Number(error?.statusCode) ||
            Number(error?.status) ||
            STATUS_CODE.INTERNAL_SERVER_ERROR;

        const message =
            error?.error?.description ||
            error?.description ||
            error?.message ||
            'Unable to create Razorpay order';

        throw CustomError(statusCode, message);
    }
};

const fetchOrder = async (orderId) => {
    try {
        return await (await getRazorpayInstance()).orders.fetch(orderId);
    } catch (error) {
        throw CustomError(Number(error?.statusCode) || STATUS_CODE.BAD_GATEWAY, 'Unable to verify Razorpay order');
    }
};

const fetchPayment = async (paymentId) => {
    try {
        return await (await getRazorpayInstance()).payments.fetch(paymentId);
    } catch (error) {
        throw CustomError(Number(error?.statusCode) || STATUS_CODE.BAD_GATEWAY, 'Unable to verify Razorpay payment');
    }
};

const capturePayment = async (paymentId, amount, currency = 'INR') => {
    try {
        return await (await getRazorpayInstance()).payments.capture(paymentId, amount, currency);
    } catch (error) {
        throw CustomError(Number(error?.statusCode) || STATUS_CODE.BAD_GATEWAY, 'Unable to capture Razorpay payment');
    }
};

const cancel = async (subscriptionId, cancelAtCycleEnd = false) => {
    try {
        const cancelResponse = await (await getRazorpayInstance()).subscriptions.cancel(subscriptionId, cancelAtCycleEnd);
        return cancelResponse;
    } catch (error) {
        logger('error', 'Error while canceling subscription', { error });
        throw CustomError(error.code, error.message);
    }
};

const getPlan = async (planId) => {
    try {
        const data = await (await getRazorpayInstance()).plans.fetch(planId);
        return data;
    } catch (error) {
        logger('error', 'Error while fetching plan', { error });
        throw CustomError(error.code, error.message);
    }
};

const refund = async (paymentId, amount) => {
    try {
        const data = await (await getRazorpayInstance()).payments.refund(paymentId, { amount });
        return data;
    } catch (error) {
        logger('error', 'Error while fetching plan', { error });
        throw CustomError(error.code, error.message);
    }
};

export default {
    createLinkedAccount,
    createStakeholder,
    requestProduct,
    updateProduct,
    subscribe,
    fetch,
    order,
    fetchOrder,
    fetchPayment,
    capturePayment,
    cancel,
    getPlan,
    refund,
    getKeyId,
    verifyPaymentSignature
};
