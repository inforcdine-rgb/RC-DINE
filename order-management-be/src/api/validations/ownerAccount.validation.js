import Joi from 'joi';
import logger from '../../config/logger.js';
import { CustomError } from '../utils/common.js';

export const changeOwnerEmailValidation = (payload) => {
    try {
        logger('debug', 'Validating owner email update payload');
        const schema = Joi.object({
            currentPassword: Joi.string().min(1).required().messages({
                'any.required': 'Current password is required.',
                'string.empty': 'Current password is required.'
            }),
            newEmail: Joi.string().trim().lowercase().email({ minDomainSegments: 2 }).required().messages({
                'any.required': 'New email is required.',
                'string.empty': 'New email is required.',
                'string.email': 'Please enter a valid email address.'
            }),
            confirmEmail: Joi.string().trim().lowercase().valid(Joi.ref('newEmail')).required().messages({
                'any.required': 'Confirm new email is required.',
                'string.empty': 'Confirm new email is required.',
                'any.only': 'New email and confirmation must match.'
            })
        });

        return schema.validate(payload, { abortEarly: true });
    } catch (error) {
        logger('error', 'Owner email update validation failed');
        throw CustomError(error.code, error.message);
    }
};
