import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import logger from '../../config/logger.js';
import { TABLE_STATUS } from '../models/table.model.js';
import subscriptionRepo from '../repositories/subscription.repository.js';
import tableRepo from '../repositories/table.repository.js';
import { CustomError, STATUS_CODE } from '../utils/common.js';

const create = async (hotelId, payload) => {
    try {
        const { count } = payload;
        const getOptions = {
            where: {
                hotelId
            },
            order: [['tableNumber', 'DESC']],
            attributes: ['tableNumber'],
            limit: 1
        };
        const records = await tableRepo.find(getOptions);
        let startNo = 1;
        if (records.count) {
            startNo = records.rows[0].tableNumber + 1;
        }

        const subscriptionOptions = {
            where: { hotelId },
            attributes: ['id', 'tables']
        };
        const subscription = await subscriptionRepo.findOne(subscriptionOptions);
        const maxCount = Number(subscription?.tables ?? 100);

        if (startNo - 1 + count > maxCount) {
            logger('debug', `Table addition limit exceeded ${startNo - 1 + count}`);
            throw CustomError(
                STATUS_CODE.TOO_MANY_REQUEST,
                `Maximum ${maxCount} tables can be added. Upgrade Plan to add more tables.`
            );
        }

        const data = [];
        for (let tableNumber = startNo; tableNumber < startNo + count; tableNumber++) {
            data.push({
                id: uuidv4(),
                hotelId,
                tableNumber,
                tableName: `Table ${tableNumber}`
            });
        }
        const res = await tableRepo.save(data);
        logger('debug', `${data.id} Table created successfully`);

        return res;
    } catch (error) {
        logger('error', `Error while table registeration ${payload.hotelId}-${payload.tableId} ${error}`);
        throw CustomError(error.code, error.message);
    }
};

const fetch = async (payload) => {
    try {
        const { filter, hotelId, active } = payload;
        const limit = 50;

        const options = {
            where: {
                hotelId
            },
            order: [['tableNumber', 'ASC']],
            attributes: [
                'id',
                'tableNumber',
                'tableName',
                'status',
                'qrEnabled',
                'activeSessionId'
            ],
            limit
        };

        if (active) {
            options.where.status = TABLE_STATUS[1];
        }

        if (filter) {
            const condition = {
                [Op.or]: [
                    { tableNumber: { [Op.like]: `%${filter}%` } },
                    { tableName: { [Op.like]: `%${filter}%` } }
                ]
            };
            options.where = { ...options.where, ...condition };
        }

        logger('debug', `Fetching table with payload ${JSON.stringify(options)}`);
        const data = await tableRepo.find(options);
        return data;
    } catch (error) {
        logger('error', `Error while fetching tables ${error}`);
        throw CustomError(error.code, error.message);
    }
};

const remove = async (hotelId, payload) => {
    try {
        const { count, tableId } = payload;
        let removeOptions;

        if (tableId) {
            removeOptions = {
                where: {
                    id: tableId,
                    hotelId
                }
            };
        } else {
            const options = {
                where: { hotelId },
                limit: count,
                attributes: ['id'],
                order: [['tableNumber', 'DESC']]
            };
            const records = await tableRepo.find(options);
            logger('debug', `Count of the records ${records.count}`);

            removeOptions = {
                where: {
                    id: { [Op.in]: records.rows.map(({ id }) => id) },
                    hotelId
                }
            };
        }

        logger('debug', `Removing table with payload ${JSON.stringify(removeOptions)}`);
        await tableRepo.remove(removeOptions);
        return { message: 'Table removed successfully' };
    } catch (error) {
        logger('error', `Error while removing table`, error);
        throw CustomError(error.code, error.message);
    }
};

const updateName = async (hotelId, tableId, payload) => {
    try {
        const tableName = String(payload.tableName || '').trim();
        if (!tableName) {
            throw CustomError(STATUS_CODE.BAD_REQUEST, 'Table name is required');
        }

        const options = { where: { id: tableId, hotelId } };
        const table = await tableRepo.findOne(options);
        if (!table) {
            throw CustomError(STATUS_CODE.NOT_FOUND, 'Table not found');
        }

        await tableRepo.update(options, { tableName });
        return { message: 'Table name updated successfully', tableId, tableName };
    } catch (error) {
        logger('error', `Error while updating table name`, error);
        throw CustomError(error.code, error.message);
    }
};

export default {
    create,
    fetch,
    remove,
    updateName
};
