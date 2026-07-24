import Joi from 'joi';

const id = Joi.string().trim().min(1).max(255).required();

export const tableAvailabilityValidation = (payload) =>
    Joi.object({
        tableId: id
    }).validate(payload);

export const startSessionValidation = (payload) =>
    Joi.object({
        tableId: id,
        customerId: Joi.string().trim().max(255).allow(null, '')
    }).validate(payload);

export const joinSessionValidation = (payload) =>
    Joi.object({
        tableId: id,
        sessionCode: Joi.string().trim().uppercase().min(6).max(12).required(),
        customerId: Joi.string().trim().max(255).allow(null, '')
    }).validate(payload);

export const requestStatusValidation = (payload) =>
    Joi.object({
        requestId: id
    }).validate(payload);

export const memberActionValidation = (payload) =>
    Joi.object({
        memberId: id
    }).validate(payload);

export const respondJoinRequestValidation = (payload) =>
    Joi.object({
        requestId: id,
        action: Joi.string().trim().uppercase().valid('ACCEPT', 'REJECT').required()
    }).validate(payload);

export const managerSessionActionValidation = (payload) =>
    Joi.object({
        action: Joi.string().valid('ACTIVATE', 'DISABLE', 'PAYMENT_PENDING', 'REOPEN').required()
    }).validate(payload);

export const closeSessionValidation = (payload) =>
    Joi.object({
        keepTableActive: Joi.boolean().default(false)
    }).validate(payload);
