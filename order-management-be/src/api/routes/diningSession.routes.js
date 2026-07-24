import { Router } from 'express';

import diningSessionController from '../controllers/diningSession.controller.js';
import authenticate from '../middlewares/auth.js';
import customerSessionAuth from '../middlewares/customerSessionAuth.js';
import checkSubscriptionAccess from '../middlewares/subscription.js';

const router = Router();

router.get('/table/:tableId/availability', diningSessionController.availability);
router.post('/table/:tableId/start', customerSessionAuth, diningSessionController.start);

// Friend requests host approval. /join is kept as an alias for older frontend code.
router.post('/table/:tableId/request-join', customerSessionAuth, diningSessionController.requestJoin);
router.post('/table/:tableId/join', customerSessionAuth, diningSessionController.requestJoin);

// Customer-host approval APIs.
router.get(
    '/table/:tableId/pending-requests',
    customerSessionAuth,
    diningSessionController.pendingRequests
);
router.post(
    '/table/:tableId/respond-request',
    customerSessionAuth,
    diningSessionController.respondToRequest
);
router.get(
    '/join-request/:requestId/status',
    customerSessionAuth,
    diningSessionController.requestStatus
);
router.get('/table/:tableId/details', customerSessionAuth, diningSessionController.customerDetails);
router.post('/table/:tableId/leave', customerSessionAuth, diningSessionController.leave);
router.post('/table/:tableId/end', customerSessionAuth, diningSessionController.end);
router.delete(
    '/table/:tableId/members/:memberId',
    customerSessionAuth,
    diningSessionController.removeMember
);

router.get(
    '/manager/table/:tableId',
    authenticate,
    checkSubscriptionAccess,
    diningSessionController.details
);
router.patch(
    '/manager/table/:tableId/action',
    authenticate,
    checkSubscriptionAccess,
    diningSessionController.tableAction
);
router.post(
    '/manager/table/:tableId/close',
    authenticate,
    checkSubscriptionAccess,
    diningSessionController.close
);

export default router;
