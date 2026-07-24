import { db } from '../../config/database.js';
import logger from '../../config/logger.js';
import { CustomError } from '../utils/common.js';

const findOne = async (options) => {
    try {
        return await db.sessionMembers.findOne(options);
    } catch (error) {
        logger('error', 'Error while fetching RC Session member', { error: error.message });
        throw CustomError(error.code, error.message);
    }
};

const create = async (payload, options = {}) => {
    try {
        return await db.sessionMembers.create(payload, options);
    } catch (error) {
        logger('error', 'Error while creating RC Session member', { error: error.message });
        throw CustomError(error.code, error.message);
    }
};

const update = async (options, payload) => {
    try {
        return await db.sessionMembers.update(payload, options);
    } catch (error) {
        logger('error', 'Error while updating RC Session member', { error: error.message });
        throw CustomError(error.code, error.message);
    }
};

export default { findOne, create, update };
