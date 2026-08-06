import CryptoJS from 'crypto-js';
import env from '../../config/env.js';
import logger from '../../config/logger.js';
import ownerAccountService from '../services/ownerAccount.service.js';
import { STATUS_CODE } from '../utils/common.js';
import { changeOwnerEmailValidation } from '../validations/ownerAccount.validation.js';

const decryptPasswordIfNeeded = (value) => {
    if (typeof value !== 'string') return '';

    try {
        return CryptoJS.AES.decrypt(value, env.cryptoSecret).toString(CryptoJS.enc.Utf8) || value;
    } catch (_error) {
        return value;
    }
};

const changeEmail = async (req, res) => {
    try {
        logger('info', 'Received owner email update request', { ownerId: req.user.id });
        const valid = changeOwnerEmailValidation({
            currentPassword: decryptPasswordIfNeeded(req.body?.currentPassword),
            newEmail: req.body?.newEmail,
            confirmEmail: req.body?.confirmEmail
        });

        if (valid.error) {
            return res.status(STATUS_CODE.BAD_REQUEST).json({ success: false, message: valid.error.message });
        }

        const result = await ownerAccountService.changeEmail(req.user.id, valid.value);
        logger('info', 'Owner email updated and sessions invalidated', { ownerId: req.user.id });
        return res.status(STATUS_CODE.OK).json(result);
    } catch (error) {
        logger('warn', 'Owner email update rejected', { ownerId: req.user?.id });
        return res.status(error.code || STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || 'Unable to update email. Please try again.'
        });
    }
};

export default { changeEmail };
