import logger from '../../config/logger.js';
import notificationService from '../services/notification.service.js';
import { STATUS_CODE } from '../utils/common.js';
import { subscribeValidation, unsubscribeValidation } from '../validations/notification.validation.js';

const getIdentity = (req) => req.user?.id
    ? { userId: req.user.id }
    : {
        customerId: req.customer?.customerId || null,
        phoneNumber: req.customer?.phoneNumber || null
    };

const handleError = (res, error, context) => {
    logger('error', context, { message: error.message, code: error.code });
    return res.status(error.code || STATUS_CODE.INTERNAL_SERVER_ERROR).send({ message: error.message });
};

const subscribe = async (req, res) => {
    try {
        const validation = subscribeValidation(req.body);
        if (validation.error) {
            return res.status(STATUS_CODE.BAD_REQUEST).send({ message: validation.error.message });
        }
        const result = await notificationService.subscribe({
            ...getIdentity(req),
            ...validation.value
        });
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        return handleError(res, error, 'Notification subscription failed');
    }
};

const unsubscribe = async (req, res) => {
    try {
        const validation = unsubscribeValidation(req.body || {});
        if (validation.error) {
            return res.status(STATUS_CODE.BAD_REQUEST).send({ message: validation.error.message });
        }
        const result = await notificationService.unsubscribe({
            ...getIdentity(req),
            ...validation.value
        });
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        return handleError(res, error, 'Notification unsubscription failed');
    }
};

const fetch = async (req, res) => {
    try {
        const result = await notificationService.fetch(getIdentity(req), req.query);
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        return handleError(res, error, 'Notification fetch failed');
    }
};

const update = async (req, res) => {
    try {
        const result = await notificationService.update(getIdentity(req), req.params.notificationId);
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        return handleError(res, error, 'Notification read update failed');
    }
};

const remove = async (req, res) => {
    try {
        const result = await notificationService.remove(getIdentity(req), req.params.notificationId);
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        return handleError(res, error, 'Notification delete failed');
    }
};

const clear = async (req, res) => {
    try {
        const result = await notificationService.clear(getIdentity(req));
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        return handleError(res, error, 'Notification clear failed');
    }
};

const restore = async (req, res) => {
    try {
        const result = await notificationService.restore(getIdentity(req), req.params.notificationId);
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        return handleError(res, error, 'Notification restore failed');
    }
};

export default { subscribe, unsubscribe, fetch, update, remove, clear, restore };
