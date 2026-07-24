import Joi from 'joi';

const options = { abortEarly: false, allowUnknown: false, stripUnknown: true };

const idempotencyKey = Joi.string().trim().min(8).max(100).required();

export const validateCreateOpenOrder = (payload) =>
    Joi.object({
        hotelId: Joi.string().trim().required(),
        tableId: Joi.string().trim().allow(null, ''),
        orderType: Joi.string().valid('DINE_IN', 'WALK_IN', 'PARCEL', 'TAKE_AWAY').required(),
        customerName: Joi.string().trim().max(120).allow('', null),
        customerPhone: Joi.string().trim().pattern(/^[0-9+()\- ]{7,20}$/).allow('', null),
        notes: Joi.string().trim().max(500).allow('', null),
        idempotencyKey
    }).validate(payload, options);

export const validateAddOpenOrderItems = (payload) =>
    Joi.object({
        idempotencyKey,
        expectedRevision: Joi.number().integer().min(0).optional(),
        items: Joi.array()
            .min(1)
            .max(100)
            .items(
                Joi.object({
                    menuId: Joi.string().trim().required(),
                    quantity: Joi.number().integer().min(1).max(999).required(),
                    notes: Joi.string().trim().max(300).allow('', null)
                })
            )
            .required()
    }).validate(payload, options);

export const validateGenerateBill = (payload) =>
    Joi.object({
        discountType: Joi.string().valid('PERCENT', 'FLAT').allow(null),
        discountValue: Joi.number().min(0).max(10000000).optional(),
        tipAmount: Joi.number().min(0).max(10000000).default(0),
        idempotencyKey: Joi.string().trim().min(8).max(100).optional()
    }).validate(payload, options);

export const validateOpenOrderPayment = (payload) =>
    Joi.object({
        paymentMethod: Joi.string().valid('CASH', 'UPI', 'CARD').required(),
        cashReceived: Joi.when('paymentMethod', {
            is: 'CASH',
            then: Joi.number().min(0).required(),
            otherwise: Joi.number().min(0).default(0)
        }),
        idempotencyKey
    }).validate(payload, options);

export const validateCloseOpenOrder = (payload) =>
    Joi.object({
        cancel: Joi.boolean().default(false),
        freeTable: Joi.boolean().default(false),
        reason: Joi.string().trim().max(300).allow('', null)
    }).validate(payload, options);
