import { Router } from 'express';
import checkoutController from '../controllers/checkout.controller.js';
import authenticate from '../middlewares/auth.js';
import customerSessionAuth from '../middlewares/customerSessionAuth.js';
import { ownerAuthentication } from '../middlewares/roleAuth.js';
import checkSubscriptionAccess from '../middlewares/subscription.js';

const router = Router();

router.post('/business', authenticate, ownerAuthentication, checkoutController.business);
router.post('/stakeholder', authenticate, ownerAuthentication, checkoutController.stakeholder);
router.post('/account', authenticate, ownerAuthentication, checkoutController.account);
router.post('/success', authenticate, ownerAuthentication, checkoutController.deprecatedSubscriptionSuccess);
router.post('/payment', customerSessionAuth, checkoutController.payment);
router.post('/confirm', customerSessionAuth, checkoutController.paymentConfirmation);
router.post(
    '/confirm-manual',
    authenticate,
    checkSubscriptionAccess,
    checkoutController.manualPaymentConfirmation
);
router.post('/subscribe', authenticate, ownerAuthentication, checkoutController.subscribe);
router.post('/cancel', authenticate, ownerAuthentication, checkoutController.cancel);

export default router;
