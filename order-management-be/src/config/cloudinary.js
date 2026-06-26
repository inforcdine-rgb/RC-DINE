import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import logger from './logger.js';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'rc-dine/menu',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 600, height: 600, crop: 'fill', quality: 'auto' }]
    }
});

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPG, PNG and WebP images are allowed'), false);
        }
    }
});

export const deleteImage = async (imageUrl) => {
    try {
        if (!imageUrl) return;
        // Extract public_id from URL: rc-dine/menu/filename
        const parts = imageUrl.split('/');
        const publicId = `${parts[parts.length - 2]}/${parts[parts.length - 1].split('.')[0]}`;
        await cloudinary.uploader.destroy(publicId);
        logger('info', `Deleted image from cloudinary: ${publicId}`);
    } catch (error) {
        logger('error', `Failed to delete image from cloudinary: ${error.message}`);
    }
};

export default cloudinary;
