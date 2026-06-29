import { Router } from 'express';
import menuController from '../controllers/menu.controller.js';
import authenticate from '../middlewares/auth.js';
import checkSubscriptionAccess from '../middlewares/subscription.js';
import { upload } from '../../config/cloudinary.js';

const router = Router();

// Category routes — unchanged
router.route('/category').all(authenticate, checkSubscriptionAccess).post(menuController.createCategory).delete(menuController.removeCategory);
router.get('/category/:hotelId', authenticate, checkSubscriptionAccess, menuController.fetchCategory);
router.put('/category/:id', authenticate, checkSubscriptionAccess, menuController.updateCategory);

// Combo routes — separate from categories
router.route('/combo').all(authenticate, checkSubscriptionAccess).post(menuController.createCombo).delete(menuController.removeCombos);
router.get('/combo/:hotelId', authenticate, checkSubscriptionAccess, menuController.fetchCombos);
router.put('/combo/:id', authenticate, checkSubscriptionAccess, menuController.updateCombo);

// Menu routes
// POST /menu — create menu items (no image, batch create stays same)
// PUT /menu/:id — update menu item, optional image upload
// GET /menu/:id — fetch menu items
// DELETE /menu — remove menu items
router.route('/').all(authenticate, checkSubscriptionAccess).post(menuController.create).delete(menuController.remove);
router
    .route('/:id')
    .all(authenticate, checkSubscriptionAccess)
    .get(menuController.fetch)
    .put(upload.single('image'), menuController.update); // ← image middleware only on update

// Separate route for uploading image to an existing menu item
router.post('/:id/image', authenticate, checkSubscriptionAccess, upload.single('image'), menuController.uploadImage);

export default router;
