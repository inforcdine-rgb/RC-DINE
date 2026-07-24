import { Router } from 'express';
import tableController from '../controllers/table.controller.js';
import authenticate from '../middlewares/auth.js';
import checkSubscriptionAccess from '../middlewares/subscription.js';

const router = Router();

router
    .route('/:hotelId')
    .all(authenticate, checkSubscriptionAccess)
    .get(tableController.fetch)
    .post(tableController.create)
    .delete(tableController.remove);

router
    .route('/:hotelId/:tableId')
    .all(authenticate, checkSubscriptionAccess)
    .put(tableController.updateName);

export default router;
