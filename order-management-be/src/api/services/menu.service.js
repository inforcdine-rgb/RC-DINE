import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import logger from '../../config/logger.js';
import categoryRepo from '../repositories/category.repository.js';
import menuRepo from '../repositories/menu.repository.js';
import { CustomError, STATUS_CODE } from '../utils/common.js';

const create = async (payload) => {
    try {
        const { categoryId, hotelId, data } = payload;
        const options = data.map((item) => ({ id: uuidv4(), categoryId, hotelId, ...item }));
        logger('debug', 'Request to add menu items');
        return await menuRepo.save(options);
    } catch (error) {
        logger('error', 'Error while creating category', { error });
        throw CustomError(error.code, error.message);
    }
};

const update = async (id, hotelId, payload) => {
    try {
        const updateData = { ...payload };
        if (typeof updateData.status === 'boolean') {
            updateData.status = updateData.status ? 'AVAILABLE' : 'UNAVAILABLE';
        }

        if (updateData.name) {
            const duplicateOptions = { where: { hotelId, name: updateData.name, id: { [Op.ne]: id } } };
            const res = await menuRepo.find(duplicateOptions);
            if (res.count) {
                logger('error', `Menu item already exists ${updateData.name}`);
                throw CustomError(STATUS_CODE.CONFLICT, 'Name already exists');
            }
        }

        const options = { where: { id } };
        await menuRepo.update(options, updateData);
        return { message: 'Menu Item updated successfully' };
    } catch (error) {
        logger('error', 'Error while updating menu item', { error });
        throw CustomError(error.code, error.message);
    }
};

const remove = async (menuIds) => {
    try {
        const options = { where: { id: { [Op.in]: menuIds } } };
        await menuRepo.remove(options);
        return { message: 'Menu Items removed successfully' };
    } catch (error) {
        logger('error', 'Error while removing menu item', { error });
        throw CustomError(error.code, error.message);
    }
};

const fetch = async (payload) => {
    try {
        const {
            categoryId,
            limit = 10,
            skip = 0,
            sortKey = 'updatedAt',
            sortOrder = 'DESC',
            filterKey,
            filterValue
        } = payload;

        const options = {
            where: { categoryId, isCombo: false },
            limit: Number(limit),
            offset: Number(skip)
        };

        if (sortKey && sortOrder) options.order = [[sortKey, sortOrder]];

        if (filterKey && filterValue) {
            options.where = {
                [Op.and]: [{ categoryId, isCombo: false }, { [filterKey]: { [Op.like]: `%${filterValue}%` } }]
            };
        }

        logger('debug', `Fetching menu items with options ${JSON.stringify(options)}`);
        const data = await menuRepo.find(options);
        logger('debug', `Menu items fetched successfully ${JSON.stringify(data)}`);
        return data;
    } catch (error) {
        logger('error', `Error while fetching menu items ${JSON.stringify(error)}`);
        throw CustomError(error.code, error.message);
    }
};

// ── NEW: single item fetch (image upload ke liye old image delete karna) ──
const fetchById = async (id) => {
    try {
        const options = { where: { id }, limit: 1 };
        const result = await menuRepo.find(options);
        return result.rows[0] || null;
    } catch (error) {
        logger('error', 'Error while fetching menu item by id', { error });
        throw CustomError(error.code, error.message);
    }
};

const createCategory = async (payload) => {
    try {
        const { hotelId, data } = payload;
        const existingCategories = await categoryRepo.find({
            where: { hotelId },
            order: [['order', 'DESC']],
            attributes: ['order'],
            limit: 1
        });
        let nextOrder = existingCategories.count ? existingCategories.rows[0].order + 1 : 1;

        const options = data.map(({ name, order }) => ({
            id: uuidv4(),
            name,
            hotelId,
            order: order ?? nextOrder++
        }));

        logger('info', `Options to add new Categories ${JSON.stringify(options)}`);
        return await categoryRepo.save(options);
    } catch (error) {
        logger('error', 'Error while creating category', { error });
        throw CustomError(error.code, error.message);
    }
};

const fetchCategory = async (hotelId) => {
    try {
        const options = { where: { hotelId }, order: [['order', 'ASC']] };
        return await categoryRepo.find(options);
    } catch (error) {
        logger('error', `Error while fetching categories ${JSON.stringify(error)}`);
        throw CustomError(error.code, error.message);
    }
};

