import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../config/database.js';
import { emitToHotel } from '../../config/socket.js';
import { USER_ROLES } from '../models/user.model.js';
import {
    calculateBill,
    calculateDiscount,
    CustomError,
    mapSequelizeError,
    STATUS_CODE
} from '../utils/common.js';
import { resolveHotelAccess } from '../utils/hotelAccess.js';

const OPEN_SECTION_STATUSES = ['OPEN', 'BILLED'];

const money = (value) => Number((Number(value) || 0).toFixed(2));

const emitOrderEvent = (order, eventName, extra = {}) => {
    emitToHotel(order.hotelId, eventName, {
        orderId: order.id,
        orderNumber: order.orderNumber,
        hotelId: order.hotelId,
        tableId: order.tableId,
        status: order.status,
        updatedAt: new Date().toISOString(),
        ...extra
    });
};

const ensureHotelAccess = async (user, requestedHotelId) => {
    if (user.role === USER_ROLES[2]) {
        if (!requestedHotelId) {
            throw CustomError(STATUS_CODE.BAD_REQUEST, 'Hotel id is required');
        }
        const hotel = await db.hotel.findByPk(requestedHotelId, { attributes: ['id'] });
        if (!hotel) throw CustomError(STATUS_CODE.NOT_FOUND, 'Cafe not found');
        return requestedHotelId;
    }
    return resolveHotelAccess(user, requestedHotelId);
};

const ensureOrderAccess = async (user, order) => {
    if (!order) throw CustomError(STATUS_CODE.NOT_FOUND, 'Open order not found');
    await ensureHotelAccess(user, order.hotelId);
    return order;
};

const getOrderForUpdate = async (user, orderId, transaction) => {
    const order = await db.openOrders.findByPk(orderId, {
        transaction,
        lock: transaction.LOCK.UPDATE
    });
    return ensureOrderAccess(user, order);
};

const makeOrderNumber = () => {
    const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
    return `POS-${date}-${uuidv4().replaceAll('-', '').slice(0, 8).toUpperCase()}`;
};

const serializeOrder = (order, aggregate = {}) => {
    const value = order?.get ? order.get({ plain: true }) : order;
    if (!value) return null;

    const serialized = {
        ...value,
        subtotalAmount: money(value.subtotalAmount),
        discountValue: money(value.discountValue),
        discountAmount: money(value.discountAmount),
        gstPercent: money(value.gstPercent),
        cgstAmount: money(value.cgstAmount),
        sgstAmount: money(value.sgstAmount),
        tipAmount: money(value.tipAmount),
        finalAmount: money(value.finalAmount),
        cashReceived: money(value.cashReceived),
        changeAmount: money(value.changeAmount)
    };

    if (aggregate.itemCount !== undefined) {
        serialized.itemCount = Number(aggregate.itemCount) || 0;
        serialized.runningTotal = money(aggregate.runningTotal);
        serialized.lastUpdated = aggregate.lastItemAt || serialized.updatedAt;
    }

    if (serialized.items) {
        serialized.items = serialized.items.map((item) => ({
            ...item,
            unitPrice: money(item.unitPrice),
            lineTotal: money(item.lineTotal),
            quantity: Number(item.quantity) || 0,
            addedByName: item.addedBy
                ? `${item.addedBy.firstName || ''} ${item.addedBy.lastName || ''}`.trim()
                : 'Manager'
        }));
        serialized.itemCount = serialized.items.reduce((sum, item) => sum + item.quantity, 0);
        serialized.runningTotal = serialized.subtotalAmount;
        serialized.timeline = serialized.items.map((item) => ({
            id: item.id,
            time: item.addedAt || item.createdAt,
            item: item.itemName,
            quantity: item.quantity,
            addedBy: item.addedByName,
            kotPrintedAt: item.kotPrintedAt
        }));
    }

    return serialized;
};

