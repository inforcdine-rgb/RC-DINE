import jwt from 'jsonwebtoken';

import { db } from '../../config/database.js';
import env from '../../config/env.js';
import { STATUS_CODE } from '../utils/common.js';

const staffOrCustomerAuth = async (req, res, next) => {
    const authorization = req.headers.authorization || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
    if (!token) return res.status(STATUS_CODE.UNAUTHORIZED).json({ message: 'Authentication required' });

    try {
        const customer = jwt.verify(token, env.customerAuth.jwtSecret);
        if (['CUSTOMER', 'CUSTOMER_PUSH'].includes(customer.type) && customer.customerId) {
            req.customer = customer;
            return next();
        }
    } catch (_error) {
        // Try staff authentication below.
    }

    try {
        const user = jwt.verify(token, env.jwtSecret);
        if (!user?.id || user.type) throw new Error('Invalid staff token');
        const currentUser = await db.users.findOne({
            where: { id: user.id },
            attributes: ['id', 'tokenVersion']
        });
        if (!currentUser || Number(currentUser.tokenVersion || 0) !== Number(user.tokenVersion || 0)) {
            throw new Error('Staff session invalidated');
        }
        req.user = user;
        return next();
    } catch (_error) {
        return res.status(STATUS_CODE.FORBIDDEN).json({ message: 'Session expired or invalid' });
    }
};

export default staffOrCustomerAuth;
