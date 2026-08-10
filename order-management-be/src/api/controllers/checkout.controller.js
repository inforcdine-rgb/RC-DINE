import logger from '../../config/logger.js';
import checkoutService from '../services/checkout.service.js';
import { STATUS_CODE } from '../utils/common.js';
import { resolveHotelAccess } from '../utils/hotelAccess.js';
import {
    accountDetailsValidation,
    businessDetailsValidation,
    cancelValidation,
    manualPaymentConfirmationValidation,
    paymentConfirmationValidation,
    paymentValidation,
    stakeholderDetailsValidation,
    subscribeValidation
} from '../validations/checkout.validations.js';

const business = async (req, res) => {
    try {
        const payload = req.body;
        const userId = req.user.id;
        logger('debug', 'Add business details request', { userId, payload });

        const validation = businessDetailsValidation(payload);
        if (validation.error) {
            logger('error', 'Business validation error', { error: validation.error });
            return res.status(STATUS_CODE.BAD_REQUEST).send({ message: validation.error.message });
        }

        const result = await checkoutService.business(userId, payload);
        return res.status(STATUS_CODE.CREATED).send(result);
    } catch (error) {
        logger('error', 'Error occurred during bussiness registration', { error });
        return res.status(error.code || 500).send({ message: error.message });
    }
};

const stakeholder = async (req, res) => {
    try {
        const payload = req.body;
        const userId = req.user.id;
        logger('debug', 'Add stakeholder details request', { userId, payload });

        const validation = stakeholderDetailsValidation(payload);
        if (validation.error) {
            logger('error', 'Stakeholder validation error', { error: validation.error });
            return res.status(STATUS_CODE.BAD_REQUEST).send({ message: validation.error.message });
        }

        const result = await checkoutService.stakeholder(userId, payload);
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        logger('error', 'Error occurred during stakeholder registration', { error });
        return res.status(error.code || 500).send({ message: error.message });
    }
};

const account = async (req, res) => {
    try {
        const payload = req.body;
        const userId = req.user.id;
        logger('debug', 'Add bank details request', { userId, payload });

        const validation = accountDetailsValidation(payload);
        if (validation.error) {
            logger('error', 'Bank validation error', { error: validation.error });
            return res.status(STATUS_CODE.BAD_REQUEST).send({ message: validation.error.message });
        }

        const result = await checkoutService.account(userId, validation.value);
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        logger('error', 'Error occurred during bank registration', { error });
        return res.status(error.code || 500).send({ message: error.message });
    }
};

const subscribe = async (req, res) => {
    try {
        const payload = req.body;

        const validation = subscribeValidation(payload);
        if (validation.error) {
            logger('error', 'Subscribe validation error', { error: validation.error });
            return res.status(STATUS_CODE.BAD_REQUEST).send({ message: validation.error.message });
        }

        const hotelId = await resolveHotelAccess(req.user, validation.value.hotelId);
        const result = await checkoutService.subscribe({ ...validation.value, hotelId });
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        logger('error', 'Error occurred during subscription', { error });
        return res.status(error.code || 500).send({ message: error.message });
    }
};

const deprecatedSubscriptionSuccess = (_req, res) =>
    res.status(STATUS_CODE.GONE).send({
        message: 'Legacy subscription confirmation is disabled. Use the verified subscription payment flow.'
    });

const payment = async (req, res) => {
    try {
        const payload = req.body;
        logger('debug', `Request for payment for`, payload);

        const valid = paymentValidation(payload);
        if (valid.error) {
            logger('error', `Order payment validation failed`, valid.error);
            return res.status(STATUS_CODE.BAD_REQUEST).send({ message: valid.error.message });
        }

        if (
            !req.customer?.customerId ||
            String(req.customer.customerId) !== String(valid.value.customerId) ||
            (req.customer.hotelId && String(req.customer.hotelId) !== String(valid.value.hotelId))
        ) {
            return res.status(STATUS_CODE.FORBIDDEN).send({ message: 'Access denied to this payment request' });
        }

        const result = await checkoutService.payment(valid.value);
        logger('debug', `Payment response order details response`, result);

        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        logger('error', `Error occurred during payment ${JSON.stringify(error)}`);
        return res.status(error.code || 500).send({ message: error.message });
    }
};

const paymentConfirmation = async (req, res) => {
    try {
        const payload = req.body;
        logger('debug', `Request for payment confirmation for customer`, payload);

        const valid = paymentConfirmationValidation(payload);
        if (valid.error) {
            logger('error', `Order payment confirmation validation failed`, valid.error);
            return res.status(STATUS_CODE.BAD_REQUEST).send({ message: valid.error.message });
        }

        if (
            !req.customer?.customerId ||
            String(req.customer.customerId) !== String(valid.value.customerId) ||
            (req.customer.hotelId && String(req.customer.hotelId) !== String(valid.value.hotelId))
        ) {
            return res.status(STATUS_CODE.FORBIDDEN).send({ message: 'Access denied to this payment confirmation' });
        }

        const result = await checkoutService.verifyPaymentConfirmation(valid.value);
        logger('debug', `Response for order payment confirmation`, result);

        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        logger('error', `Error occurred during payment confirmation ${JSON.stringify(error)}`);
        return res.status(error.code || 500).send({ message: error.message });
    }
};

const manualPaymentConfirmation = async (req, res) => {
    try {
        const valid = manualPaymentConfirmationValidation(req.body);
        if (valid.error) {
            return res.status(STATUS_CODE.BAD_REQUEST).send({ message: valid.error.message });
        }

        const hotelId = await resolveHotelAccess(req.user, valid.value.hotelId);
        const result = await checkoutService.paymentConfirmation({
            ...valid.value,
            hotelId,
            manual: true
        });
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        logger('error', 'Manual payment confirmation failed', { error });
        return res.status(error.code || 500).send({ message: error.message });
    }
};

const cancel = async (req, res) => {
    try {
        const payload = req.body;

        const validation = cancelValidation(payload);
        if (validation.error) {
            logger('error', 'Cancel subscription validation error', { error: validation.error });
            return res.status(STATUS_CODE.BAD_REQUEST).send({ message: validation.error.message });
        }

        const result = await checkoutService.cancel(req.user.id, validation.value);
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        logger('error', 'Error occurred during subscription cancellation', { error });
        return res.status(error.code || 500).send({ message: error.message });
    }
};

export default {
    business,
    stakeholder,
    account,
    subscribe,
    deprecatedSubscriptionSuccess,
    payment,
    paymentConfirmation,
    manualPaymentConfirmation,
    cancel
};
