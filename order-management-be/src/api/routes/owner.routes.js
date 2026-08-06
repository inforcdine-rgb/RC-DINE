import { Router } from 'express';
import ownerAccountController from '../controllers/ownerAccount.controller.js';
import authenticate from '../middlewares/auth.js';
import { ownerAccountLimiter } from '../middlewares/ownerRecoveryRateLimit.js';
import { ownerAuthentication } from '../middlewares/roleAuth.js';

const router = Router();

router.patch(
    '/account/email',
    authenticate,
    ownerAuthentication,
    ownerAccountLimiter,
    ownerAccountController.changeEmail
);

export default router;
