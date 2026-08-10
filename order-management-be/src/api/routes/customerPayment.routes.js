import { Router } from 'express';
import customerPaymentController from '../controllers/customerPayment.controller.js';
import customerSessionAuth from '../middlewares/customerSessionAuth.js';

const router = Router();

router.post('/create-order', customerSessionAuth, customerPaymentController.createOrder);
router.post('/verify', customerSessionAuth, customerPaymentController.verifyPayment);

export default router;
