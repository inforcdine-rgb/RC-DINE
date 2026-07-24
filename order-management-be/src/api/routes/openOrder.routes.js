import { Router } from 'express';
import openOrderController from '../controllers/openOrder.controller.js';
import authenticate from '../middlewares/auth.js';
import { managerPosAuthentication } from '../middlewares/roleAuth.js';
import checkSubscriptionAccess from '../middlewares/subscription.js';

const router = Router();
const checkPosSubscription = (req, res, next) => (
    req.user?.role === 'ADMIN' ? next() : checkSubscriptionAccess(req, res, next)
);

router.use(authenticate, managerPosAuthentication, checkPosSubscription);
router.post('/open', openOrderController.create);
router.get('/open', openOrderController.list);
router.get('/open/completed', openOrderController.listCompleted);
router.put('/:id/add-items', openOrderController.addItems);
router.post('/:id/generate-bill', openOrderController.generateBill);
router.post('/:id/payment', openOrderController.payment);
router.post('/:id/close', openOrderController.close);
router.post('/:id/kot', openOrderController.printKot);
router.get('/:id', openOrderController.getById);

export default router;