const getDetailedOrder = async (orderId, transaction) => {
    const order = await db.openOrders.findByPk(orderId, {
        include: [
            {
                model: db.tables,
                as: 'table',
                attributes: ['id', 'tableNumber', 'tableName', 'status'],
                required: false
            },
            {
                model: db.users,
                as: 'createdBy',
                attributes: ['id', 'firstName', 'lastName']
            },
            {
                model: db.openOrderItems,
                as: 'items',
                include: [{
                    model: db.users,
                    as: 'addedBy',
                    attributes: ['id', 'firstName', 'lastName']
                }]
            }
        ],
        order: [[{ model: db.openOrderItems, as: 'items' }, 'addedAt', 'ASC']],
        transaction
    });
    return serializeOrder(order);
};

const create = async (user, payload) => {
    const hotelId = await ensureHotelAccess(user, payload.hotelId);
    const existing = await db.openOrders.findOne({
        where: { createIdempotencyKey: payload.idempotencyKey }
    });
    if (existing) {
        await ensureOrderAccess(user, existing);
        return { order: await getDetailedOrder(existing.id), duplicate: true };
    }

    let created;
    try {
        created = await db.openOrders.sequelize.transaction(async (transaction) => {
            let table = null;
            const needsTable = payload.orderType === 'DINE_IN';

            if (needsTable && !payload.tableId) {
                throw CustomError(STATUS_CODE.BAD_REQUEST, 'Table is required for dine-in orders');
            }
            if (!needsTable && payload.tableId) {
                throw CustomError(STATUS_CODE.BAD_REQUEST, 'Table can only be selected for dine-in orders');
            }

            if (payload.tableId) {
                table = await db.tables.findOne({
                    where: { id: payload.tableId, hotelId },
                    transaction,
                    lock: transaction.LOCK.UPDATE
                });
                if (!table) throw CustomError(STATUS_CODE.NOT_FOUND, 'Table not found');
                // Manager POS tables are references only. A table always remains available,
                // and multiple customers may have separate open orders on the same table.
            }

            const order = await db.openOrders.create({
                id: uuidv4(),
                hotelId,
                tableId: table?.id || null,
                orderNumber: makeOrderNumber(),
                orderType: payload.orderType,
                customerName: payload.customerName || null,
                customerPhone: payload.customerPhone || null,
                notes: payload.notes || null,
                status: 'OPEN',
                createdByUserId: user.id,
                createIdempotencyKey: payload.idempotencyKey
            }, { transaction });

            return order;
        });
    } catch (error) {
        if (error?.name === 'SequelizeUniqueConstraintError') {
            const duplicate = await db.openOrders.findOne({
                where: { createIdempotencyKey: payload.idempotencyKey }
            });
            if (duplicate) return { order: await getDetailedOrder(duplicate.id), duplicate: true };
        }
        throw mapSequelizeError(error);
    }

    emitOrderEvent(created, 'open-order:created');
    return { order: await getDetailedOrder(created.id), duplicate: false };
};

const list = async (user, requestedHotelId) => {
    const hotelId = await ensureHotelAccess(user, requestedHotelId);
    const orders = await db.openOrders.findAll({
        where: { hotelId, status: { [Op.in]: OPEN_SECTION_STATUSES } },
        include: [
            {
                model: db.tables,
                as: 'table',
                attributes: ['id', 'tableNumber', 'tableName', 'status'],
                required: false
            },
            {
                model: db.users,
                as: 'createdBy',
                attributes: ['id', 'firstName', 'lastName']
            }
        ],
        order: [['updatedAt', 'DESC']]
    });

    if (!orders.length) return [];
    const ids = orders.map((order) => order.id);
    const aggregateRows = await db.openOrderItems.findAll({
        where: { openOrderId: { [Op.in]: ids } },
        attributes: [
            'openOrderId',
            [db.Sequelize.fn('SUM', db.Sequelize.col('quantity')), 'itemCount'],
            [db.Sequelize.fn('SUM', db.Sequelize.col('lineTotal')), 'runningTotal'],
            [db.Sequelize.fn('MAX', db.Sequelize.col('addedAt')), 'lastItemAt']
        ],
        group: ['openOrderId'],
        raw: true
    });
    const aggregates = new Map(aggregateRows.map((row) => [row.openOrderId, row]));
    return orders.map((order) => serializeOrder(order, aggregates.get(order.id) || {
        itemCount: 0,
        runningTotal: 0,
        lastItemAt: null
    }));
};

