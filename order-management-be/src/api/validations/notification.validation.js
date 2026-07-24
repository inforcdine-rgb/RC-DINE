import Joi from 'joi';
import logger from '../../config/logger.js';
import { CustomError } from '../utils/common.js';

export const subscribeValidation = (payload) => {
    try {
        const schema = Joi.object({
            endpoint: Joi.string().uri().max(2048).required(),
            expirationTime: Joi.date().allow(null),
            keys: Joi.object({
                p256dh: Joi.string().max(4096).required(),
                auth: Joi.string().max(4096).required()
            }).required(),
            deviceId: Joi.string().max(255).required(),
            platform: Joi.string().valid('ios', 'android', 'desktop').allow('', null)
        });
        return schema.validate(payload);
    } catch (error) {
        logger('error', `Error in validating subscribe notification ${error}`);
        throw CustomError(error.code, error.message);
    }
};

export const unsubscribeValidation = (payload) => Joi.object({
    endpoint: Joi.string().uri().max(2048),
    deviceId: Joi.string().max(255),
    allDevices: Joi.boolean().valid(true)
}).or('endpoint', 'deviceId', 'allDevices').validate(payload);
