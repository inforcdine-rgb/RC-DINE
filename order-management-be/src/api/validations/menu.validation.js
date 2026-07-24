import Joi from 'joi';
import logger from '../../config/logger.js';
import { CustomError } from '../utils/common.js';

export const createCategoryValidation = (payload) => {
    try {
        const schema = Joi.object({
            hotelId: Joi.string().required(),
            data: Joi.array()
                .items(
                    Joi.object({
                        name: Joi.string().required(),
                        order: Joi.number().optional()
                    })
                )
                .unique((a, b) => a.name === b.name)
        });
        return schema.validate(payload);
    } catch (error) {
        logger('error', `Error in creating menu category ${error}`);
        throw CustomError(error.code, error.message);
    }
};

export const updateCategoryValidation = (payload) => {
    try {
        const schema = Joi.object({
            name: Joi.string().optional(),
            order: Joi.number().optional()
        }).or('name', 'order');
        return schema.validate(payload);
    } catch (error) {
        logger('error', `Error in updating menu category ${error}`);
        throw CustomError(error.code, error.message);
    }
};

export const createValidation = (payload) => {
    try {
        const schema = Joi.object({
            categoryId: Joi.string().required(),
            hotelId: Joi.string().required(),
            data: Joi.array()
                .items(
                    Joi.object({
                        name: Joi.string().required(),
                        description: Joi.string().allow('', null).optional(),
                        price: Joi.number().required(),
                        foodType: Joi.string().valid('VEG', 'NON_VEG').required(),
                        isCartSuggestion: Joi.boolean().optional(),
                        isTodayDeal: Joi.boolean().optional()
                    })
                )
                .unique((a, b) => a.name === b.name)
        });
        return schema.validate(payload);
    } catch (error) {
        logger('error', `Error in creating menu ${error}`);
        throw CustomError(error.code, error.message);
    }
};

export const updateValidation = (payload) => {
    try {
        const schema = Joi.object({
            name: Joi.string().optional(),
            description: Joi.string().allow('', null).optional(),
            price: Joi.number().optional(),
            foodType: Joi.string().valid('VEG', 'NON_VEG').optional(),
            status: Joi.boolean().optional(),
            image: Joi.string().uri().optional().allow(null, ''),
            isCartSuggestion: Joi.boolean().optional(),
            isTodayDeal: Joi.boolean().optional(),
            isCombo: Joi.boolean().optional(),
            comboItems: Joi.array().items(Joi.string()).min(2).max(5).optional().allow(null)
        }).or('name', 'description', 'price', 'foodType', 'status', 'image', 'isCartSuggestion', 'isTodayDeal', 'isCombo', 'comboItems');
        return schema.validate(payload);
    } catch (error) {
        logger('error', `Error in updating menu ${error}`);
        throw CustomError(error.code, error.message);
    }
};

export const createComboValidation = (payload) => {
    try {
        const schema = Joi.object({
            hotelId: Joi.string().required(),
            name: Joi.string().required(),
            description: Joi.string().allow('', null).optional(),
            price: Joi.number().required(),
            status: Joi.boolean().optional(),
            menuIds: Joi.array().items(Joi.string().required()).min(2).max(5).unique().required()
        });
        return schema.validate(payload);
    } catch (error) {
        logger('error', `Error in creating combo ${error}`);
        throw CustomError(error.code, error.message);
    }
};

export const updateComboValidation = (payload) => {
    try {
        const schema = Joi.object({
            hotelId: Joi.string().required(),
            name: Joi.string().optional(),
            description: Joi.string().allow('', null).optional(),
            price: Joi.number().optional(),
            foodType: Joi.string().valid('VEG', 'NON_VEG').optional(),
            status: Joi.boolean().optional(),
            menuIds: Joi.array().items(Joi.string().required()).min(2).max(5).unique().optional()
        }).or('name', 'description', 'price', 'status', 'menuIds');
        return schema.validate(payload);
    } catch (error) {
        logger('error', `Error in updating combo ${error}`);
        throw CustomError(error.code, error.message);
    }
};
