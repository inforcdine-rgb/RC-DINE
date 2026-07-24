import { db } from '../../config/database.js';
import logger from '../../config/logger.js';
import { CustomError } from '../utils/common.js';

const findOne = async (options) => {
    try {
        return await db.sessionJoinRequests.findOne(options);
    } catch (error) {
        logger('error', 'Error while fetching RC Session join request', { error: error.message });
        throw CustomError(error.code, error.message);
    }
};

const findAll = async (options) => {
    try {
        return await db.sessionJoinRequests.findAll(options);
    } catch (error) {
        logger('error', 'Error while fetching RC Session join requests', { error: error.message });
        throw CustomError(error.code, error.message);
    }
};

const create = async (payload, options = {}) => {
    try {
        return await db.sessionJoinRequests.create(payload, options);
    } catch (error) {
        logger('error', 'Error while creating RC Session join request', { error: error.message });
        throw CustomError(error.code, error.message);
    }
};

export default { findOne, findAll, create };
