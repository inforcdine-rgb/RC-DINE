import jwt from 'jsonwebtoken';
import { db } from '../../config/database.js';
import env from '../../config/env.js';
import logger from '../../config/logger.js';
import { STATUS_CODE } from '../utils/common.js';

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        logger('error', { message: 'Unauthorized access attempted' });
        return res.status(STATUS_CODE.UNAUTHORIZED).json({ message: 'TOKEN_NOT_FOUND' });
    }

    jwt.verify(token, env.jwtSecret, async (err, user) => {
        if (err) {
            logger('error', { message: 'TOKEN_VERIFICATION_FAILED' });
            return res.status(STATUS_CODE.FORBIDDEN).json({ message: 'TOKEN_VERIFICATION_FAILED' });
        }
        try {
            const currentUser = await db.users.findOne({
                where: { id: user.id },
                attributes: ['id', 'tokenVersion']
            });
            const tokenVersion = Number(user.tokenVersion || 0);
            const currentTokenVersion = Number(currentUser?.tokenVersion || 0);

            if (!currentUser || tokenVersion !== currentTokenVersion) {
                logger('warn', { message: 'Session invalidated' });
                return res.status(STATUS_CODE.FORBIDDEN).json({ message: 'TOKEN_VERIFICATION_FAILED' });
            }

            req.user = user;
            logger('info', 'User authenticated successfully', { userId: user.id, role: user.role });
            next();
        } catch (error) {
            logger('error', { message: 'Session validation failed' });
            return res.status(STATUS_CODE.FORBIDDEN).json({ message: 'TOKEN_VERIFICATION_FAILED' });
        }
    });
};

export default authenticate;