const updateCategory = async (id, payload) => {
    try {
        const updateOptions = { where: { id } };
        const updateData = { name: payload.name, order: payload.order };
        await categoryRepo.update(updateOptions, updateData);
        return { message: 'Category updated successfully' };
    } catch (error) {
        logger('error', 'Error while updating category', { error });
        throw CustomError(error.code, error.message);
    }
};

const removeCategory = async (categoryIds) => {
    try {
        const options = { where: { id: { [Op.in]: categoryIds } } };
        await categoryRepo.remove(options);

        const menuQuery = { where: { categoryId: { [Op.in]: categoryIds } } };
        await menuRepo.remove(menuQuery);

        return { message: 'Category removed successfully' };
    } catch (error) {
        logger('error', 'Error while removing category', { error });
        throw CustomError(error.code, error.message);
    }
};

const createCombo = async (payload) => {
    try {
        const { hotelId, name, description, price, status, menuIds } = payload;
        const comboItems = Array.from(new Set(menuIds || []));
        if (comboItems.length < 2 || comboItems.length > 5) {
            throw CustomError(STATUS_CODE.BAD_REQUEST, 'Combo must have minimum 2 and maximum 5 food items');
        }

        const selectedItems = await menuRepo.find({
            where: {
                id: { [Op.in]: comboItems },
                hotelId,
                isCombo: false
            }
        });
        if (selectedItems.count !== comboItems.length) {
            throw CustomError(STATUS_CODE.BAD_REQUEST, 'Some selected food items are invalid');
        }

        const options = [{
            id: uuidv4(),
            categoryId: null,
            hotelId,
            name,
            description,
            price,
            status: status === false ? 'UNAVAILABLE' : 'AVAILABLE',
            isCombo: true,
            comboItems
        }];
        const result = await menuRepo.save(options);
        return result[0];
    } catch (error) {
        logger('error', 'Error while creating combo', { error });
        throw CustomError(error.code, error.message);
    }
};

const fetchCombos = async (payload) => {
    try {
        const {
            hotelId,
            limit = 100,
            skip = 0,
            sortKey = 'updatedAt',
            sortOrder = 'DESC'
        } = payload;
        return await menuRepo.find({
            where: { hotelId, isCombo: true },
            limit: Number(limit),
            offset: Number(skip),
            order: [[sortKey, sortOrder]]
        });
    } catch (error) {
        logger('error', 'Error while fetching combos', { error });
        throw CustomError(error.code, error.message);
    }
};

const updateCombo = async (id, hotelId, payload) => {
    try {
        const updateData = { ...payload };
        if (updateData.menuIds) {
            const comboItems = Array.from(new Set(updateData.menuIds));
            if (comboItems.length < 2 || comboItems.length > 5) {
                throw CustomError(STATUS_CODE.BAD_REQUEST, 'Combo must have minimum 2 and maximum 5 food items');
            }
            const selectedItems = await menuRepo.find({
                where: { id: { [Op.in]: comboItems }, hotelId, isCombo: false }
            });
            if (selectedItems.count !== comboItems.length) {
                throw CustomError(STATUS_CODE.BAD_REQUEST, 'Some selected food items are invalid');
            }
            updateData.comboItems = comboItems;
            delete updateData.menuIds;
        }
        if (typeof updateData.status === 'boolean') {
            updateData.status = updateData.status ? 'AVAILABLE' : 'UNAVAILABLE';
        }
        await menuRepo.update({ where: { id, hotelId, isCombo: true } }, updateData);
        return { message: 'Combo updated successfully' };
    } catch (error) {
        logger('error', 'Error while updating combo', { error });
        throw CustomError(error.code, error.message);
    }
};

const removeCombos = async (comboIds) => {
    try {
        await menuRepo.remove({ where: { id: { [Op.in]: comboIds }, isCombo: true } });
        return { message: 'Combos removed successfully' };
    } catch (error) {
        logger('error', 'Error while removing combos', { error });
        throw CustomError(error.code, error.message);
    }
};

export default {
    create,
    update,
    remove,
    fetch,
    fetchById, // ← NEW
    createCombo,
    fetchCombos,
    updateCombo,
    removeCombos,
    createCategory,
    fetchCategory,
    updateCategory,
    removeCategory
};
