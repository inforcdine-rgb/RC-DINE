/* eslint-disable camelcase */
import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import logger from './logger.js';

const requiredCloudinaryKeys = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];

const missingCloudinaryKeys = requiredCloudinaryKeys.filter((key) => !process.env[key]);

if (missingCloudinaryKeys.length) {
    logger('error', `Missing Cloudinary configuration: ${missingCloudinaryKeys.join(', ')}`);
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const makeStorage = ({ folder, width, height, crop = 'fill' }) =>
    new CloudinaryStorage({
        cloudinary,
        params: {
            folder,
            allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
            format: 'webp',
            transformation: [{ width, height, crop, quality: 'auto:good', fetch_format: 'webp' }]
        }
    });

const imageFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    return cb(new Error('Only JPG, PNG and WebP images are allowed'), false);
};

export const upload = multer({
    storage: makeStorage({ folder: 'rc-dine/menu', width: 800, height: 600 }),
    limits: { fileSize: 3 * 1024 * 1024 },
    fileFilter: imageFilter
});

export const uploadHotelLogo = multer({
    storage: makeStorage({ folder: 'rc-dine/hotels/logos', width: 512, height: 512 }),
    limits: { fileSize: 1024 * 1024 },
    fileFilter: imageFilter
});

export const uploadLandingLogo = multer({
    storage: makeStorage({ folder: 'rc-dine/website/logo', width: 512, height: 512, crop: 'fit' }),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: imageFilter
});

const landingVideoStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'rc-dine/website/videos',
        resource_type: 'video',
        allowed_formats: ['mp4', 'webm', 'mov']
    }
});

export const uploadLandingVideo = multer({
    storage: landingVideoStorage,
    limits: { fileSize: 40 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['video/mp4', 'video/webm', 'video/quicktime'];
        if (allowed.includes(file.mimetype)) return cb(null, true);
        return cb(new Error('Only MP4, WebM and MOV videos are allowed'), false);
    }
});

export const deleteImage = async (imageUrl) => {
    try {
        if (!imageUrl || !imageUrl.includes('cloudinary')) return;
        const uploadIndex = imageUrl.indexOf('/upload/');
        if (uploadIndex < 0) return;
        let publicId = imageUrl.slice(uploadIndex + 8).replace(/^v\d+\//, '');
        publicId = publicId.replace(/\.[^.]+$/, '');
        await cloudinary.uploader.destroy(publicId);
        logger('info', `Deleted image from cloudinary: ${publicId}`);
    } catch (error) {
        logger('error', `Failed to delete image from cloudinary: ${error.message}`);
    }
};

export default cloudinary;
