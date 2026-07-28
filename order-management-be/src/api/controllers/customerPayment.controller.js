/* eslint-disable camelcase */
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { Op } from 'sequelize';
import { db } from '../../config/database.js';
import logger from '../../config/logger.js';
import { emitToHotel, emitToOrder } from '../../config/socket.js';
import customerRepo from '../repositories/customer.repository.js';
import hotelRepo from '../repositories/hotel.repository.js';
import hotelService from '../services/hotel.service.js';
import orderService from '../services/order.service.js';
import { CustomError, STATUS_CODE, calculateBill, calculateDiscount } from '../utils/common.js';

const createOrder = async (req, res) => {
    try {
        const { hotelId, customerId, tableId, tableNumber, menus, tipAmount = 0 } = req.body;
        if (!hotelId || !customerId || !tableId || !tableNumber || !menus || !menus.length) {
            throw CustomError(STATUS_CODE.BAD_REQUEST, 'Missing required fields');
        }

        const menuIds = menus.map((item) => item.menuId).filter(Boolean);
        const liveMenuItems = await db.menu.findAll({
            where: {
                id: { [Op.in]: menuIds },
                hotelId
            }
        });
        const liveMenuById = liveMenuItems.reduce((cur, item) => {
            cur[item.id] = item;
            return cur;
        }, {});
        menus.forEach((item) => {
            const liveItem = liveMenuById[item.menuId];
            if (!liveItem) throw CustomError(STATUS_CODE.NOT_FOUND, `${item.menuName || 'Menu item'} not found`);
            if (liveItem.status === 'UNAVAILABLE') { throw CustomError(STATUS_CODE.BAD_REQUEST, `${liveItem.name} is unavailable`); }
            item.price = liveItem.price;
            item.menuName = liveItem.name;
        });

        const hotel = await hotelRepo.find({
            where: { id: hotelId },
            attributes: [
                'gstEnabled',
                'gstPercent',
                'discountEnabled',
                'discountType',
                'discountValue',
                'paymentEnabled',
                'razorpayKeyId',
                'razorpayKeySecret'
            ]
        });
        const gstEnabled = !!hotel?.gstEnabled;
        const gstPercent = gstEnabled ? Number(hotel?.gstPercent || 0) : 0;

        const subtotal = menus.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const discountEnabled = !!hotel?.discountEnabled;
        const discountType = hotel?.discountType || null;
        const discountValue = Number(hotel?.discountValue || 0);
        const discountAmount = calculateDiscount(subtotal, discountEnabled, discountType, discountValue);
        const taxableAmount = Math.max(0, subtotal - discountAmount);
        const { sgst, cgst, totalPrice } = calculateBill(taxableAmount, tipAmount, gstPercent, gstEnabled);

        if (!hotel?.paymentEnabled) {
            throw CustomError(STATUS_CODE.BAD_REQUEST, 'Online payment is disabled for this hotel');
        }

        const razorpayKeyId = hotel?.razorpayKeyId;
        const razorpayKeySecret = hotelService.decrypt(hotel?.razorpayKeySecret);

        logger('info', 'Razorpay credentials loaded', {

            keyId: razorpayKeyId,

            secretLength: razorpayKeySecret ? razorpayKeySecret.length : 0

        });

        if (!razorpayKeyId || !razorpayKeySecret) {
            throw CustomError(STATUS_CODE.BAD_REQUEST, 'Hotel Razorpay settings are incomplete');
        }

        const hotelRazorpay = new Razorpay({
            key_id: razorpayKeyId,
            key_secret: razorpayKeySecret
        });

        // Razorpay order creation with this hotel's own credentials
        const amount = Math.round(totalPrice * 100); // in paise
        logger(
            'in} catch (errorfo',
            `Creating Razorpay payment order for hotel ${hotelId}, customer ${customerId}, amount ${amount} paise`
        );
        const rzpOrder = await hotelRazorpay.orders.create({
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
            key: razorpayKeyId,
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
            !Array.isArray(menus) ||
            !menus.length
        ) {
            throw CustomError(STATUS_CODE.BAD_REQUEST, 'Missing verification details');
        }

        /*
         * 1. Duplicate payment block
         *
         * Same Razorpay payment ID se dobara order create nahi hoga.
         */
        const existingPaidOrder = await db.orders.findOne({
            where: {
                razorpayPaymentId
            },
            attributes: ['id', 'orderNumber', 'razorpayPaymentId']
        });

        if (existingPaidOrder) {
            throw CustomError(STATUS_CODE.CONFLICT, 'This payment has already been used');
        }

        /*
         * 2. Hotel aur uski Razorpay settings fetch karo.
         *
         * Bill calculation settings bhi yahin se aayengi.
         */
        const paymentHotel = await hotelRepo.find({
            where: {
                id: hotelId
            },
            attributes: [
                'id',
                'paymentEnabled',
                'razorpayKeyId',
                'razorpayKeySecret',
                'gstEnabled',
                'gstPercent',
                'discountEnabled',
                'discountType',
                'discountValue'
            ]
        });

        if (!paymentHotel) {
            throw CustomError(STATUS_CODE.NOT_FOUND, 'Hotel not found');
        }

        if (!paymentHotel.paymentEnabled) {
            throw CustomError(STATUS_CODE.BAD_REQUEST, 'Online payment is disabled for this hotel');
        }

        const razorpayKeySecret = hotelService.decrypt(paymentHotel.razorpayKeySecret);

        if (!paymentHotel.razorpayKeyId || !razorpayKeySecret) {
            throw CustomError(STATUS_CODE.BAD_REQUEST, 'Hotel Razorpay settings are incomplete');
        }

        /*
         * 3. Signature safe comparison.
         */
        const generatedSignature = crypto
            .createHmac('sha256', razorpayKeySecret)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest('hex');

        const generatedBuffer = Buffer.from(generatedSignature, 'utf8');

        const receivedBuffer = Buffer.from(String(razorpaySignature), 'utf8');

        const signatureIsValid =
            generatedBuffer.length === receivedBuffer.length && crypto.timingSafeEqual(generatedBuffer, receivedBuffer);

        if (!signatureIsValid) {
            throw CustomError(STATUS_CODE.FORBIDDEN, 'Invalid payment signature');
        }

        /*
         * 4. Razorpay API se actual payment aur order fetch karo.
         */
        const hotelRazorpay = new Razorpay({
            key_id: paymentHotel.razorpayKeyId,
            key_secret: razorpayKeySecret
        });

        const [razorpayPayment, razorpayOrder] = await Promise.all([
            hotelRazorpay.payments.fetch(razorpayPaymentId),
            hotelRazorpay.orders.fetch(razorpayOrderId)
        ]);

        if (!razorpayPayment) {
            throw CustomError(STATUS_CODE.NOT_FOUND, 'Razorpay payment not found');
        }

        if (!razorpayOrder) {
            throw CustomError(STATUS_CODE.NOT_FOUND, 'Razorpay order not found');
        }

        /*
         * Payment isi order ka hona chahiye.
         */
        if (String(razorpayPayment.order_id) !== String(razorpayOrderId)) {
            throw CustomError(STATUS_CODE.BAD_REQUEST, 'Payment does not belong to this Razorpay order');
        }

        if (String(razorpayPayment.currency || '').toUpperCase() !== 'INR') {
            throw CustomError(STATUS_CODE.BAD_REQUEST, 'Invalid payment currency');
        }

        /*
         * 5. Menu prices frontend par trust nahi karenge.
         *
         * Database se current prices dobara fetch honge.
         */
        const menuIds = menus.map((item) => item.menuId).filter(Boolean);

        if (!menuIds.length) {
            throw CustomError(STATUS_CODE.BAD_REQUEST, 'No valid menu items provided');
        }

        const liveMenuItems = await db.menu.findAll({
            where: {
                id: {
                    [Op.in]: menuIds
                },
                hotelId
            }
        });

        const liveMenuById = liveMenuItems.reduce((result, menuItem) => {
            result[String(menuItem.id)] = menuItem;
            return result;
        }, {});

        const verifiedMenus = menus.map((item) => {
            const liveMenuItem = liveMenuById[String(item.menuId)];

            if (!liveMenuItem) {
                throw CustomError(STATUS_CODE.NOT_FOUND, `${item.menuName || 'Menu item'} not found`);
            }

            if (liveMenuItem.status === 'UNAVAILABLE') {
                throw CustomError(STATUS_CODE.BAD_REQUEST, `${liveMenuItem.name} is unavailable`);
            }

            const quantity = Number(item.quantity);

            if (!Number.isInteger(quantity) || quantity <= 0) {
                throw CustomError(STATUS_CODE.BAD_REQUEST, `Invalid quantity for ${liveMenuItem.name}`);
            }

            return {
                ...item,
                menuId: liveMenuItem.id,
                menuName: liveMenuItem.name,
                price: Number(liveMenuItem.price),
                quantity
            };
        });

        /*
         * 6. Backend par bill dobara calculate karo.
         */
        const subtotal = verifiedMenus.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);

        const discountEnabled = Boolean(paymentHotel.discountEnabled);

        const discountType = paymentHotel.discountType || null;

        const discountValue = Number(paymentHotel.discountValue || 0);

        const discountAmount = calculateDiscount(subtotal, discountEnabled, discountType, discountValue);

        const taxableAmount = Math.max(0, subtotal - discountAmount);

        const gstEnabled = Boolean(paymentHotel.gstEnabled);

        const gstPercent = gstEnabled ? Number(paymentHotel.gstPercent || 0) : 0;

        const safeTipAmount = Number(tipAmount) || 0;

        if (safeTipAmount < 0) {
            throw CustomError(STATUS_CODE.BAD_REQUEST, 'Invalid tip amount');
        }

        const { totalPrice } = calculateBill(taxableAmount, safeTipAmount, gstPercent, gstEnabled);

        const expectedAmountInPaise = Math.round(Number(totalPrice) * 100);

        /*
         * Razorpay order aur payment dono ka amount match hona chahiye.
         */
        if (Number(razorpayOrder.amount) !== expectedAmountInPaise) {
            logger('warn', 'Razorpay order amount mismatch', {
                hotelId,
                customerId,
                razorpayOrderId,
                expectedAmountInPaise,
                razorpayOrderAmount: Number(razorpayOrder.amount)
            });

            throw CustomError(STATUS_CODE.BAD_REQUEST, 'Razorpay order amount does not match the current bill');
        }

        if (Number(razorpayPayment.amount) !== expectedAmountInPaise) {
            logger('warn', 'Razorpay payment amount mismatch', {
                hotelId,
                customerId,
                razorpayPaymentId,
                expectedAmountInPaise,
                razorpayPaymentAmount: Number(razorpayPayment.amount)
            });

            throw CustomError(STATUS_CODE.BAD_REQUEST, 'Payment amount does not match the current bill');
        }

        /*
         * Razorpay can return `authorized` immediately after a successful
         * checkout when automatic capture is disabled or still pending.
         * Capture only after order/payment ownership, currency and amount
         * have all been verified on the server.
         */
        let verifiedRazorpayPayment = razorpayPayment;

        if (verifiedRazorpayPayment.status === 'authorized') {
            verifiedRazorpayPayment = await hotelRazorpay.payments.capture(
                razorpayPaymentId,
                expectedAmountInPaise,
                'INR'
            );
        }

        if (verifiedRazorpayPayment.status !== 'captured') {
            throw CustomError(
                STATUS_CODE.BAD_REQUEST,
                `Payment is not captured. Current status: ${verifiedRazorpayPayment.status}`
            );
        }

        /*
         * 7. Payment verification complete.
         * Verified menu prices ke saath order place karo.
         */
        logger('info', 'Customer payment verified', {
            hotelId,
            customerId,
            razorpayOrderId,
            razorpayPaymentId,
            amountInPaise: expectedAmountInPaise
        });

        const result = await orderService.placeOrder({
            customerId,
            menus: verifiedMenus,
            hotelId,
            tableId,
            tableNumber,
            tipAmount: safeTipAmount,
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
            orderId: createdOrder?.orderId || createdOrder?.id || result?.orderId || result?.id,
            orderNumber: createdOrder?.orderNumber || result?.orderNumber,
            order: createdOrder,
            paymentMode: 'ONLINE',
            createdAt: new Date().toISOString()
        };

        emitToHotel(hotelId, 'new-order', livePayload);

        if (livePayload.orderId) {
            emitToOrder(livePayload.orderId, 'order-status-updated', {
                hotelId,
                orderId: livePayload.orderId,
                orderNumber: livePayload.orderNumber,
                status: createdOrder?.orderStatus || createdOrder?.status || 'PENDING',
                order: createdOrder,
                updatedAt: new Date().toISOString()
            });
        }

        logger('info', 'Paid QR order Socket.IO event emitted', {
            hotelId,
            orderId: livePayload.orderId,
            orderNumber: livePayload.orderNumber
        });

        return res.status(STATUS_CODE.CREATED).json(result);
    } catch (error) {
        logger('error', 'Error creating customer payment order', {
            message: error?.message,
            stack: error?.stack,
            code: error?.code,
            statusCode: error?.statusCode,
            response: error?.response?.data,
            description: error?.description,
            errorObject: error
        });

        return res.status(error.code || STATUS_CODE.INTERNAL_SERVER_ERROR || 500).json({
            message: error.message
        });
    }
};

export default {
    createOrder,
    verifyPayment
};
