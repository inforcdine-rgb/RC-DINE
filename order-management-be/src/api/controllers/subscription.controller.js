import crypto from 'crypto';
import moment from 'moment';
import { db } from '../../config/database.js';
import env from '../../config/env.js';
import logger from '../../config/logger.js';
import hotelUserRelationRepo from '../repositories/hotelUserRelation.repository.js';
import subscriptionPlanRepo from '../repositories/subscriptionPlan.repository.js';
import userRepo from '../repositories/user.repository.js';
import razorpayService from '../services/razorpay.service.js';
import { CustomError, STATUS_CODE } from '../utils/common.js';

const serializePlan = (plan) => ({
    code: plan.code,
    name: plan.name,
    title: plan.name,
    subtitle: plan.subtitle,
    amount: Number(plan.amount),
    days: Number(plan.days),
    features: Array.isArray(plan.features) ? plan.features : [],
    popular: Boolean(plan.isPopular),
    isPopular: Boolean(plan.isPopular),
    isActive: Boolean(plan.isActive),
    displayOrder: Number(plan.displayOrder),
    buttonText: plan.buttonText || `Choose ${plan.name}`
});

const plans = async (req, res) => {
    try {
        const rows = await subscriptionPlanRepo.findActive();
        return res.status(STATUS_CODE.OK).send({
            success: true,
            plans: rows.map(serializePlan)
        });
    } catch (error) {
        return res.status(error.code || STATUS_CODE.INTERNAL_SERVER_ERROR).send({
            success: false,
            message: error.message
        });
    }
};

const createOrder = async (req, res) => {
    try {
        const selectedPlan = await subscriptionPlanRepo.findByCode(req.body?.plan);
        if (!selectedPlan) {
            throw CustomError(STATUS_CODE.BAD_REQUEST, 'Invalid or inactive plan');
        }

        const amountInPaise = Math.round(Number(selectedPlan.amount) * 100);
        if (!Number.isFinite(amountInPaise) || amountInPaise < 100) {
            throw CustomError(STATUS_CODE.BAD_REQUEST, 'Plan price is invalid');
        }

        const data = {
            amount: amountInPaise,
            currency: 'INR',
            receipt: `sub_${String(req.user.id).replace(/-/g, '').slice(0, 12)}_${Date.now()}`,
            notes: {
                userId: String(req.user.id),
                plan: selectedPlan.code
            }
        };

        const order = await razorpayService.order(data);

        return res.status(STATUS_CODE.OK).send({
            success: true,
            order,
            orderId: order.id,
            amount: data.amount,
            key: env.razorpay.keyId,
            plan: serializePlan(selectedPlan)
        });
    } catch (error) {
        logger('error', 'Subscription Razorpay order creation failed', { error });
        return res.status(error.code || STATUS_CODE.INTERNAL_SERVER_ERROR).send({
            success: false,
            message: error.message
        });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            razorpay_signature: razorpaySignature,
            plan
        } = req.body;

        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !plan) {
            throw CustomError(STATUS_CODE.BAD_REQUEST, 'Missing required fields');
        }

        const selectedPlan = await subscriptionPlanRepo.findByCode(plan);
        if (!selectedPlan) {
            throw CustomError(STATUS_CODE.BAD_REQUEST, 'Invalid or inactive plan');
        }

        const generated = crypto
            .createHmac('sha256', env.razorpay.keySecret)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest('hex');

        const generatedBuffer = Buffer.from(generated, 'utf8');
        const signatureBuffer = Buffer.from(String(razorpaySignature), 'utf8');
        const validSignature =
            generatedBuffer.length === signatureBuffer.length &&
            crypto.timingSafeEqual(generatedBuffer, signatureBuffer);

        if (!validSignature) {
            throw CustomError(STATUS_CODE.FORBIDDEN, 'Invalid signature');
        }

        const user = await userRepo.findOne({ where: { id: req.user.id } });
        if (!user) throw CustomError(STATUS_CODE.NOT_FOUND, 'User not found');

        const now = moment();
        let start;
        let end;

        if (user.subscriptionEndAt && moment(user.subscriptionEndAt).isAfter(now)) {
            start = user.subscriptionStartAt || now.toISOString();
            end = moment(user.subscriptionEndAt).add(Number(selectedPlan.days), 'days').toISOString();
        } else {
            start = now.toISOString();
            end = moment(now).add(Number(selectedPlan.days), 'days').toISOString();
        }

        await userRepo.update(
            { where: { id: req.user.id } },
            {
                subscriptionStartAt: start,
                subscriptionEndAt: end,
                subscriptionStatus: 'ACTIVE',
                subscriptionPlan: selectedPlan.code,
                razorpayOrderId,
                razorpayPaymentId
            }
        );

        return res.status(STATUS_CODE.OK).send({
            success: true,
            message: 'Subscription activated',
            data: {
                subscriptionStatus: 'ACTIVE',
                subscriptionEndAt: end,
                plan: serializePlan(selectedPlan)
            }
        });
    } catch (error) {
        return res.status(error.code || STATUS_CODE.INTERNAL_SERVER_ERROR).send({
            success: false,
            message: error.message
        });
    }
};

