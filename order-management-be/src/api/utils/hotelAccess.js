import { Op } from 'sequelize';
import { USER_ROLES } from '../models/user.model.js';
import categoryRepo from '../repositories/category.repository.js';
import hotelUserRelationRepo from '../repositories/hotelUserRelation.repository.js';
import tableRepo from '../repositories/table.repository.js';
import { CustomError, STATUS_CODE } from './common.js';

export const getAssignedHotelId = async (userId) => {
    const { rows } = await hotelUserRelationRepo.find({
        where: { userId },
        attributes: ['hotelId'],
        order: [['updatedAt', 'DESC']],
        limit: 1
    });
    return rows[0]?.hotelId || null;
};

/**
 * Ensures the user may access the requested hotel.
 * Managers are always scoped to their assigned hotel (client hotelId is ignored).
 */
export const resolveHotelAccess = async (user, requestedHotelId) => {
    if (user.role === USER_ROLES[1]) {
        const assignedHotelId = user.hotelId || (await getAssignedHotelId(user.id));
        if (!assignedHotelId) {
            throw CustomError(STATUS_CODE.FORBIDDEN, 'Manager is not assigned to any cafe');
        }
        if (
            requestedHotelId &&
            requestedHotelId !== 'undefined' &&
            requestedHotelId !== 'null' &&
            requestedHotelId !== assignedHotelId
        ) {
            throw CustomError(STATUS_CODE.FORBIDDEN, 'Access denied to this cafe');
        }
        return assignedHotelId;
    }

    if (!requestedHotelId) {
        throw CustomError(STATUS_CODE.BAD_REQUEST, 'Hotel id is required');
    }

    const { count } = await hotelUserRelationRepo.find({
        where: { userId: user.id, hotelId: requestedHotelId },
        limit: 1
    });

    if (!count) {
        throw CustomError(STATUS_CODE.FORBIDDEN, 'Access denied to this cafe');
    }

    return requestedHotelId;
};

export const resolveHotelAccessByCategoryId = async (user, categoryId) => {
    if (!categoryId) {
        throw CustomError(STATUS_CODE.BAD_REQUEST, 'Category id is required');
    }

    const categoryResult = await categoryRepo.find({
        where: {
            id: categoryId
        },
        attributes: ['hotelId']
    });

    const category = categoryResult?.rows?.[0] || categoryResult;

    if (!category?.hotelId) {
        throw CustomError(STATUS_CODE.NOT_FOUND, 'Category not found');
    }

    await resolveHotelAccess(user, category.hotelId);

    return category.hotelId;
};

export const resolveHotelAccessByCategoryIds = async (user, categoryIds) => {
    if (!categoryIds?.length) {
        throw CustomError(STATUS_CODE.BAD_REQUEST, 'Category id is required');
    }

    const { rows } = await categoryRepo.find({
        where: {
            id: {
                [Op.in]: categoryIds
            }
        },
        attributes: ['hotelId']
    });

    if (!rows?.length) {
        throw CustomError(STATUS_CODE.NOT_FOUND, 'Category not found');
    }

    const hotelIds = [...new Set(rows.map((row) => row.hotelId).filter(Boolean))];

    if (hotelIds.length !== 1) {
        throw CustomError(STATUS_CODE.BAD_REQUEST, 'Categories must belong to the same cafe');
    }

    const hotelId = hotelIds[0];

    await resolveHotelAccess(user, hotelId);

    return hotelId;
};

export const resolveHotelAccessByTableId = async (user, tableId) => {
    const table = await tableRepo.findOne({
        where: { id: tableId },
        attributes: ['hotelId']
    });

    if (!table?.hotelId) {
        throw CustomError(STATUS_CODE.NOT_FOUND, 'Table not found');
    }

    return resolveHotelAccess(user, table.hotelId);
};
