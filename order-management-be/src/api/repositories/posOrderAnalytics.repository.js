import { Op, Sequelize } from 'sequelize';
import { db } from '../../config/database.js';
import logger from '../../config/logger.js';
import { CustomError } from '../utils/common.js';

// Manager POS orders intentionally live in openOrders/openOrderItems. Reporting
// must read completed, paid headers from that source instead of copying them into
// the customer-facing orders table and creating two records for one transaction.
const completedWhere = (hotelIds, dateRange) => {
    const where = {
        hotelId: { [Op.in]: hotelIds },
        status: 'COMPLETED',
        paymentStatus: 'PAID'
    };

    if (dateRange?.start && dateRange?.end) {
        where.paidAt = { [Op.between]: [dateRange.start, dateRange.end] };
    }

    return where;
};

const mapError = (message, error) => {
    const detail = error?.errors?.[0]?.message || error.message;
    logger('error', message, { error: detail });
    throw CustomError(error.code, detail);
};

const sumCompletedRevenue = async (hotelIds, dateRange) => {
    if (!hotelIds?.length) return 0;

    try {
        const total = await db.openOrders.sum('finalAmount', {
            where: completedWhere(hotelIds, dateRange)
        });
        return Number(total) || 0;
    } catch (error) {
        return mapError('Error while summing completed Manager POS revenue', error);
    }
};

const countCompletedOrders = async (hotelIds, dateRange) => {
    if (!hotelIds?.length) return 0;

    try {
        return await db.openOrders.count({
            where: completedWhere(hotelIds, dateRange)
        });
    } catch (error) {
        return mapError('Error while counting completed Manager POS orders', error);
    }
};

const findRevenueTrend = async (hotelIds, dateRange, granularity) => {
    if (!hotelIds?.length) return [];

    try {
        const periodExpression =
            granularity === 'month'
                ? Sequelize.fn('DATE_FORMAT', Sequelize.col('paidAt'), '%Y-%m')
                : Sequelize.fn('DATE', Sequelize.col('paidAt'));

        return await db.openOrders.findAll({
            attributes: [
                [periodExpression, 'period'],
                [Sequelize.fn('SUM', Sequelize.col('finalAmount')), 'totalPrice']
            ],
            where: completedWhere(hotelIds, dateRange),
            order: [periodExpression],
            group: [periodExpression],
            raw: true
        });
    } catch (error) {
        return mapError('Error while fetching Manager POS revenue trend', error);
    }
};

const findCompletedSalesByHotelIds = async (hotelIds) => {
    if (!hotelIds?.length) return [];

    try {
        return await db.openOrders.findAll({
            attributes: ['hotelId', [Sequelize.fn('SUM', Sequelize.col('finalAmount')), 'sales']],
            where: completedWhere(hotelIds),
            group: ['hotelId'],
            raw: true
        });
    } catch (error) {
        return mapError('Error while fetching Manager POS sales by hotel', error);
    }
};

const findTopSellingItems = async (hotelId) => {
    if (!hotelId) return [];

    try {
        return await db.openOrderItems.findAll({
            attributes: [
                ['itemName', 'menuName'],
                [Sequelize.fn('SUM', Sequelize.col('openOrderItems.quantity')), 'totalQuantity'],
                // Item-level reports use captured line totals. Taxes, discounts and
                // tips remain represented once at order level in revenue reports.
                [Sequelize.fn('SUM', Sequelize.col('openOrderItems.lineTotal')), 'totalPrice']
            ],
            include: [
                {
                    model: db.openOrders,
                    as: 'openOrder',
                    attributes: [],
                    required: true,
                    where: completedWhere([hotelId])
                }
            ],
            group: ['openOrderItems.itemName'],
            raw: true
        });
    } catch (error) {
        return mapError('Error while fetching top-selling Manager POS items', error);
    }
};

export default {
    sumCompletedRevenue,
    countCompletedOrders,
    findRevenueTrend,
    findCompletedSalesByHotelIds,
    findTopSellingItems
};
