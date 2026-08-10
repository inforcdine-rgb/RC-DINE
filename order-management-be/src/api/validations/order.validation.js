import Joi from 'joi';
import logger from '../../config/logger.js';
import { CustomError } from '../utils/common.js';

export const customerRegistrationValidation = (payload) => {
    try {
        const schema = Joi.object({
            name: Joi.string().trim().min(1).max(100).required(),
            phoneNumber: Joi.number()
                .min(10 ** 9)
                .max(10 ** 10 - 1)
                .required(),
            email: Joi.string().trim().lowercase().email({ minDomainSegments: 2, tlds: { allow: false } }),
            hotelId: Joi.string().required(),
            tableId: Joi.string().required(),
            tableNumber: Joi.number().required(),
            qrToken: Joi.string().min(40).required(),
            subscription: Joi.object({
                deviceId: Joi.string().max(128).optional(),
                platform: Joi.string().max(50).optional(),
                endpoint: Joi.string().uri().required(),
                expirationTime: Joi.date().allow(null),
                keys: Joi.object({
                    p256dh: Joi.string().required(),
                    auth: Joi.string().required()
                }).required()
            })
        });
        return schema.validate(payload);
    } catch (error) {
        logger('error', `Error in register table validation ${error}`);
        throw CustomError(error.code, error.message);
    }
};

export const orderPlacementValidation = (payload) => {
    try {
        const schema = Joi.object({
            customerId: Joi.string().required(),
            hotelId: Joi.string().required(),
            tableId: Joi.string().required(),
            tableNumber: Joi.number().required(),
            menus: Joi.array().items(
                Joi.object({
                    menuId: Joi.string().required(),
                    quantity: Joi.number().integer().min(1).max(99).required(),
                    // Accepted only for backward-compatible clients. Both fields
                    // are stripped and replaced with authoritative DB values.
                    menuName: Joi.any().strip(),
                    price: Joi.any().strip()
                })
            ).min(1).max(100).required(),
            tipAmount: Joi.number().min(0).max(100000).optional()
        });
        return schema.validate(payload, { stripUnknown: true });
    } catch (error) {
        logger('error', `Error in order placement validation ${error}`);
        throw CustomError(error.code, error.message);
    }
};

export const feedbackValidation = (payload) => {
    try {
        const schema = Joi.object({
            customerId: Joi.string().required(),
            feedback: Joi.string().optional(),
            rating: Joi.number().optional()
        });
        return schema.validate(payload);
    } catch (error) {
        logger('error', `Error in feedback validation ${error}`);
        throw CustomError(error.code, error.message);
    }
};
