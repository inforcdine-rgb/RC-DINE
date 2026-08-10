import jwt from 'jsonwebtoken';

import env from '../../config/env.js';

const optionalCustomerSessionAuth = (req, _res, next) => {
    const authorization = req.headers.authorization || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';

    if (!token) return next();

    try {
        const payload = jwt.verify(token, env.customerAuth.jwtSecret);
        if (['CUSTOMER', 'CUSTOMER_PUSH'].includes(payload.type)) req.customer = payload;
    } catch (_error) {
        // Invalid optional credentials grant no access. The controller still
        // requires either a signed table QR or matching customer claims.
    }

    return next();
};

export default optionalCustomerSessionAuth;
