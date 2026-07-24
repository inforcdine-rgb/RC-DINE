import crypto from 'crypto';
import { Op } from 'sequelize';
import { db } from '../../config/database.js';
import env from '../../config/env.js';
import logger from '../../config/logger.js';
import { emitToHotel, emitToOrder } from '../../config/socket.js';
import customerRepo from '../repositories/customer.repository.js';
import hotelRepo from '../repositories/hotel.repository.js';
import orderService from '../services/order.service.js';
import razorpayService from '../services/razorpay.service.js';
import { CustomError, STATUS_CODE, calculateBill, calculateDiscount } from '../utils/common.js';

const createOrder = async (req, res) => {
    try {
        const { hotelId, customerId, tableId, tableNumber, menus, tipAmount = 0 } = req.body;
        if (!hotelId || !customerId || !tableId || !tableNumber || !menus || !menus.length) {
            throw CustomError(STATUS_CODE.BAD_REQUEST, 'Missing required fields');
        }

        const menuIds = menus.map((item) => item.menuId).filter(Boolean);
        const liveMenuItems = await db.menu.findAll({ where: { id: { [Op.in]: menuIds } } });
        const liveMenuById = liveMenuItems.reduce((cur, item) => {
            cur[item.id] = item;
            return cur;
        }, {});
        menus.forEach((item) => {
            const liveItem = liveMenuById[item.menuId];
            if (!liveItem) throw CustomError(STATUS_CODE.NOT_FOUND, `${item.menuName || 'Menu item'} not found`);
            if (liveItem.status === 'UNAVAILABLE') throw CustomError(STATUS_CODE.BAD_REQUEST, `${liveItem.name} is unavailable`);
            item.price = liveItem.price;
            item.menuName = liveItem.name;
        });

        const hotel = await hotelRepo.find({
            where: { id: hotelId },
            attributes: ['gstEnabled', 'gstPercent', 'discountEnabled', 'discountType', 'discountValue']
        });
        const gstEnabled = !!hotel?.gstEnabled;
        const gstPercent = gstEnabled ? Number(hotel?.gstPercent || 0) : 0;

        const subtotal = menus.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discountEnabled = !!hotel?.discountEnabled;
        const discountType = hotel?.discountType || null;
        const discountValue = Number(hotel?.discountValue || 0);
        const discountAmount = calculateDiscount(subtotal, discountEnabled, discountType, discountValue);
        const taxableAmount = Math.max(0, subtotal - discountAmount);
        const { sgst, cgst, totalPrice } = calculateBill(taxableAmount, tipAmount, gstPercent, gstEnabled);

        // Razorpay order creation
        const amount = totalPrice * 100; // in paise
        logger('info', `Creating Razorpay payment order for customer ${customerId} of amount ${amount} paise`);
        const rzpOrder = await razorpayService.order({
            amount,
            currency: 'INR',
            receipt: `cust_pay_${Date.now()}`
        });

        const customer = await customerRepo.findOne({ where: { id: customerId } });
        if (!customer) {
            throw CustomError(STATUS_CODE.NOT_FOUND, 'Customer not found');
        }

        return res.status(STATUS_CODE.OK).json({
            success: true,
            orderId: rzpOrder.id,
            amount: rzpOrder.amount,
            key: env.razorpay.keyId,
            totalPrice,
            sgst,
            cgst,
            gstEnabled,
            gstPercent,
            discountEnabled,
            discountType,
            discountValue,
            discountAmount,
            subtotal,
            taxableAmount,
            tipAmount: Number(tipAmount) || 0,
            menus,
            customer: {
                name: customer.name,
                email: customer.email,
                phoneNumber: customer.phoneNumber
            }
        });
    } catch (error) {
        logger('error', 'Error creating customer payment order', { error: error.message });
        return res.status(error.code || STATUS_CODE.INTERNAL_SERVER_ERROR || 500).json({ message: error.message });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            razorpay_signature: razorpaySignature,
            hotelId,
            customerId,
            tableId,
            tableNumber,
            menus,
            tipAmount = 0
        } = req.body;

        if (
            !razorpayOrderId ||
            !razorpayPaymentId ||
            !razorpaySignature ||
            !hotelId ||
            !customerId ||
            !tableId ||
            !tableNumber ||
            !menus
        ) {
            throw CustomError(
                STATUS_CODE.BAD_REQUEST,
                'Missing verification details'
            );
        }

        const generated = crypto
            .createHmac('sha256', env.razorpay.keySecret)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest('hex');

        if (generated !== razorpaySignature) {
            throw CustomError(
                STATUS_CODE.FORBIDDEN,
                'Invalid signature'
            );
        }

        logger(
            'info',
            `Payment verified. Placing food order for customer ${customerId}`
        );

        const result = await orderService.placeOrder({
            customerId,
            menus,
            hotelId,
            tableId,
            tableNumber,
            tipAmount,
            razorpayOrderId,
            razorpayPaymentId
        });

        const createdOrder = result?.order || result;

        const livePayload = {
            type: 'CUSTOMER_QR',
            source: 'CUSTOMER_QR',
            hotelId,
            tableId,
            tableNumber,
            customerId,
            orderId:
                createdOrder?.orderId ||
                createdOrder?.id ||
                result?.orderId ||
                result?.id,
            orderNumber:
                createdOrder?.orderNumber ||
                result?.orderNumber,
            order: createdOrder,
            paymentMode: 'ONLINE',
            createdAt: new Date().toISOString()
        };

        emitToHotel(hotelId, 'new-order', livePayload);

        if (livePayload.orderId) {
            emitToOrder(
                livePayload.orderId,
                'order-status-updated',
                {
                    hotelId,
                    orderId: livePayload.orderId,
                    orderNumber: livePayload.orderNumber,
                    status:
                        createdOrder?.orderStatus ||
                        createdOrder?.status ||
                        'PENDING',
                    order: createdOrder,
                    updatedAt: new Date().toISOString()
                }
            );
        }

        logger('info', 'Paid QR order Socket.IO event emitted', {
            hotelId,
            orderId: livePayload.orderId,
            orderNumber: livePayload.orderNumber
        });

        return res.status(STATUS_CODE.CREATED).json(result);
    } catch (error) {
        logger('error', 'Error verifying customer payment', {
            error: error.message
        });

        return res
            .status(
                error.code ||
                STATUS_CODE.INTERNAL_SERVER_ERROR ||
                500
            )
            .json({
                message: error.message
            });
    }
};

export default {
    createOrder,
    verifyPayment
};
