import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import contactEnquiryController from '../controllers/contactEnquiry.controller.js';
import authenticate from '../middlewares/auth.js';
import { adminAuthentication } from '../middlewares/roleAuth.js';

const router = Router();
const publicLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many enquiries. Please try again later.' }
});

router.post('/public', publicLimiter, contactEnquiryController.create);
router.get('/', authenticate, adminAuthentication, contactEnquiryController.list);
router.patch('/:id', authenticate, adminAuthentication, contactEnquiryController.update);

export default router;
