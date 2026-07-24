import path from 'path';
import { Router } from 'express';
import multer from 'multer';
import menuController from '../controllers/menu.controller.js';
import authenticate from '../middlewares/auth.js';
import checkSubscriptionAccess from '../middlewares/subscription.js';

const router = Router();

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, 'src/uploads/menu');
    },
    filename: (_req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

router.route('/category').all(authenticate, checkSubscriptionAccess).post(menuController.createCategory).delete(menuController.removeCategory);
router.get('/category/:hotelId', authenticate, checkSubscriptionAccess, menuController.fetchCategory);
router.put('/category/:id', authenticate, checkSubscriptionAccess, menuController.updateCategory);

router
    .route('/')
    .all(authenticate, checkSubscriptionAccess)
    .post(upload.array('images'), menuController.create)
    .delete(menuController.remove);

router
    .route('/:id')
    .all(authenticate, checkSubscriptionAccess)
    .put(upload.single('image'), menuController.update)
    .get(menuController.fetch);

export default router;
