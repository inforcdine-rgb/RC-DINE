import { Op } from 'sequelize';
import moment from 'moment';
import { db } from '../../config/database.js';
import logger from '../../config/logger.js';
import { USER_ROLES } from '../models/user.model.js';
import { CustomError, STATUS_CODE } from '../utils/common.js';
import orderRepo from '../repositories/order.repository.js';
import userRepo from '../repositories/user.repository.js';
import { getAdminSettings, saveAdminSettings } from '../../config/adminSettings.js';
import CryptoJS from 'crypto-js';
import env from '../../config/env.js';

const sanitizeOwner = (owner) => {
    const hotels = (owner.hotelUserRelations || []).map((relation) => relation.hotel).filter(Boolean);
    return {
        id: owner.id,
        firstName: owner.firstName,
        lastName: owner.lastName,
        email: owner.email,
        phoneNumber: owner.phoneNumber,
        status: owner.status,
        isBlocked: owner.isBlocked || false,
        role: owner.role,
        createdAt: owner.createdAt,
        hotels,
        hotelCount: hotels.length,
        subscriptionStatus: owner.subscriptionStatus || 'TRIAL',
        subscriptionStartAt: owner.subscriptionStartAt || null,
        subscriptionEndAt: owner.subscriptionEndAt || null,
        subscriptionPlan: owner.subscriptionPlan || null,
        trialStartAt: owner.trialStartAt || null,
        trialEndAt: owner.trialEndAt || null
    };
};

const dashboard = async () => {
    try {
        const [ownerCount, managerCount, hotelCount, activeSubscriptions, expiredSubscriptions, subscribedOwners] = await Promise.all([
            db.users.count({ where: { role: USER_ROLES[0] } }),
            db.users.count({ where: { role: USER_ROLES[1] } }),
            db.hotel.count(),
            db.users.count({ where: { role: USER_ROLES[0], subscriptionStatus: 'ACTIVE' } }),
            db.users.count({ where: { role: USER_ROLES[0], subscriptionStatus: 'EXPIRED' } }),
            db.users.findAll({
                where: {
                    role: USER_ROLES[0],
                    subscriptionPlan: { [Op.ne]: null }
                }
            })
        ]);

        const activePlans = getAdminSettings().plans;
        const totalRevenue = subscribedOwners.reduce((sum, owner) => {
            const planInfo = activePlans[owner.subscriptionPlan] || { amount: 0 };
            return sum + (planInfo.amount || 0);
        }, 0);

        return { ownerCount, managerCount, hotelCount, activeSubscriptions, expiredSubscriptions, revenue: totalRevenue };
    } catch (error) {
        logger('error', 'Error while fetching admin dashboard data', { error });
        throw CustomError(error.code, error.message);
    }
};

const listOwners = async (query = {}) => {
    try {
        const options = {
            where: { role: USER_ROLES[0] },
            include: [{
                model: db.hotelUserRelation,
                attributes: ['hotelId'],
                include: [{ model: db.hotel, attributes: ['id', 'name'] }]
            }],
            order: [['createdAt', 'DESC']]
        };

        if (query.search) {
            options.where[Op.or] = [
                { firstName: { [Op.like]: `%${query.search}%` } },
                { lastName: { [Op.like]: `%${query.search}%` } },
                { email: { [Op.like]: `%${query.search}%` } },
                { phoneNumber: { [Op.like]: `%${query.search}%` } }
            ];
        }

        const result = await userRepo.find(options);
        const rows = result.rows.map(sanitizeOwner);
        return { rows, count: result.count };
    } catch (error) {
        logger('error', 'Error while fetching admin owners list', { error });
        throw CustomError(error.code, error.message);
    }
};

