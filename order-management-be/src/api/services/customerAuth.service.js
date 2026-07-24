import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import { db } from '../../config/database.js';
import env from '../../config/env.js';
import logger from '../../config/logger.js';
import { CustomError, STATUS_CODE } from '../utils/common.js';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const normalizeIndianMobile = (value) => {
    const digits = String(value || '').replace(/\D/g, '');
    const mobile = digits.startsWith('91') && digits.length === 12 ? digits.slice(2) : digits;

    if (!/^[6-9]\d{9}$/.test(mobile)) {
        throw CustomError(STATUS_CODE.BAD_REQUEST, 'Enter a valid 10-digit Indian mobile number');
    }

    return mobile;
};

const hashOtp = (phoneNumber, otp) =>
    crypto
        .createHmac('sha256', env.customerAuth.otpHashSecret)
        .update(`${phoneNumber}:${otp}`)
        .digest('hex');

const generateOtp = () => String(crypto.randomInt(100000, 1000000));

const safeJson = async (response) => {
    const text = await response.text();
    try {
        return text ? JSON.parse(text) : {};
    } catch (_error) {
        return { message: text || 'Unexpected SMS provider response' };
    }
};

const sendFast2SmsQuickMessage = async ({ phoneNumber, otp }) => {
    if (process.env.OTP_DEV_MODE === 'true') {
        logger(
            'info',
            `🔐 DEV OTP for ${phoneNumber}: ${otp}`
        );

        return {
            return: true,
            message: 'Development OTP generated'
        };
    }

    if (!env.fast2sms.apiKey) {
        throw CustomError(STATUS_CODE.SERVICE_UNAVAILABLE, 'Fast2SMS API key is not configured');
    }

    const message = `Your RC Dine verification code is ${otp}. It is valid for ${env.customerAuth.otpExpiryMinutes} minutes. Do not share this code.`;
    const query = new URLSearchParams({
        route: 'q',
        message,
        numbers: phoneNumber
    });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.fast2sms.timeoutMs);

    try {
        const response = await fetch(`https://www.fast2sms.com/dev/bulkV2?${query.toString()}`, {
            method: 'GET',
            headers: {
                Authorization: env.fast2sms.apiKey,
                accept: 'application/json'
            },
            signal: controller.signal
        });
        const payload = await safeJson(response);

        if (!response.ok || payload.return === false) {
            const providerMessage = Array.isArray(payload.message)
                ? payload.message.join(', ')
                : payload.message;
            logger('error', `Fast2SMS rejected OTP request: ${providerMessage || response.status}`);
            throw CustomError(
                STATUS_CODE.BAD_GATEWAY,
                providerMessage || 'OTP SMS could not be sent. Please try again.'
            );
        }

        return payload;
    } catch (error) {
        if (error?.name === 'AbortError') {
            throw CustomError(STATUS_CODE.SERVICE_UNAVAILABLE, 'OTP provider timed out. Please try again.');
        }
        if (Number.isInteger(error?.code)) throw error;
        logger('error', `Fast2SMS request failed: ${error.message}`);
        throw CustomError(STATUS_CODE.BAD_GATEWAY, 'OTP SMS could not be sent. Please try again.');
    } finally {
        clearTimeout(timeout);
    }
};

const calculateLimits = (record, now) => {
    const hourlyWindowExpired = !record || now.getTime() - new Date(record.hourlyWindowStartedAt).getTime() >= HOUR_MS;
    const dailyWindowExpired = !record || now.getTime() - new Date(record.dailyWindowStartedAt).getTime() >= DAY_MS;
    const hourlySendCount = hourlyWindowExpired ? 0 : Number(record.hourlySendCount || 0);
    const dailySendCount = dailyWindowExpired ? 0 : Number(record.dailySendCount || 0);

    if (hourlySendCount >= env.customerAuth.maxSendsPerHour) {
        throw CustomError(STATUS_CODE.TOO_MANY_REQUEST, 'OTP hourly limit reached. Try again later.');
    }
    if (dailySendCount >= env.customerAuth.maxSendsPerDay) {
        throw CustomError(STATUS_CODE.TOO_MANY_REQUEST, 'OTP daily limit reached. Try again tomorrow.');
    }

    return {
        hourlySendCount: hourlySendCount + 1,
        hourlyWindowStartedAt: hourlyWindowExpired ? now : record.hourlyWindowStartedAt,
        dailySendCount: dailySendCount + 1,
        dailyWindowStartedAt: dailyWindowExpired ? now : record.dailyWindowStartedAt
    };
};

