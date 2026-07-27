import websiteSettingsService from '../services/websiteSettings.service.js';

const sendError = (res, error) =>
    res.status(error.code || 500).send({ message: error.message || 'Website settings request failed' });

const getPublic = async (req, res) => {
    try {
        return res.status(200).send(await websiteSettingsService.publicSettings());
    } catch (error) {
        return sendError(res, error);
    }
};

const getAdmin = getPublic;

const update = async (req, res) => {
    try {
        return res.status(200).send(await websiteSettingsService.update(req.body));
    } catch (error) {
        return sendError(res, error);
    }
};

const uploadLogo = async (req, res) => {
    try {
        return res.status(200).send(await websiteSettingsService.updateLogo(req.file));
    } catch (error) {
        return sendError(res, error);
    }
};

const uploadVideo = async (req, res) => {
    try {
        return res.status(200).send(await websiteSettingsService.updateVideo(req.file));
    } catch (error) {
        return sendError(res, error);
    }
};

const deleteVideo = async (req, res) => {
    try {
        return res.status(200).send(await websiteSettingsService.removeVideo());
    } catch (error) {
        return sendError(res, error);
    }
};

export default { getPublic, getAdmin, update, uploadLogo, uploadVideo, deleteVideo };
