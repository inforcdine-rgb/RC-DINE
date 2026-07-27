import contactEnquiryService from '../services/contactEnquiry.service.js';

const sendError = (res, error) =>
    res.status(error.code || 500).send({ message: error.message || 'Contact enquiry request failed' });

const create = async (req, res) => {
    try {
        return res.status(201).send(await contactEnquiryService.create(req.body));
    } catch (error) {
        return sendError(res, error);
    }
};

const list = async (req, res) => {
    try {
        return res.status(200).send(await contactEnquiryService.list(req.query));
    } catch (error) {
        return sendError(res, error);
    }
};

const update = async (req, res) => {
    try {
        return res.status(200).send(await contactEnquiryService.update(req.params.id, req.body));
    } catch (error) {
        return sendError(res, error);
    }
};

export default { create, list, update };
