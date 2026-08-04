import Joi from 'joi';
import logger from '../../config/logger.js';
import { CustomError } from '../utils/common.js';

const passwordSchema = Joi.string()
    .pattern(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .messages({
        'string.pattern.base':
            'Password must contain at least 8 characters, one letter, one number, and one special character.'
    });

const recoveryCodeSchema = Joi.string()
    .pattern(/^\d{4}$/)
    .messages({
        'string.pattern.base': 'Recovery code must be exactly 4 numeric digits.'
    });

export const registrationValidation = (payload) => {
    try {
        logger('debug', 'Validating registration payload');
        const schema = Joi.object({
            firstName: Joi.string().min(3).max(30).required(),
            lastName: Joi.string().min(3).max(30).required(),
            phoneNumber: Joi.alternatives()
                .try(
                    Joi.string().pattern(/^\d{10}$/),
                    Joi.number()
                        .integer()
                        .min(10 ** 9)
                        .max(10 ** 10 - 1)
                )
                .required()
                .messages({
                    'alternatives.match': '"phoneNumber" must be a 10 digit number'
                }),
            email: Joi.string()
                .trim()
                .lowercase()
                .email({
                    minDomainSegments: 2,
                    tlds: { allow: ['com', 'net'] }
                })
                .required(),
            password: passwordSchema.required(),
            invite: Joi.string().optional(),
            recoveryCode: Joi.when('invite', {
                is: Joi.exist(),
                then: Joi.forbidden(),
                otherwise: recoveryCodeSchema.required()
            }),
            confirmRecoveryCode: Joi.when('invite', {
                is: Joi.exist(),
                then: Joi.forbidden(),
                otherwise: recoveryCodeSchema.valid(Joi.ref('recoveryCode')).required().messages({
                    'any.only': 'Recovery code and confirmation must match.'
                })
            })
        });

        return schema.validate(payload);
    } catch (error) {
        logger('error', `Error occurred during registration validation: ${error}`);
        throw CustomError(error.code, error.message);
    }
};

export const loginValidation = (payload) => {
    try {
        logger('debug', 'Validating login payload');
        const schema = Joi.object({
            email: Joi.string().email({
                minDomainSegments: 2,
                tlds: { allow: ['com', 'net'] }
            }),
            password: Joi.string().pattern(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
            role: Joi.string().valid('OWNER', 'MANAGER', 'ADMIN').required()
        });

        return schema.validate(payload);
    } catch (error) {
        logger('error', `Error occurred during login validation: ${error}`);
        throw CustomError(error.code, error.message);
    }
};

export const googleLoginValidation = (payload) => {
    try {
        logger('debug', 'Validating Google login payload');
        const schema = Joi.object({
            credential: Joi.string().min(100).required()
        });

        return schema.validate(payload);
    } catch (error) {
        logger('error', `Error occurred during Google login validation: ${error}`);
        throw CustomError(error.code, error.message);
    }
};

export const emailValidation = (payload) => {
    try {
        logger('debug', 'Validating email payload');
        const schema = Joi.object({
            email: Joi.string().email({
                minDomainSegments: 2,
                tlds: { allow: ['com', 'net'] }
            })
        });

        return schema.validate(payload);
    } catch (error) {
        logger('error', `Error occurred during email validation: ${error}`);
        throw CustomError(error.code, error.message);
    }
};

export const passValidation = (payload) => {
    try {
        logger('debug', 'Validating password payload');
        const schema = Joi.object({
            password: Joi.string().pattern(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
        });

        return schema.validate(payload);
    } catch (error) {
        logger('error', `Error occurred during password validation: ${error}`);
        throw CustomError(error.code, error.message);
    }
};

export const ownerRecoveryResetValidation = (payload) => {
    try {
        logger('debug', 'Validating owner recovery password reset payload');
        const schema = Joi.object({
            email: Joi.string()
                .trim()
                .lowercase()
                .email({
                    minDomainSegments: 2,
                    tlds: { allow: ['com', 'net'] }
                })
                .required(),
            recoveryCode: recoveryCodeSchema.required(),
            newPassword: passwordSchema.required(),
            confirmNewPassword: passwordSchema.valid(Joi.ref('newPassword')).required().messages({
                'any.only': 'New password and confirmation must match.'
            })
        });

        return schema.validate(payload);
    } catch (error) {
        logger('error', `Error occurred during owner recovery reset validation: ${error}`);
        throw CustomError(error.code, error.message);
    }
};

export const recoveryCodeUpdateValidation = (payload) => {
    try {
        logger('debug', 'Validating owner recovery code update payload');
        const schema = Joi.object({
            currentPassword: Joi.string().min(1).required(),
            recoveryCode: recoveryCodeSchema.required(),
            confirmRecoveryCode: recoveryCodeSchema.valid(Joi.ref('recoveryCode')).required().messages({
                'any.only': 'Recovery code and confirmation must match.'
            }),
            invalidateSessions: Joi.boolean().default(false)
        });

        return schema.validate(payload);
    } catch (error) {
        logger('error', `Error occurred during recovery code update validation: ${error}`);
        throw CustomError(error.code, error.message);
    }
};

export const updateValidation = (payload) => {
    try {
        logger('debug', `Validating update user payload`);
        const schema = Joi.object({
            firstName: Joi.string().min(3).max(30).optional(),
            lastName: Joi.string().min(3).max(30).optional(),
            password: Joi.string()
                .pattern(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
                .optional(),
            preferences: Joi.object({
                notification: Joi.string().optional(),
                payment: Joi.string().optional(),
                orders: Joi.string().optional()
            })
        }).or('firstName', 'lastName', 'password', 'preferences');

        return schema.validate(payload);
    } catch (error) {
        logger('error', `Error occurred during update user validation: ${error}`);
        throw CustomError(error.code, error.message);
    }
};