const status = async (req, res) => {
    try {
        let subscriptionUserId = req.user.id;

        if (String(req.user.role || '').toUpperCase() === 'MANAGER') {
            let managerHotelId = req.user.hotelId;

            if (!managerHotelId) {
                const managerRelation = await hotelUserRelationRepo.find({
                    where: { userId: req.user.id },
                    limit: 1
                });
                managerHotelId = managerRelation?.rows?.[0]?.hotelId;
            }

            if (managerHotelId) {
                const ownerRelation = await hotelUserRelationRepo.find({
                    where: { hotelId: managerHotelId },
                    include: [
                        {
                            model: db.users,
                            where: { role: 'OWNER' },
                            attributes: ['id']
                        }
                    ],
                    limit: 1
                });

                if (ownerRelation?.rows?.[0]?.userId) {
                    subscriptionUserId = ownerRelation.rows[0].userId;
                }
            }
        }

        const user = await userRepo.findOne({ where: { id: subscriptionUserId } });
        if (!user) throw CustomError(STATUS_CODE.NOT_FOUND, 'Subscription owner not found');

        const now = moment();
        let statusValue = user.subscriptionStatus;
        if (!statusValue) {
            statusValue = 'TRIAL';
            try {
                await userRepo.update({ where: { id: subscriptionUserId } }, { subscriptionStatus: 'TRIAL' });
            } catch (error) {
                logger('error', 'Error updating null subscriptionStatus to TRIAL', { error });
            }
        }

        let trialStart = user.trialStartAt;
        let trialEnd = user.trialEndAt;
        if (!trialEnd && statusValue === 'TRIAL') {
            trialStart = now.toISOString();
            trialEnd = moment(now).add(2, 'days').toISOString();
            try {
                await userRepo.update(
                    { where: { id: subscriptionUserId } },
                    {
                        trialStartAt: trialStart,
                        trialEndAt: trialEnd
                    }
                );
            } catch (error) {
                logger('error', 'Error initializing trial fields', { error });
            }
        }

        let trialRemaining = null;
        let subscriptionRemaining = null;

        if (trialEnd) {
            const trialEndMoment = moment(trialEnd);
            trialRemaining = trialEndMoment.isAfter(now) ? trialEndMoment.diff(now, 'seconds') : 0;
            if (trialEndMoment.isBefore(now) && statusValue === 'TRIAL') {
                statusValue = 'EXPIRED';
                await userRepo.update({ where: { id: subscriptionUserId } }, { subscriptionStatus: 'EXPIRED' });
            }
        }

        if (user.subscriptionEndAt) {
            const subscriptionEndMoment = moment(user.subscriptionEndAt);
            subscriptionRemaining = subscriptionEndMoment.isAfter(now) ? subscriptionEndMoment.diff(now, 'seconds') : 0;
            if (subscriptionEndMoment.isBefore(now) && statusValue === 'ACTIVE') {
                statusValue = 'EXPIRED';
                await userRepo.update({ where: { id: subscriptionUserId } }, { subscriptionStatus: 'EXPIRED' });
            }
        }

        return res.status(STATUS_CODE.OK).send({
            status: statusValue,
            trialRemaining,
            subscriptionRemaining,
            plan: user.subscriptionPlan || null
        });
    } catch (error) {
        return res.status(error.code || STATUS_CODE.INTERNAL_SERVER_ERROR).send({ message: error.message });
    }
};

export default { createOrder, verifyPayment, status, plans };
