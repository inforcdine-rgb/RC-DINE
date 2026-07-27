/* eslint-disable camelcase */
import cloudinary from '../../config/cloudinary.js';
import { db } from '../../config/database.js';

const defaults = {
    heroTitle: 'Restaurant Management Reimagined with AI',
    heroDescription:
        'Run orders, billing, kitchen operations, analytics and subscriptions from one intelligent platform.',
    primaryButtonText: 'Start Free Trial →',
    secondaryButtonText: '▶ Watch Demo',
    videoEnabled: true,
    isPublished: true
};

const getOrCreate = async () => {
    let settings = await db.websiteSettings.findOne({ order: [['id', 'ASC']] });
    if (!settings) settings = await db.websiteSettings.create(defaults);
    return settings;
};

const publicSettings = async () => {
    const settings = await getOrCreate();
    return settings.toJSON();
};

const update = async (payload = {}) => {
    const settings = await getOrCreate();
    const allowed = [
        'heroTitle',
        'heroDescription',
        'primaryButtonText',
        'secondaryButtonText',
        'videoEnabled',
        'isPublished'
    ];
    const changes = {};
    allowed.forEach((key) => {
        if (payload[key] !== undefined) changes[key] = payload[key];
    });
    await settings.update(changes);
    return settings.toJSON();
};

const destroyAsset = async (publicId, resourceType = 'image') => {
    if (!publicId) return;
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

const updateLogo = async (file) => {
    if (!file?.path) throw new Error('Logo image is required');
    const settings = await getOrCreate();
    const previousPublicId = settings.logoPublicId;
    await settings.update({ logoUrl: file.path, logoPublicId: file.filename || null });
    if (previousPublicId && previousPublicId !== file.filename) await destroyAsset(previousPublicId, 'image');
    return settings.toJSON();
};

const updateVideo = async (file) => {
    if (!file?.path) throw new Error('Landing video is required');
    const settings = await getOrCreate();
    const previousPublicId = settings.heroVideoPublicId;
    await settings.update({ heroVideoUrl: file.path, heroVideoPublicId: file.filename || null, videoEnabled: true });
    if (previousPublicId && previousPublicId !== file.filename) await destroyAsset(previousPublicId, 'video');
    return settings.toJSON();
};

const removeVideo = async () => {
    const settings = await getOrCreate();
    const previousPublicId = settings.heroVideoPublicId;
    await settings.update({ heroVideoUrl: null, heroVideoPublicId: null, videoEnabled: false });
    await destroyAsset(previousPublicId, 'video');
    return settings.toJSON();
};

export default { publicSettings, update, updateLogo, updateVideo, removeVideo };
