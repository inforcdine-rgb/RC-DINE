import logger from '../../config/logger.js';
import customerAuthService from '../services/customerAuth.service.js';
import { STATUS_CODE } from '../utils/common.js';

const sendOtp = async (req, res) => {
    try {
        const result = await customerAuthService.sendOtp(req.body?.phoneNumber);
        return res.status(STATUS_CODE.OK).json({
            success: true,
            message: 'OTP sent successfully',
            ...result
        });
    } catch (error) {
        logger('error', `Customer OTP send failed: ${error.message}`);
        return res.status(error.code || STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const result = await customerAuthService.verifyOtp(req.body?.phoneNumber, req.body?.otp);
        return res.status(STATUS_CODE.OK).json({
            success: true,
            message: 'Mobile number verified successfully',
            ...result
        });
    } catch (error) {
        logger('error', `Customer OTP verification failed: ${error.message}`);
        return res.status(error.code || STATUS_CODE.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

export default { sendOtp, verifyOtp };