const listCompleted = async (user, requestedHotelId, filters = {}) => {
    const hotelId = await ensureHotelAccess(user, requestedHotelId);
    const paidAt = {};
    if (filters.dateFrom) paidAt[Op.gte] = new Date(filters.dateFrom);
    if (filters.dateTo) paidAt[Op.lt] = new Date(filters.dateTo);

    const where = { hotelId, status: 'COMPLETED' };
    if (Object.keys(paidAt).length) where.paidAt = paidAt;

    const orders = await db.openOrders.findAll({
        where,
        include: [
            {
                model: db.tables,
                as: 'table',
                attributes: ['id', 'tableNumber', 'tableName', 'status'],
                required: false
            },
            {
                model: db.users,
                as: 'createdBy',
                attributes: ['id', 'firstName', 'lastName']
            },
            {
                model: db.openOrderItems,
                as: 'items',
                include: [{
                    model: db.users,
                    as: 'addedBy',
                    attributes: ['id', 'firstName', 'lastName']
                }]
            }
        ],
        order: [
            ['paidAt', 'DESC'],
            [{ model: db.openOrderItems, as: 'items' }, 'addedAt', 'ASC']
        ]
    });

    return orders.map((order) => serializeOrder(order));
};

const getById = async (user, orderId) => {
    const order = await db.openOrders.findByPk(orderId, { attributes: ['id', 'hotelId'] });
    await ensureOrderAccess(user, order);
    return getDetailedOrder(orderId);
};

const addItems = async (user, orderId, payload) => {
    let result;
    const addedItemIds = [];

    try {
        result = await db.openOrders.sequelize.transaction(async (transaction) => {
            const order = await getOrderForUpdate(user, orderId, transaction);
            const duplicate = await db.openOrderItems.findOne({
                where: { openOrderId: order.id, additionKey: payload.idempotencyKey },
                transaction
            });
            if (duplicate) return { order, duplicate: true };

            if (order.status !== 'OPEN') {
                throw CustomError(STATUS_CODE.CONFLICT, 'Billed or completed orders cannot be edited');
            }

            if (
                payload.expectedRevision !== undefined &&
                Number(payload.expectedRevision) !== Number(order.revision)
            ) {
                throw CustomError(
                    STATUS_CODE.CONFLICT,
                    'Order changed on another device. Refresh and try again.'
                );
            }

            const normalized = new Map();
            payload.items.forEach((item) => {
                const current = normalized.get(item.menuId);
                normalized.set(item.menuId, {
                    ...item,
                    quantity: (current?.quantity || 0) + item.quantity,
                    notes: item.notes || current?.notes || null
                });
            });

            const menuIds = [...normalized.keys()];
            const menus = await db.menu.findAll({
                where: { id: { [Op.in]: menuIds }, hotelId: order.hotelId, status: 'AVAILABLE' },
                transaction
            });
            if (menus.length !== menuIds.length) {
                throw CustomError(STATUS_CODE.BAD_REQUEST, 'One or more menu items are unavailable');
            }

            const additions = menus.map((menu) => {
                const requested = normalized.get(menu.id);
                const unitPrice = money(menu.price);
                const item = {
                    id: uuidv4(),
                    openOrderId: order.id,
                    menuId: menu.id,
                    itemName: menu.name,
                    unitPrice,
                    quantity: requested.quantity,
                    lineTotal: money(unitPrice * requested.quantity),
                    notes: requested.notes || null,
                    additionKey: payload.idempotencyKey,
                    addedByUserId: user.id,
                    addedAt: new Date()
                };
                addedItemIds.push(item.id);
                return item;
            });
            await db.openOrderItems.bulkCreate(additions, { transaction });

            const addedTotal = additions.reduce((sum, item) => sum + item.lineTotal, 0);
            await order.update({
                subtotalAmount: money(Number(order.subtotalAmount) + addedTotal),
                finalAmount: money(Number(order.subtotalAmount) + addedTotal),
                revision: Number(order.revision) + 1
            }, { transaction });

            return { order, duplicate: false };
        });
    } catch (error) {
        throw mapSequelizeError(error);
    }

    const detail = await getDetailedOrder(result.order.id);
    if (!result.duplicate) {
        emitOrderEvent(result.order, 'open-order:item-added', {
            itemIds: addedItemIds,
            itemCount: addedItemIds.length,
            revision: result.order.revision,
            runningTotal: detail.runningTotal
        });
        emitOrderEvent(result.order, 'open-order:updated', { order: detail });
    }
    return { order: detail, duplicate: result.duplicate };
};