const getOwnerDetail = async (ownerId) => {
    try {
        const owner = await db.users.findOne({
            where: { id: ownerId, role: USER_ROLES[0] },
            include: [{
                model: db.hotelUserRelation,
                include: [{ model: db.hotel, attributes: ['id', 'name', 'address'] }]
            }]
        });

        if (!owner) throw CustomError(STATUS_CODE.NOT_FOUND, 'Owner not found');

        const hotelIds = (owner.hotelUserRelations || []).map((r) => r.hotelId).filter(Boolean);
        let managerCount = 0;
        if (hotelIds.length > 0) {
            managerCount = await db.hotelUserRelation.count({
                distinct: true,
                col: 'userId',
                where: { hotelId: { [Op.in]: hotelIds } },
                include: [{ model: db.users, where: { role: USER_ROLES[1] } }]
            });
        }

        const sanitized = sanitizeOwner(owner);
        sanitized.managerCount = managerCount;
        return sanitized;
    } catch (error) {
        logger('error', 'Error while fetching admin owner details', { ownerId, error });
        throw CustomError(error.code, error.message);
    }
};

// Block / Unblock owner
const blockOwner = async (ownerId) => {
    try {
        const owner = await db.users.findOne({ where: { id: ownerId, role: USER_ROLES[0] } });
        if (!owner) throw CustomError(STATUS_CODE.NOT_FOUND, 'Owner not found');

        const newStatus = !owner.isBlocked;
        await userRepo.update({ where: { id: ownerId } }, { isBlocked: newStatus });

        logger('info', `Owner ${ownerId} ${newStatus ? 'blocked' : 'unblocked'}`);
        return {
            message: newStatus ? 'Owner blocked successfully' : 'Owner unblocked successfully',
            isBlocked: newStatus
        };
    } catch (error) {
        logger('error', 'Error in blockOwner', { error });
        throw CustomError(error.code || 500, error.message);
    }
};

// Extend subscription
const extendSubscription = async (ownerId, days) => {
    try {
        if (!days || days <= 0) throw CustomError(STATUS_CODE.BAD_REQUEST, 'Days must be greater than 0');

        const owner = await db.users.findOne({ where: { id: ownerId, role: USER_ROLES[0] } });
        if (!owner) throw CustomError(STATUS_CODE.NOT_FOUND, 'Owner not found');

        const currentEnd = owner.subscriptionEndAt || owner.trialEndAt || new Date();
        const newEnd = moment(currentEnd).add(days, 'days').toDate();

        await userRepo.update(
            { where: { id: ownerId } },
            { subscriptionEndAt: newEnd, subscriptionStatus: 'ACTIVE' }
        );

        logger('info', `Subscription extended for owner ${ownerId} by ${days} days`);
        return {
            message: `Subscription extended by ${days} days`,
            newEndDate: moment(newEnd).format('DD/MM/YYYY')
        };
    } catch (error) {
        logger('error', 'Error in extendSubscription', { error });
        throw CustomError(error.code || 500, error.message);
    }
};

const revenue = async () => {
    try {
        const owners = await db.users.findAll({
            where: { role: USER_ROLES[0], subscriptionPlan: { [Op.ne]: null } },
            order: [['subscriptionStartAt', 'DESC']]
        });

        const activePlans = getAdminSettings().plans;
        const purchases = owners.map((owner) => {
            const plan = owner.subscriptionPlan;
            const planInfo = activePlans[plan] || { days: 0, amount: 0 };
            return {
                id: owner.id,
                ownerName: `${owner.firstName} ${owner.lastName}`,
                planName: plan,
                daysPurchased: planInfo.days,
                amountPaid: planInfo.amount,
                purchaseDate: owner.subscriptionStartAt,
                expiryDate: owner.subscriptionEndAt,
                paymentReference: owner.razorpayPaymentId || owner.razorpayOrderId,
                status: owner.subscriptionStatus
            };
        });

        const todayStart = moment().startOf('day');
        const weekStart = moment().startOf('week');
        const monthStart = moment().startOf('month');
        const yearStart = moment().startOf('year');
        let today = 0, week = 0, month = 0, year = 0;

        purchases.forEach((p) => {
            const amount = p.amountPaid;
            if (p.purchaseDate) {
                const date = moment(p.purchaseDate);
                if (date.isSameOrAfter(todayStart)) today += amount;
                if (date.isSameOrAfter(weekStart)) week += amount;
                if (date.isSameOrAfter(monthStart)) month += amount;
                if (date.isSameOrAfter(yearStart)) year += amount;
            }
        });

        return { summary: { today, week, month, year }, purchases };
    } catch (error) {
        logger('error', 'Error while fetching admin revenue analytics', { error });
        throw CustomError(error.code, error.message);
    }
};

