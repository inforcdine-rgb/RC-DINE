import { db } from '../../config/database.js';
import logger from '../../config/logger.js';
import { CustomError } from '../utils/common.js';

const findOne = async (options) => {
    try {
        return await db.diningSessions.findOne(options);
    } catch (error) {
        logger('error', 'Error while fetching RC Session', { error: error.message });
        throw CustomError(error.code, error.message);
    }
};

const find = async (options) => {
    try {
        return await db.diningSessions.findAndCountAll(options);
    } catch (error) {
        logger('error', 'Error while fetching RC Sessions', { error: error.message });
        throw CustomError(error.code, error.message);
    }
};

const create = async (payload, options = {}) => {
    try {
        return await db.diningSessions.create(payload, options);
    } catch (error) {
        logger('error', 'Error while creating RC Session', { error: error.message });
        throw CustomError(error.code, error.message);
    }
};

const update = async (options, payload) => {
    try {
        return await db.diningSessions.update(payload, options);
    } catch (error) {
        logger('error', 'Error while updating RC Session', { error: error.message });
        throw CustomError(error.code, error.message);
    }
};

export default { findOne, find, create, update };
