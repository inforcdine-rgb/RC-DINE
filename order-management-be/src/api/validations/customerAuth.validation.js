import Joi from 'joi';

const mobileNumber = Joi.string().pattern(/^[6-9]\d{9}$/).required();

export const sendOtpValidation = (payload) =>
    Joi.object({ mobileNumber }).validate(payload, { abortEarly: false, stripUnknown: true });

export const verifyOtpValidation = (payload) =>
    Joi.object({
        mobileNumber,
        otp: Joi.string().pattern(/^\d{4,6}$/).required(),
        verificationId: Joi.string().guid({ version: ['uuidv4'] }).required()
    }).validate(payload, { abortEarly: false, stripUnknown: true });
