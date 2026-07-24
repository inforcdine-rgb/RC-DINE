import logger from '../../config/logger.js';
import adminService from '../services/admin.service.js';
import { STATUS_CODE } from '../utils/common.js';

const dashboard = async (req, res) => {
    try {
        const result = await adminService.dashboard();
        logger('info', 'Admin dashboard data fetched successfully', { result });
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        logger('error', 'Error occurred during admin dashboard fetch', { error });
        return res.status(error.code || STATUS_CODE.INTERNAL_SERVER_ERROR).send({ message: error.message });
    }
};

const owners = async (req, res) => {
    try {
        const result = await adminService.listOwners(req.query);
        logger('info', 'Admin owners list fetched successfully', { result });
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        logger('error', 'Error occurred while fetching admin owners list', { error });
        return res.status(error.code || STATUS_CODE.INTERNAL_SERVER_ERROR).send({ message: error.message });
    }
};

const ownerDetail = async (req, res) => {
    try {
        const result = await adminService.getOwnerDetail(req.params.id);
        logger('info', 'Admin owner detail fetched successfully', { result });
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        logger('error', 'Error occurred while fetching admin owner detail', { error });
        return res.status(error.code || STATUS_CODE.INTERNAL_SERVER_ERROR).send({ message: error.message });
    }
};

const blockOwner = async (req, res) => {
    try {
        const result = await adminService.blockOwner(req.params.id);
        logger('info', `Owner ${req.params.id} block status toggled`);
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        logger('error', 'Error occurred during owner block/unblock', { error });
        return res.status(error.code || STATUS_CODE.INTERNAL_SERVER_ERROR).send({ message: error.message });
    }
};

const extendSubscription = async (req, res) => {
    try {
        const { days } = req.body;
        const result = await adminService.extendSubscription(req.params.id, Number(days));
        logger('info', `Subscription extended for owner ${req.params.id}`);
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        logger('error', 'Error occurred during subscription extend', { error });
        return res.status(error.code || STATUS_CODE.INTERNAL_SERVER_ERROR).send({ message: error.message });
    }
};

const revenue = async (req, res) => {
    try {
        const result = await adminService.revenue();
        logger('info', 'Admin revenue analytics fetched successfully', { result });
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        logger('error', 'Error occurred while fetching admin revenue analytics', { error });
        return res.status(error.code || STATUS_CODE.INTERNAL_SERVER_ERROR).send({ message: error.message });
    }
};

const getSettings = async (req, res) => {
    try {
        const result = await adminService.getSettings(req.user.id);
        logger('info', 'Admin settings fetched successfully');
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        logger('error', 'Error occurred during admin settings fetch', { error });
        return res.status(error.code || STATUS_CODE.INTERNAL_SERVER_ERROR).send({ message: error.message });
    }
};

const updateSettings = async (req, res) => {
    try {
        const result = await adminService.updateSettings(req.user.id, req.body);
        logger('info', 'Admin settings updated successfully');
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        logger('error', 'Error occurred during admin settings update', { error });
        return res.status(error.code || STATUS_CODE.INTERNAL_SERVER_ERROR).send({ message: error.message });
    }
};

export default {
    dashboard,
    owners,
    ownerDetail,
    blockOwner,
    extendSubscription,
    revenue,
    getSettings,
    updateSettings
};
