import Joi from 'joi';

const planSchema = Joi.object({
    amount: Joi.number().positive().max(10000000).required()
}).unknown(true);

export const updateAdminSettingsValidation = (payload) =>
    Joi.object({
        profile: Joi.object({
            firstName: Joi.string().trim().min(1).max(80),
            lastName: Joi.string().trim().min(1).max(80),
            phoneNumber: Joi.string().pattern(/^\+?[0-9 -]{10,20}$/)
        }),
        razorpay: Joi.object({
            keyId: Joi.string().trim().max(255).allow(''),
            keySecret: Joi.string().trim().max(255).allow('')
        }),
        plans: Joi.object({
            MONTHLY: planSchema,
            HALF_YEARLY: planSchema,
            YEARLY: planSchema
        }),
        qrTemplates: Joi.object({
            activeIds: Joi.array().items(Joi.string().max(80)).max(20).required()
        })
    })
        .min(1)
        .validate(payload, { stripUnknown: true });
