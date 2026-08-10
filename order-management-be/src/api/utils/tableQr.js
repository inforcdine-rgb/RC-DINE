import jwt from 'jsonwebtoken';

import env from '../../config/env.js';
import { CustomError, STATUS_CODE } from './common.js';

const TABLE_QR_TYPE = 'TABLE_QR';
const TABLE_QR_AUDIENCE = 'rc-dine-table';
const TABLE_QR_ISSUER = 'rc-dine';

const getSecret = () => {
    if (!env.tableQrSecret) {
        throw CustomError(STATUS_CODE.INTERNAL_SERVER_ERROR, 'Table QR signing is not configured');
    }
    return env.tableQrSecret;
};
export const createTableQrToken = ({ tableId, hotelId }) =>
    jwt.sign(
        {
            type: TABLE_QR_TYPE,
            tableId: String(tableId),
            hotelId: String(hotelId)
        },
        getSecret(),
        {
            algorithm: 'HS256',
            audience: TABLE_QR_AUDIENCE,
            issuer: TABLE_QR_ISSUER,
            noTimestamp: true
        }
    );

export const verifyTableQrToken = (token) => {
    try {
        const payload = jwt.verify(String(token || ''), getSecret(), {
            algorithms: ['HS256'],
            audience: TABLE_QR_AUDIENCE,
            issuer: TABLE_QR_ISSUER
        });

        if (payload.type !== TABLE_QR_TYPE || !payload.tableId || !payload.hotelId) {
            throw new Error('Invalid table QR claims');
        }

        return {
            tableId: String(payload.tableId),
            hotelId: String(payload.hotelId)
        };
    } catch (_error) {
        throw CustomError(STATUS_CODE.UNAUTHORIZED, 'This table QR is invalid. Please scan a newly generated QR.');
    }
};
