import { Router } from 'express';
import orderController from '../controllers/order.controller.js';
import authenticate from '../middlewares/auth.js';
import customerSessionAuth from '../middlewares/customerSessionAuth.js';
import optionalCustomerSessionAuth from '../middlewares/optionalCustomerSessionAuth.js';
import staffOrCustomerAuth from '../middlewares/staffOrCustomerAuth.js';
import checkSubscriptionAccess from '../middlewares/subscription.js';

const router = Router();

router.post('/', customerSessionAuth, orderController.placeOrder);
router.post('/walk-in', authenticate, checkSubscriptionAccess, orderController.createWalkInOrder);
router.post('/customer', optionalCustomerSessionAuth, orderController.register);

router.put('/pending', authenticate, checkSubscriptionAccess, orderController.updatePending);

router.get('/menu', customerSessionAuth, orderController.getMenuDetails);
router.post('/feedback', customerSessionAuth, orderController.feedback);
router.get('/table/:id', optionalCustomerSessionAuth, orderController.getTableDetails);
router.post('/table/:tableId/reset', authenticate, checkSubscriptionAccess, orderController.resetTable);

router.get('/details/:hotelId/:orderId', authenticate, checkSubscriptionAccess, orderController.getOrderDetails);
router.put('/status/:hotelId', authenticate, checkSubscriptionAccess, orderController.updateOrderStatus);

router.patch('/:orderId/cancel', customerSessionAuth, orderController.cancelOrder);
router.get('/completed/:hotelId', authenticate, checkSubscriptionAccess, orderController.completed);
router.get('/active/:tableId', authenticate, checkSubscriptionAccess, orderController.active);

router.get('/:orderId/status', customerSessionAuth, orderController.getOrderStatus);
router.get('/:orderId/details', customerSessionAuth, orderController.getPublicOrderDetails);
router.get('/:customerId', customerSessionAuth, orderController.getOrder);

router.get('/invoice/:hotelId/:orderId', staffOrCustomerAuth, orderController.downloadInvoice);
export default router;
