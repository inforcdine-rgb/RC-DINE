import legalPageService from '../services/legalPage.service.js';

const sendError = (res, error) =>
    res.status(error.code || 500).send({
        message: error.message || 'Legal page request failed'
    });

const getPublic = async (req, res) => {
    try {
        const page = await legalPageService.getPublic(req.params.slug);
        return res.status(200).send(page);
    } catch (error) {
        return sendError(res, error);
    }
};

const getAdmin = async (req, res) => {
    try {
        const page = await legalPageService.getAdmin(req.params.slug);
        return res.status(200).send(page);
    } catch (error) {
        return sendError(res, error);
    }
};

const update = async (req, res) => {
    try {
        const page = await legalPageService.update(req.params.slug, req.body);
        return res.status(200).send(page);
    } catch (error) {
        return sendError(res, error);
    }
};

export default { getPublic, getAdmin, update };
