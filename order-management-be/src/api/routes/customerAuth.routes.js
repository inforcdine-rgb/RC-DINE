import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import customerAuthController from '../controllers/customerAuth.controller.js';

const router = Router();

const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many OTP requests from this device. Try again later.' }
});

router.post('/send-otp', otpLimiter, customerAuthController.sendOtp);
router.post('/verify-otp', otpLimiter, customerAuthController.verifyOtp);

export default router;
