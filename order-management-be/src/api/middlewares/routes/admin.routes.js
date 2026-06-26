import { Router } from 'express';
import adminController from '../controllers/admin.controller.js';
import authenticate from '../middlewares/auth.js';
import { adminAuthentication } from '../middlewares/roleAuth.js';

const router = Router();

router.get('/dashboard', authenticate, adminAuthentication, adminController.dashboard);
router.get('/owners', authenticate, adminAuthentication, adminController.owners);
router.get('/owners/:id', authenticate, adminAuthentication, adminController.ownerDetail);
router.patch('/owners/:id/block', authenticate, adminAuthentication, adminController.blockOwner);
router.patch('/owners/:id/extend', authenticate, adminAuthentication, adminController.extendSubscription);
router.get('/revenue', authenticate, adminAuthentication, adminController.revenue);
router.get('/settings', authenticate, adminAuthentication, adminController.getSettings);
router.put('/settings', authenticate, adminAuthentication, adminController.updateSettings);

export default router;