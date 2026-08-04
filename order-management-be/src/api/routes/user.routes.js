import { Router } from 'express';
import userController from '../controllers/user.controllers.js';
import authenticate from '../middlewares/auth.js';
import { ownerRecoveryEmailLimiter, ownerRecoveryIpLimiter } from '../middlewares/ownerRecoveryRateLimit.js';
import { ownerAuthentication } from '../middlewares/roleAuth.js';

const router = Router();

// owner apis
router.post('/register', userController.create);
router.post('/login', userController.login);
router.post('/google-login', userController.googleLogin);
router.post('/verify', userController.verify);
router.post('/forget', userController.forget);
router.post('/reset', userController.reset);
router.post(
    '/owner/recovery/reset',
    ownerRecoveryIpLimiter,
    ownerRecoveryEmailLimiter,
    userController.resetOwnerPassword
);
router.put(
    '/owner/recovery-code',
    authenticate,
    ownerAuthentication,
    userController.setRecoveryCode
);

router.route('/').all(authenticate).get(userController.getUser).put(userController.update);

// invite apis
router
    .route('/invite')
    .all(authenticate, ownerAuthentication)
    .post(userController.invite)
    .get(userController.listInvites);

router.delete('/invite/:id', authenticate, ownerAuthentication, userController.removeInvite);

export default router;
