import { Router } from 'express';

import legalPageController from '../controllers/legalPage.controller.js';
import authenticate from '../middlewares/auth.js';
import { adminAuthentication } from '../middlewares/roleAuth.js';

const router = Router();

router.get('/public/:slug', legalPageController.getPublic);
router.get('/:slug', authenticate, adminAuthentication, legalPageController.getAdmin);
router.put('/:slug', authenticate, adminAuthentication, legalPageController.update);

export default router;
