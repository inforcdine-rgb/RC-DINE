import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import adminAuthController from '../controllers/adminAuth.controller.js';
import authenticate from '../middlewares/auth.js';
import { adminAuthentication } from '../middlewares/roleAuth.js';

const router = Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many admin login attempts. Try again after 15 minutes.' }
});

const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many OTP attempts. Try again after 15 minutes.' }
});

const securityLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many security changes. Try again later.' }
});

router.post('/login', loginLimiter, adminAuthController.startLogin);
router.post('/login/verify', otpLimiter, adminAuthController.verifyLogin);
router.post('/otp/resend', otpLimiter, adminAuthController.resend);

router.post(
    '/security/email/request',
    authenticate,
    adminAuthentication,
    securityLimiter,
    adminAuthController.requestEmailChange
);
router.post(
    '/security/email/verify',
    authenticate,
    adminAuthentication,
    securityLimiter,
    adminAuthController.verifyEmailChange
);
router.post(
    '/security/password/request',
    authenticate,
    adminAuthentication,
    securityLimiter,
    adminAuthController.requestPasswordChange
);
router.post(
    '/security/password/verify',
    authenticate,
    adminAuthentication,
    securityLimiter,
    adminAuthController.verifyPasswordChange
);

export default router;
