import jwt from 'jsonwebtoken';

import env from '../../config/env.js';
import { STATUS_CODE } from '../utils/common.js';

const customerNotificationAuth = (req, res, next) => {
    const authorization = req.headers.authorization || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';

    if (!token) {
        return res.status(STATUS_CODE.UNAUTHORIZED).json({ message: 'Customer login required' });
    }

    try {
        const payload = jwt.verify(token, env.customerAuth.jwtSecret);
        if (!['CUSTOMER', 'CUSTOMER_PUSH'].includes(payload.type) || !payload.phoneNumber) {
            return res.status(STATUS_CODE.UNAUTHORIZED).json({ message: 'Invalid customer token' });
        }
        req.customer = payload;
        return next();
    } catch (_error) {
        return res.status(STATUS_CODE.UNAUTHORIZED).json({ message: 'Customer session expired or invalid' });
    }
};

export default customerNotificationAuth;
