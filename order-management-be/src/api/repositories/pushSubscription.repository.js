import { db } from '../../config/database.js';
import logger from '../../config/logger.js';
import { CustomError } from '../utils/common.js';

const save = async (payload) => {
    try {
        logger('info', 'Saving push subscription', {
            userId: payload.userId,
            customerId: payload.customerId,
            deviceId: payload.deviceId
        });
        return await db.pushSubscriptions.create(payload);
    } catch (error) {
        const err = error?.errors[0]?.message;
        logger('error', `Error occurred while saving push subscription: ${err || error.message}`);
        throw CustomError(error.code, err || error.message);
    }
};

const upsert = async (payload, options = {}) => {
    try {
        const existing = await db.pushSubscriptions.findOne({
            where: { endpointHash: payload.endpointHash },
            paranoid: false,
            transaction: options.transaction
        });

        if (!existing) {
            return await db.pushSubscriptions.create(payload, options);
        }

        if (existing.deletedAt) await existing.restore(options);
        const updateData = { ...payload };
        delete updateData.id;
        return await existing.update({ ...updateData, deletedAt: null }, options);
    } catch (error) {
        const err = error?.errors ? error.errors[0]?.message : undefined;
        logger('error', `Error occurred while updating push subscription: ${err || error.message}`);
        throw CustomError(error.code, err || error.message);
    }
};

const remove = async (options) => {
    try {
        logger('debug', 'Removing push subscription for user', options);
        return await db.pushSubscriptions.destroy(options);
    } catch (error) {
        const err = error?.errors ? error?.errors[0]?.message : undefined;
        logger('error', `Error occurred while removing push subscription: ${err || error.message}`);
        throw CustomError(error.code, err || error.message);
    }
};

const find = async (options) => {
    try {
        logger('debug', 'Fetching push subscription', options);
        return await db.pushSubscriptions.findAndCountAll(options);
    } catch (error) {
        const err = error?.errors ? error?.errors[0]?.message : undefined;
        logger('error', `Error occurred while fetching push subscription: ${err || error.message}`);
        throw CustomError(error.code, err || error.message);
    }
};

export default { save, upsert, remove, find };
