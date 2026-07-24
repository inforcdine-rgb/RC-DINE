import logger from '../../config/logger.js';
import openOrderService from '../services/openOrder.service.js';
import { STATUS_CODE } from '../utils/common.js';
import {
    validateAddOpenOrderItems,
    validateCloseOpenOrder,
    validateCreateOpenOrder,
    validateGenerateBill,
    validateOpenOrderPayment
} from '../validations/openOrder.validation.js';

const sendError = (res, error, action) => {
    logger('error', `Open order ${action} failed`, {
        message: error.message,
        code: error.code
    });
    return res.status(error.code || STATUS_CODE.INTERNAL_SERVER_ERROR).send({
        message: error.message || 'Open order request failed'
    });
};

const validate = (validation) => {
    if (validation.error) {
        const error = new Error(validation.error.details.map((detail) => detail.message).join(', '));
        error.code = STATUS_CODE.BAD_REQUEST;
        throw error;
    }
    return validation.value;
};

const create = async (req, res) => {
    try {
        const payload = validate(validateCreateOpenOrder(req.body));
        const result = await openOrderService.create(req.user, payload);
        return res.status(result.duplicate ? STATUS_CODE.OK : STATUS_CODE.CREATED).send(result);
    } catch (error) {
        return sendError(res, error, 'creation');
    }
};

const list = async (req, res) => {
    try {
        const orders = await openOrderService.list(req.user, req.query.hotelId);
        return res.status(STATUS_CODE.OK).send({ orders });
    } catch (error) {
        return sendError(res, error, 'listing');
    }
};

const listCompleted = async (req, res) => {
    try {
        const orders = await openOrderService.listCompleted(req.user, req.query.hotelId, {
            dateFrom: req.query.dateFrom,
            dateTo: req.query.dateTo
        });
        return res.status(STATUS_CODE.OK).send({ orders });
    } catch (error) {
        return sendError(res, error, 'completed listing');
    }
};

const getById = async (req, res) => {
    try {
        const order = await openOrderService.getById(req.user, req.params.id);
        return res.status(STATUS_CODE.OK).send({ order });
    } catch (error) {
        return sendError(res, error, 'detail fetch');
    }
};

const addItems = async (req, res) => {
    try {
        const payload = validate(validateAddOpenOrderItems(req.body));
        const result = await openOrderService.addItems(req.user, req.params.id, payload);
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        return sendError(res, error, 'item addition');
    }
};

const generateBill = async (req, res) => {
    try {
        const payload = validate(validateGenerateBill(req.body || {}));
        const order = await openOrderService.generateBill(req.user, req.params.id, payload);
        return res.status(STATUS_CODE.OK).send({ order });
    } catch (error) {
        return sendError(res, error, 'bill generation');
    }
};

const payment = async (req, res) => {
    try {
        const payload = validate(validateOpenOrderPayment(req.body));
        const result = await openOrderService.pay(req.user, req.params.id, payload);
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        return sendError(res, error, 'payment');
    }
};

const close = async (req, res) => {
    try {
        const payload = validate(validateCloseOpenOrder(req.body || {}));
        const result = await openOrderService.close(req.user, req.params.id, payload);
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        return sendError(res, error, 'closing');
    }
};

const printKot = async (req, res) => {
    try {
        const result = await openOrderService.printKot(req.user, req.params.id);
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        return sendError(res, error, 'KOT printing');
    }
};

export default { create, list, listCompleted, getById, addItems, generateBill, payment, close, printKot };
