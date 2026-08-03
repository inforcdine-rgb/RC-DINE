import crypto from 'crypto';
import rateLimit from 'express-rate-limit';

const WINDOW_MS = 30 * 60 * 1000;
const GENERIC_MESSAGE = 'Email or recovery code is incorrect.';

const emailKey = (email) =>
    `owner-recovery-email:${crypto
        .createHash('sha256')
        .update(
            String(email || '')
                .trim()
                .toLowerCase()
        )
        .digest('hex')}`;

const rateLimitHandler = (_req, res) => res.status(429).json({ message: GENERIC_MESSAGE });

export const ownerRecoveryIpLimiter = rateLimit({
    windowMs: WINDOW_MS,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    handler: rateLimitHandler
});

export const ownerRecoveryEmailLimiter = rateLimit({
    windowMs: WINDOW_MS,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    keyGenerator: (req) => emailKey(req.body?.email),
    handler: rateLimitHandler
});

export const clearOwnerRecoveryEmailRateLimit = (email) => ownerRecoveryEmailLimiter.resetKey(emailKey(email));
