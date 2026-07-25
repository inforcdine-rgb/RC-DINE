import Joi from 'joi';
import logger from '../../config/logger.js';
import { CustomError } from '../utils/common.js';

export const registerationValidation = (payload) => {
    try {
        const schema = Joi.object({
            name: Joi.string().min(3).required(),
            address: Joi.string().min(10).required(),
            careNumber: Joi.number()
                .min(10 ** 9)
                .max(10 ** 10 - 1)
                .required(),
            gstNumber: Joi.string().trim().uppercase().pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/).required(),
            openTime: Joi.string().optional(),
            closeTime: Joi.string().optional(),
            manager: Joi.array().items(Joi.string()).optional()
        });
        return schema.validate(payload);
    } catch (error) {
        logger('error', 'Error in registration validation', { error });
        throw CustomError(error.code, error.message);
    }
};

export const updateValidation = (payload) => {
    try {
        const schema = Joi.object({
            openTime: Joi.string().optional(),
            closeTime: Joi.string().optional(),
            name: Joi.string().min(3).optional(),
            careNumber: Joi.number()
                .min(10 ** 9)
                .max(10 ** 10 - 1),
            address: Joi.string().min(10),
            gstNumber: Joi.string().trim().uppercase().pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/),
            manager: Joi.object({
                added: Joi.array().items(Joi.string()).optional(),
                removed: Joi.array().items(Joi.string()).optional()
            }).optional()
        }).or('openTime', 'closeTime', 'name', 'careNumber', 'address', 'gstNumber', 'manager');
        return schema.validate(payload);
    } catch (error) {
        logger('error', 'Error in update validation', { error });
        throw CustomError(error.code, error.message);
    }
};

export const paymentSettingsValidation = (payload) => {
    try {
        const schema = Joi.object({
            razorpayKeyId: Joi.string().allow('', null).optional(),
            razorpayKeySecret: Joi.string().allow('', null).optional(),
            razorpayMerchantName: Joi.string().allow('', null).optional(),
            razorpayMerchantEmail: Joi.string().email().allow('', null).optional(),
            razorpayMerchantPhone: Joi.string().allow('', null).optional(),
            paymentEnabled: Joi.boolean().required(),
            gstEnabled: Joi.boolean().optional(),
            gstPercent: Joi.number().min(0).max(100).optional(),
            discountEnabled: Joi.boolean().optional(),
            discountType: Joi.string().valid('PERCENT', 'FLAT', '').allow(null).optional(),
            discountValue: Joi.number().min(0).optional()
        });
        return schema.validate(payload);
    } catch (error) {
        logger('error', 'Error in payment settings validation', { error });
        throw CustomError(error.code, error.message);
    }
};

export const printerSettingsValidation = (payload) => {
    try {
        const schema = Joi.object({
            printerWidth: Joi.string().valid('58', '80', 'auto').required(),
            address: Joi.string().trim().max(250).allow('').required(),
            phone: Joi.string().trim().max(20).allow('').required(),
            gstNumber: Joi.string().trim().uppercase().pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/).allow('').required(),
            showLogo: Joi.boolean().optional(),
            footerMessage: Joi.string().trim().max(120).allow('').required()
        });
        return schema.validate(payload, { abortEarly: false, stripUnknown: true });
    } catch (error) {
        logger('error', 'Error in printer settings validation', { error });
        throw CustomError(error.code, error.message);
    }
};
