import { deleteImage } from '../../config/cloudinary.js';
import logger from '../../config/logger.js';
import { USER_ROLES } from '../models/user.model.js';
import menuService from '../services/menu.service.js';
import { STATUS_CODE } from '../utils/common.js';
import {
    resolveHotelAccess,
    resolveHotelAccessByCategoryId,
    resolveHotelAccessByCategoryIds,
    getAssignedHotelId
} from '../utils/hotelAccess.js';
import {
    createCategoryValidation,
    createValidation,
    updateCategoryValidation,
    updateValidation,
    createComboValidation,
    updateComboValidation
} from '../validations/menu.validation.js';

const create = async (req, res) => {
    try {
        const { body } = req;
        logger('debug', 'create a menu ', { body });

        const validation = createValidation(body);
        if (validation.error) {
            logger('error', 'Menu creation validation error', { error: validation.error });
            return res.status(STATUS_CODE.BAD_REQUEST).send({ message: validation.error.message });
        }

        body.hotelId = await resolveHotelAccess(req.user, body.hotelId);
        const result = await menuService.create(body);
        logger('info', 'Menu created successfully', { result });

        return res.status(STATUS_CODE.CREATED).send(result);
    } catch (error) {
        logger('error', `Error occurred during creating menu items ${error}`);
        return res.status(error.code || 500).send({ message: error.message });
    }
};

const update = async (req, res) => {
    const newImage = req.file?.path || null;

    try {
        const { id } = req.params;
        const payload = req.body;

        if (!payload.data) {
            payload.data = {};
        }

        if (newImage) {
            payload.data.image = newImage;
        }

        const validation = updateValidation(payload.data);

        if (validation.error) {
            if (newImage) {
                await deleteImage(newImage);
            }

            return res.status(STATUS_CODE.BAD_REQUEST).send({
                message: validation.error.message
            });
        }

        const hotelId = await resolveHotelAccess(
            req.user,
            payload.hotelId
        );

        const existing = await menuService.fetchById(
            id,
            hotelId,
            { isCombo: false }
        );

        if (!existing) {
            if (newImage) {
                await deleteImage(newImage);
            }

            return res.status(STATUS_CODE.NOT_FOUND).send({
                message: 'Menu item not found'
            });
        }

        const oldImage = existing.image;

        const result = await menuService.update(
            id,
            hotelId,
            payload.data
        );

        if (
            newImage &&
            oldImage &&
            oldImage !== newImage
        ) {
            await deleteImage(oldImage);
        }

        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        if (newImage) {
            await deleteImage(newImage);
        }

        logger('error', 'Error occurred during updating menu item', {
            error
        });

        return res.status(error.code || 500).send({
            message: error.message
        });
    }
};

// ── NEW: dedicated image upload for a menu item ──
const uploadImage = async (req, res) => {
    const newImage = req.file?.path || null;

    try {
        const { id } = req.params;

        if (!newImage) {
            return res.status(STATUS_CODE.BAD_REQUEST).send({
                message: 'No image file provided'
            });
        }

        const hotelId = await resolveHotelAccess(
            req.user,
            req.body.hotelId
        );

        const existing = await menuService.fetchById(
            id,
            hotelId,
            { isCombo: false }
        );

        if (!existing) {
            await deleteImage(newImage);

            return res.status(STATUS_CODE.NOT_FOUND).send({
                message: 'Menu item not found'
            });
        }

        const oldImage = existing.image;

        const result = await menuService.update(
            id,
            hotelId,
            {
                image: newImage
            }
        );

        if (oldImage && oldImage !== newImage) {
            await deleteImage(oldImage);
        }

        return res.status(STATUS_CODE.OK).send({
            image: newImage,
            ...result
        });
    } catch (error) {
        if (newImage) {
            await deleteImage(newImage);
        }

        logger('error', 'Error uploading image for menu item', {
            error
        });

        return res.status(error.code || 500).send({
            message: error.message
        });
    }
};

const createCombo = async (req, res) => {
    try {
        const payload = req.body;
        const validation = createComboValidation(payload);
        if (validation.error) {
            return res.status(STATUS_CODE.BAD_REQUEST).send({ message: validation.error.message });
        }
        payload.hotelId = await resolveHotelAccess(req.user, payload.hotelId);
        const result = await menuService.createCombo(payload);
        return res.status(STATUS_CODE.CREATED).send(result);
    } catch (error) {
        logger('error', `Error occurred during creating combo ${error}`);
        return res.status(error.code || 500).send({ message: error.message });
    }
};

const fetchCombos = async (req, res) => {
    try {
        const hotelId = await resolveHotelAccess(req.user, req.params.hotelId);
        const result = await menuService.fetchCombos({ ...req.query, hotelId });
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        logger('error', `Error occurred during fetching combos ${error}`);
        return res.status(error.code || 500).send({ message: error.message });
    }
};

const updateCombo = async (req, res) => {
    try {
        const { id } = req.params;
        const payload = req.body;
        const validation = updateComboValidation(payload);
        if (validation.error) {
            return res.status(STATUS_CODE.BAD_REQUEST).send({ message: validation.error.message });
        }
        const hotelId = await resolveHotelAccess(req.user, payload.hotelId);
        const { hotelId: _hotelId, ...data } = payload;
        const result = await menuService.updateCombo(id, hotelId, data);
        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        logger('error', `Error occurred during updating combo ${error}`);
        return res.status(error.code || 500).send({ message: error.message });
    }
};

