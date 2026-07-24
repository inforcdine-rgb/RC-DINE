import { Router } from 'express';
import { uploadHotelLogo } from '../../config/cloudinary.js';
import hotelController from '../controllers/hotel.controller.js';
import authenticate from '../middlewares/auth.js';
import { ownerAuthentication } from '../middlewares/roleAuth.js';
import checkSubscriptionAccess from '../middlewares/subscription.js';

const router = Router();

const handleHotelLogoUpload = (req, res, next) => {
    uploadHotelLogo.single('logo')(req, res, (error) => {
        if (error) {
            console.error('Hotel logo multer/cloudinary error:', {
                message: error.message,
                code: error.code,
                stack: error.stack
            });

            return res.status(400).send({
                message:
                    error.code === 'LIMIT_FILE_SIZE'
                        ? 'Hotel logo must be smaller than 1 MB'
                        : error.message || 'Invalid hotel logo image'
            });
        }

        if (!req.file) {
            return res.status(400).send({
                message: 'Logo image server tak receive nahi hui'
            });
        }

        return next();
    });
};

router.put('/:id', authenticate, checkSubscriptionAccess, hotelController.update);
router.post(
    '/:id/logo',
    authenticate,
    ownerAuthentication,
    handleHotelLogoUpload,
    hotelController.uploadLogo
);

router.delete(
    '/:id/logo',
    authenticate,
    ownerAuthentication,
    hotelController.removeLogo
);
router.get('/:id/payment-settings', authenticate, checkSubscriptionAccess, hotelController.getPaymentSettings);
router.put('/:id/payment-settings', authenticate, checkSubscriptionAccess, hotelController.updatePaymentSettings);
router.get('/:id/printer-settings', authenticate, checkSubscriptionAccess, hotelController.getPrinterSettings);
router.put('/:id/printer-settings', authenticate, checkSubscriptionAccess, hotelController.updatePrinterSettings);
router.post('/:id/payment-settings/test', authenticate, checkSubscriptionAccess, hotelController.testPaymentSettings);
router.route('/').all(authenticate, ownerAuthentication).post(hotelController.register).get(hotelController.list);
router.delete('/:id', authenticate, checkSubscriptionAccess, ownerAuthentication, hotelController.remove);
router.get('/revenue', authenticate, checkSubscriptionAccess, ownerAuthentication, hotelController.revenue);
router.get('/dashboard/:hotelId', authenticate, checkSubscriptionAccess, hotelController.dashboard);

export default router;