const getSettings = async (adminId) => {
    try {
        const admin = await db.users.findOne({ where: { id: adminId } });
        if (!admin) throw CustomError(STATUS_CODE.NOT_FOUND, 'Admin not found');

        const settings = getAdminSettings();
        let maskedSecret = '';
        if (settings.razorpay.keySecret) {
            const len = settings.razorpay.keySecret.length;
            maskedSecret = len > 8
                ? settings.razorpay.keySecret.slice(0, 4) + '*'.repeat(len - 8) + settings.razorpay.keySecret.slice(-4)
                : '••••••••';
        }

        return {
            profile: { firstName: admin.firstName, lastName: admin.lastName, email: admin.email, phoneNumber: admin.phoneNumber },
            razorpay: { keyId: settings.razorpay.keyId, keySecret: maskedSecret },
            plans: settings.plans
        };
    } catch (error) {
        logger('error', 'Error while fetching admin settings service', { error });
        throw CustomError(error.code || 500, error.message);
    }
};

const updateSettings = async (adminId, payload) => {
    try {
        const { profile, razorpay, plans } = payload;
        const admin = await db.users.findOne({ where: { id: adminId } });
        if (!admin) throw CustomError(STATUS_CODE.NOT_FOUND, 'Admin not found');

        const updateData = {};
        if (profile) {
            if (profile.firstName) updateData.firstName = profile.firstName;
            if (profile.lastName) updateData.lastName = profile.lastName;
            if (profile.email) updateData.email = profile.email;
            if (profile.phoneNumber) updateData.phoneNumber = profile.phoneNumber;
            if (profile.password) {
                updateData.password = CryptoJS.AES.encrypt(profile.password, env.cryptoSecret).toString();
            }
        }

        if (Object.keys(updateData).length > 0) {
            await userRepo.update({ where: { id: adminId } }, updateData);
        }

        const currentSettings = getAdminSettings();
        if (razorpay) {
            if (razorpay.keyId) currentSettings.razorpay.keyId = razorpay.keyId;
            if (razorpay.keySecret && !razorpay.keySecret.includes('*') && razorpay.keySecret.trim() !== '') {
                currentSettings.razorpay.keySecret = razorpay.keySecret;
            }
        }
        if (plans) {
            if (plans.MONTHLY?.amount) currentSettings.plans.MONTHLY.amount = Number(plans.MONTHLY.amount);
            if (plans.HALF_YEARLY?.amount) {
                currentSettings.plans.HALF_YEARLY.amount = Number(plans.HALF_YEARLY.amount);
                currentSettings.plans.SIX_MONTHS.amount = Number(plans.HALF_YEARLY.amount);
            }
            if (plans.YEARLY?.amount) currentSettings.plans.YEARLY.amount = Number(plans.YEARLY.amount);
        }

        saveAdminSettings(currentSettings);
        return { success: true, message: 'Settings updated successfully' };
    } catch (error) {
        logger('error', 'Error while updating admin settings service', { error });
        throw CustomError(error.code || 500, error.message);
    }
};

export default {
    dashboard,
    listOwners,
    getOwnerDetail,
    blockOwner,
    extendSubscription,
    revenue,
    getSettings,
    updateSettings
};