const removeCombos = async (req, res) => {
    try {
        const {
            comboIds,
            hotelId: requestedHotelId
        } = req.body;

        const hotelId = await resolveHotelAccess(
            req.user,
            requestedHotelId
        );

        const result = await menuService.removeCombos(
            comboIds,
            hotelId
        );

        await Promise.allSettled(
            result.deletedItems
                .filter((item) => item.image)
                .map((item) => deleteImage(item.image))
        );

        return res.status(STATUS_CODE.OK).send({
            message: result.message
        });
    } catch (error) {
        logger('error', 'Error occurred during removing combos', {
            error
        });

        return res.status(error.code || 500).send({
            message: error.message
        });
    }
};

const remove = async (req, res) => {
    try {
        const { menuIds, hotelId: requestedHotelId } = req.body;

        const hotelId = await resolveHotelAccess(
            req.user,
            requestedHotelId
        );

        const result = await menuService.remove(
            menuIds,
            hotelId
        );

        await Promise.allSettled(
            result.deletedItems
                .filter((item) => item.image)
                .map((item) => deleteImage(item.image))
        );

        return res.status(STATUS_CODE.OK).send({
            message: result.message
        });
    } catch (error) {
        logger('error', 'Error occurred during removing menu items', {
            error
        });

        return res.status(error.code || 500).send({
            message: error.message
        });
    }
};

const fetch = async (req, res) => {
    try {
        const { params, query } = req;
        const { limit, skip, sortKey, sortOrder, filterKey, filterValue } = query;
        const { id } = params;

        if (!id || id === 'undefined' || id === 'null') {
            return res.status(STATUS_CODE.OK).send({ count: 0, rows: [] });
        }

        const payload = { limit, skip, sortKey, sortOrder, filterKey, filterValue, categoryId: id };
        logger('debug', 'Received request to list menu with query:', { query });

        try {
            await resolveHotelAccessByCategoryId(req.user, id);
        } catch (error) {
            if (error.code === STATUS_CODE.NOT_FOUND || error.message?.includes('Category not found')) {
                return res.status(STATUS_CODE.OK).send({ count: 0, rows: [] });
            }
            throw error;
        }

        const result = await menuService.fetch(payload);
        logger('info', 'Menu list fetched successfully');

        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        logger('error', `Error occurred during fetching menu items ${error}`);
        return res.status(error.code || 500).send({ message: error.message });
    }
};

const createCategory = async (req, res) => {
    try {
        const { body } = req;
        logger('debug', 'Create a category ', { body });

        const validation = createCategoryValidation(body);
        if (validation.error) {
            logger('error', 'Category creation validation error', { error: validation.error });
            return res.status(STATUS_CODE.BAD_REQUEST).send({ message: validation.error.message });
        }

        body.hotelId = await resolveHotelAccess(req.user, body.hotelId);
        const result = await menuService.createCategory(body);
        logger('info', 'Category created successfully', { result });

        return res.status(STATUS_CODE.CREATED).send(result);
    } catch (error) {
        logger('error', `Error occurred during creating category ${error}`);
        return res.status(error.code || 500).send({ message: error.message });
    }
};

const fetchCategory = async (req, res) => {
    try {
        let hotelId;
        if (req.user.role === USER_ROLES[1]) {
            hotelId = req.user.hotelId || (await getAssignedHotelId(req.user.id));
            if (!hotelId) {
                return res.status(STATUS_CODE.FORBIDDEN).send({ message: 'Manager is not assigned to any cafe' });
            }
        } else {
            hotelId = await resolveHotelAccess(req.user, req.params.hotelId);
        }

        const result = await menuService.fetchCategory(hotelId);
        logger('info', `Categories for hotel ${hotelId}`);

        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        logger('error', `Error occurred during fetching categories ${error}`);
        return res.status(error.code || 500).send({ message: error.message });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const payload = req.body;

        const validation = updateCategoryValidation(payload);
        if (validation.error) {
            return res.status(STATUS_CODE.BAD_REQUEST).send({ message: validation.error.message });
        }

        await resolveHotelAccessByCategoryId(req.user, id);
        const result = await menuService.updateCategory(id, payload);

        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        logger('error', `Error occurred during updating category ${error}`);
        return res.status(error.code || 500).send({ message: error.message });
    }
};

const removeCategory = async (req, res) => {
    try {
        const { categoryIds } = req.body;

        await resolveHotelAccessByCategoryIds(req.user, categoryIds);
        const result = await menuService.removeCategory(categoryIds);

        return res.status(STATUS_CODE.OK).send(result);
    } catch (error) {
        logger('error', `Error occurred during removing category ${error}`);
        return res.status(error.code || 500).send({ message: error.message });
    }
};

export default {
    create,
    update,
    remove,
    fetch,
    uploadImage,
    createCombo,
    fetchCombos,
    updateCombo,
    removeCombos,
    createCategory,
    fetchCategory,
    updateCategory,
    removeCategory
};