const generateBill = async (user, orderId, payload) => {
    let billed;
    try {
        billed = await db.openOrders.sequelize.transaction(async (transaction) => {
            const order = await getOrderForUpdate(user, orderId, transaction);
            if (order.status === 'BILLED') return order;
            if (order.status !== 'OPEN') {
                throw CustomError(STATUS_CODE.CONFLICT, 'Only open orders can be billed');
            }

            const subtotal = money(await db.openOrderItems.sum('lineTotal', {
                where: { openOrderId: order.id },
                transaction
            }));
            if (subtotal <= 0) {
                throw CustomError(STATUS_CODE.BAD_REQUEST, 'Add at least one item before billing');
            }

            const hotel = await db.hotel.findByPk(order.hotelId, { transaction });
            const hasDiscountOverride = Object.prototype.hasOwnProperty.call(payload, 'discountType');
            const discountType = hasDiscountOverride ? payload.discountType : (hotel.discountType || null);
            const discountValue = hasDiscountOverride
                ? Number(payload.discountValue || 0)
                : Number(hotel.discountValue || 0);
            const discountEnabled = Boolean(discountType) && (hasDiscountOverride || hotel.discountEnabled);
            const discountAmount = money(calculateDiscount(
                subtotal,
                discountEnabled,
                discountType,
                discountValue
            ));
            const taxableAmount = money(Math.max(0, subtotal - discountAmount));
            const bill = calculateBill(
                taxableAmount,
                payload.tipAmount || 0,
                hotel.gstPercent,
                hotel.gstEnabled
            );

            await order.update({
                status: 'BILLED',
                subtotalAmount: subtotal,
                discountType: discountEnabled ? discountType : null,
                discountValue: discountEnabled ? discountValue : 0,
                discountAmount,
                gstPercent: bill.gstPercent,
                cgstAmount: money(bill.cgst),
                sgstAmount: money(bill.sgst),
                tipAmount: money(bill.tipAmount),
                finalAmount: money(bill.totalPrice),
                billGeneratedAt: new Date(),
                revision: Number(order.revision) + 1
            }, { transaction });

            return order;
        });
    } catch (error) {
        throw mapSequelizeError(error);
    }

    const detail = await getDetailedOrder(billed.id);
    emitOrderEvent(billed, 'open-order:bill-generated', { order: detail });
    return detail;
};

const pay = async (user, orderId, payload) => {
    let paid;
    let duplicate = false;
    try {
        paid = await db.openOrders.sequelize.transaction(async (transaction) => {
            const order = await getOrderForUpdate(user, orderId, transaction);
            if (order.status === 'COMPLETED') {
                if (order.paymentIdempotencyKey === payload.idempotencyKey) {
                    duplicate = true;
                    return order;
                }
                throw CustomError(STATUS_CODE.CONFLICT, 'Order payment is already completed');
            }
            if (order.status !== 'BILLED') {
                throw CustomError(STATUS_CODE.CONFLICT, 'Generate the bill before payment');
            }

            const total = money(order.finalAmount);
            const cashReceived = payload.paymentMethod === 'CASH'
                ? money(payload.cashReceived)
                : total;
            if (payload.paymentMethod === 'CASH' && cashReceived < total) {
                throw CustomError(STATUS_CODE.BAD_REQUEST, 'Cash received is less than bill total');
            }

            await order.update({
                status: 'COMPLETED',
                paymentStatus: 'PAID',
                paymentMethod: payload.paymentMethod,
                cashReceived,
                changeAmount: money(Math.max(0, cashReceived - total)),
                paymentIdempotencyKey: payload.idempotencyKey,
                paidAt: new Date(),
                completedByUserId: user.id,
                revision: Number(order.revision) + 1
            }, { transaction });

            return order;
        });
    } catch (error) {
        throw mapSequelizeError(error);
    }

    const detail = await getDetailedOrder(paid.id);
    if (!duplicate) emitOrderEvent(paid, 'open-order:payment-completed', { order: detail });
    return { order: detail, duplicate, freeTableRequired: false };
};

