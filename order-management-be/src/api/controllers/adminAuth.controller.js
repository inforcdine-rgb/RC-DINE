import logger from '../../config/logger.js';
import adminAuthService from '../services/adminAuth.service.js';
import { STATUS_CODE } from '../utils/common.js';

const metadata = (req) => ({
    ipAddress: req.ip,
    userAgent: req.get('user-agent')
});

const sendResult = async (res, operation) => {
    try {
        const result = await operation();
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        logger('warn', 'Admin authentication request rejected', { message: error.message, code: error.code });
        return res.status(error.code || STATUS_CODE.INTERNAL_SERVER_ERROR).send({ message: error.message });
    }
};

const startLogin = (req, res) => sendResult(res, () => adminAuthService.startLogin(req.body, metadata(req)));

const verifyLogin = (req, res) => sendResult(res, () => adminAuthService.verifyLogin(req.body));

const resend = (req, res) => sendResult(res, () => adminAuthService.resend(req.body));

const requestEmailChange = (req, res) =>
    sendResult(res, () => adminAuthService.requestEmailChange(req.user.id, req.body, metadata(req)));

const verifyEmailChange = (req, res) =>
    sendResult(res, () => adminAuthService.verifyEmailChange(req.user.id, req.body));

const requestPasswordChange = (req, res) =>
    sendResult(res, () => adminAuthService.requestPasswordChange(req.user.id, req.body, metadata(req)));

const verifyPasswordChange = (req, res) =>
    sendResult(res, () => adminAuthService.verifyPasswordChange(req.user.id, req.body));

export default {
    startLogin,
    verifyLogin,
    resend,
    requestEmailChange,
    verifyEmailChange,
    requestPasswordChange,
    verifyPasswordChange
};
