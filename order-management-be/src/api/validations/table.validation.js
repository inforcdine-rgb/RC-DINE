import Joi from 'joi';
import logger from '../../config/logger.js';
import { CustomError } from '../utils/common.js';

export const tableValidation = (payload) => {
    try {
        const schema = Joi.object({
            count: Joi.number().integer().min(1).optional(),
            tableId: Joi.string().optional()
        }).or('count', 'tableId');
        return schema.validate(payload);
    } catch (error) {
        logger('error', `Error in register table validation ${error}`);
        throw CustomError(error.code, error.message);
    }
};

export const tableNameValidation = (payload) => {
    try {
        const schema = Joi.object({
            tableName: Joi.string().trim().min(1).max(40).required()
        });
        return schema.validate(payload);
    } catch (error) {
        logger('error', `Error in update table name validation ${error}`);
        throw CustomError(error.code, error.message);
    }
};