const close = async (user, orderId, payload) => {
    let result;
    const tableFreed = false;
    try {
        result = await db.openOrders.sequelize.transaction(async (transaction) => {
            const order = await getOrderForUpdate(user, orderId, transaction);

            if (payload.cancel) {
                if (!OPEN_SECTION_STATUSES.includes(order.status)) {
                    throw CustomError(STATUS_CODE.CONFLICT, 'Completed orders cannot be cancelled');
                }
                await order.update({
                    status: 'CANCELLED',
                    notes: payload.reason || order.notes,
                    closedAt: new Date(),
                    revision: Number(order.revision) + 1
                }, { transaction });
            } else if (order.status !== 'COMPLETED') {
                throw CustomError(STATUS_CODE.CONFLICT, 'Complete payment before closing the order');
            } else if (!order.closedAt) {
                await order.update({ closedAt: new Date() }, { transaction });
            }

            // Table status is intentionally unchanged for Manager POS open orders.
            return order;
        });
    } catch (error) {
        throw mapSequelizeError(error);
    }

    const detail = await getDetailedOrder(result.id);
    emitOrderEvent(result, 'open-order:closed', { order: detail, tableFreed });
    if (tableFreed) emitOrderEvent(result, 'open-order:table-freed');
    return { order: detail, tableFreed };
};

const printKot = async (user, orderId) => {
    let response;
    try {
        response = await db.openOrders.sequelize.transaction(async (transaction) => {
            const order = await getOrderForUpdate(user, orderId, transaction);
            if (!OPEN_SECTION_STATUSES.includes(order.status)) {
                throw CustomError(STATUS_CODE.CONFLICT, 'KOT is not available for this order');
            }

            const items = await db.openOrderItems.findAll({
                where: { openOrderId: order.id, kotPrintedAt: null },
                order: [['addedAt', 'ASC']],
                transaction,
                lock: transaction.LOCK.UPDATE
            });
            if (!items.length) return { order, items: [], batchNumber: null };

            const maxBatch = await db.openOrderItems.max('kotBatchNumber', {
                where: { openOrderId: order.id },
                transaction
            });
            const batchNumber = (Number(maxBatch) || 0) + 1;
            const printedAt = new Date();
            await db.openOrderItems.update(
                { kotPrintedAt: printedAt, kotBatchNumber: batchNumber },
                { where: { id: { [Op.in]: items.map((item) => item.id) } }, transaction }
            );
            return {
                order,
                batchNumber,
                items: items.map((item) => ({
                    id: item.id,
                    itemName: item.itemName,
                    quantity: item.quantity,
                    notes: item.notes,
                    addedAt: item.addedAt,
                    kotPrintedAt: printedAt,
                    kotBatchNumber: batchNumber
                }))
            };
        });
    } catch (error) {
        throw mapSequelizeError(error);
    }

    if (response.items.length) {
        emitOrderEvent(response.order, 'open-order:kot-printed', {
            batchNumber: response.batchNumber,
            itemIds: response.items.map((item) => item.id)
        });
    }
    return {
        orderId: response.order.id,
        orderNumber: response.order.orderNumber,
        orderType: response.order.orderType,
        tableId: response.order.tableId,
        batchNumber: response.batchNumber,
        printedAt: response.items[0]?.kotPrintedAt || null,
        items: response.items
    };
};

export default { create, list, listCompleted, getById, addItems, generateBill, pay, close, printKot };
