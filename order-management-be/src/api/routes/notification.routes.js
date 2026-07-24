import { Router } from 'express';
import notificationController from '../controllers/notification.controller.js';
import authenticate from '../middlewares/auth.js';
import customerNotificationAuth from '../middlewares/customerNotificationAuth.js';

const router = Router();

const addNotificationRoutes = (route, middleware) => {
    route.get('/', middleware, notificationController.fetch);
    route.put('/', middleware, notificationController.update);
    route.put('/:notificationId/read', middleware, notificationController.update);
    route.delete('/', middleware, notificationController.clear);
    route.delete('/:notificationId', middleware, notificationController.remove);
    route.post('/:notificationId/restore', middleware, notificationController.restore);
    route.post('/subscribe', middleware, notificationController.subscribe);
    route.post('/unsubscribe', middleware, notificationController.unsubscribe);
};

addNotificationRoutes(router, authenticate);

const customerRouter = Router();
addNotificationRoutes(customerRouter, customerNotificationAuth);
router.use('/customer', customerRouter);

export default router;