const sendOtp = async (rawPhoneNumber) => {
    const phoneNumber = normalizeIndianMobile(rawPhoneNumber);
    const now = new Date();
    const record = await db.customerOtps.findOne({ where: { phoneNumber } });

    if (record?.lastSentAt) {
        const elapsedSeconds = Math.floor((now.getTime() - new Date(record.lastSentAt).getTime()) / 1000);
        const remainingSeconds = env.customerAuth.resendCooldownSeconds - elapsedSeconds;
        if (remainingSeconds > 0) {
            throw CustomError(
                STATUS_CODE.TOO_MANY_REQUEST,
                `Please wait ${remainingSeconds} seconds before requesting another OTP.`
            );
        }
    }

    const limits = calculateLimits(record, now);
    const otp = generateOtp();
    await sendFast2SmsQuickMessage({ phoneNumber, otp });

    const values = {
        id: record?.id || uuidv4(),
        phoneNumber,
        otpHash: hashOtp(phoneNumber, otp),
        expiresAt: new Date(now.getTime() + env.customerAuth.otpExpiryMinutes * 60 * 1000),
        lastSentAt: now,
        attempts: 0,
        verifiedAt: null,
        ...limits
    };

    if (record) await record.update(values);
    else await db.customerOtps.create(values);

    return {
        phoneNumber,
        expiresInSeconds: env.customerAuth.otpExpiryMinutes * 60,
        resendAfterSeconds: env.customerAuth.resendCooldownSeconds
    };
};

const verifyOtp = async (rawPhoneNumber, rawOtp) => {
    const phoneNumber = normalizeIndianMobile(rawPhoneNumber);
    const otp = String(rawOtp || '').trim();

    if (!/^\d{6}$/.test(otp)) {
        throw CustomError(STATUS_CODE.BAD_REQUEST, 'Enter a valid 6-digit OTP');
    }

    const record = await db.customerOtps.findOne({ where: { phoneNumber } });
    if (!record) throw CustomError(STATUS_CODE.NOT_FOUND, 'Request an OTP first');
    if (record.verifiedAt) throw CustomError(STATUS_CODE.BAD_REQUEST, 'This OTP has already been used');
    if (new Date(record.expiresAt).getTime() <= Date.now()) {
        throw CustomError(STATUS_CODE.GONE, 'OTP expired. Request a new OTP.');
    }
    if (Number(record.attempts) >= env.customerAuth.maxAttempts) {
        throw CustomError(STATUS_CODE.TOO_MANY_REQUEST, 'Too many incorrect attempts. Request a new OTP.');
    }

    const expectedHash = Buffer.from(record.otpHash, 'hex');
    const receivedHash = Buffer.from(hashOtp(phoneNumber, otp), 'hex');
    const matches = expectedHash.length === receivedHash.length && crypto.timingSafeEqual(expectedHash, receivedHash);

    if (!matches) {
        await record.increment('attempts');
        const attemptsLeft = Math.max(0, env.customerAuth.maxAttempts - (Number(record.attempts) + 1));
        throw CustomError(STATUS_CODE.UNAUTHORIZED, `Incorrect OTP. ${attemptsLeft} attempt(s) left.`);
    }

    const verifiedAt = new Date();
    await record.update({ verifiedAt, attempts: Number(record.attempts) });

    const token = jwt.sign(
        { type: 'CUSTOMER', phoneNumber },
        env.customerAuth.jwtSecret,
        { expiresIn: env.customerAuth.tokenExpiry }
    );

    return { token, phoneNumber, verifiedAt };
};

export default {
    normalizeIndianMobile,
    sendOtp,
    verifyOtp
};
