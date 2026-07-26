import { Router } from 'express';
import websiteSettingsController from '../controllers/websiteSettings.controller.js';
import authenticate from '../middlewares/auth.js';
import { adminAuthentication } from '../middlewares/roleAuth.js';
import { uploadLandingLogo, uploadLandingVideo } from '../../config/cloudinary.js';

const router = Router();
router.get('/public', websiteSettingsController.getPublic);
router.get('/', authenticate, adminAuthentication, websiteSettingsController.getAdmin);
router.put('/', authenticate, adminAuthentication, websiteSettingsController.update);
router.post('/logo', authenticate, adminAuthentication, uploadLandingLogo.single('logo'), websiteSettingsController.uploadLogo);
router.post('/video', authenticate, adminAuthentication, uploadLandingVideo.single('video'), websiteSettingsController.uploadVideo);
router.delete('/video', authenticate, adminAuthentication, websiteSettingsController.deleteVideo);
export default router;
