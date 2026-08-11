import crypto from 'crypto';
import CryptoJS from 'crypto-js';
import moment from 'moment';
import Razorpay from 'razorpay';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../config/database.js';
import env from '../../config/env.js';
import logger from '../../config/logger.js';
import { ORDER_STATUS } from '../models/order.model.js';
import { PAYMENT_PREFERENCE } from '../models/preferences.model.js';
import { SUBSCRIPTION_STATUS } from '../models/subscriptions.js';
import { USER_ROLES } from '../models/user.model.js';
import customerRepo from '../repositories/customer.repository.js';
import hotelUserRelationRepo from '../repositories/hotelUserRelation.repository.js';
import orderRepo from '../repositories/order.repository.js';
import paymentGatewayEntitiesRepo from '../repositories/paymentGatewayEntities.repository.js';
import preferencesRepo from '../repositories/preferences.repository.js';
import subscriptionRepo from '../repositories/subscription.repository.js';
import notificationService from '../services/notification.service.js';
import {
    CustomError,
    EMAIL_ACTIONS,
    NOTIFICATION_ACTIONS,
    PLANS,
    STATUS_CODE,
    calculateBill
} from '../utils/common.js';
import { createInvoicePdf } from '../utils/pdfGenerator.js';
import { decryptServerSecret } from '../utils/secretEncryption.js';
import { sendEmail } from './email.service.js';
import orderService from './order.service.js';
import razorpayService from './razorpay.service.js';

const business = async (userId, payload) => {
    try {
        const accountDetails = {
            email: payload.email,
            phone: payload.phone,
            // eslint-disable-next-line camelcase
            legal_business_name: payload.legalBusinessName,
            // eslint-disable-next-line camelcase
            business_type: payload.businessType,
            type: 'route',
            // eslint-disable-next-line camelcase
            legal_info: {
                pan: payload.legalInfo.pan,
                gst: payload.legalInfo.gst
            }
        };

        const profile = {};
        profile.category = payload.profile.category ? payload.profile.category : undefined;
        profile.subcategory = payload.profile.subcategory ? payload.profile.subcategory : undefined;
        if (Object.values(profile).find((obj) => obj !== undefined)) {
            accountDetails.profile = { ...profile };
        }

        const addresses = {};
        addresses.street1 = payload.addresses?.registered?.street1 ? payload.addresses?.registered?.street1 : undefined;
        addresses.street2 = payload.addresses?.registered?.street2 ? payload.addresses?.registered?.street2 : undefined;
        addresses.city = payload.addresses?.registered?.city ? payload.addresses?.registered?.city : undefined;
        addresses.state = payload.addresses?.registered?.state ? payload.addresses?.registered?.state : undefined;
        // eslint-disable-next-line camelcase
        addresses.postal_code = payload.addresses?.registered?.postalCode
            ? payload.addresses?.registered?.postalCode
            : undefined;
        addresses.country = payload.addresses?.registered?.country ? payload.addresses?.registered?.country : undefined;
        if (Object.values(addresses).find((obj) => obj !== undefined)) {
            accountDetails.profile.addresses = { registered: { ...addresses } };
        }
        // eslint-enable camelcase

        logger('debug', 'Registering business to razorpay:', accountDetails);
        const account = await razorpayService.createLinkedAccount(accountDetails);

        const options = {
            id: uuidv4(),
            userId,
            accountId: account.id
        };
        const gatewayDetails = await paymentGatewayEntitiesRepo.save(options);
        logger('debug', 'Gateway details stored successfully', gatewayDetails);

        const preference = await preferencesRepo.update({ where: { userId } }, { payment: PAYMENT_PREFERENCE[1] });
        logger('debug', 'payment preference updated for user', { userId, preference });

        return { accountId: account.id };
    } catch (error) {
        logger('error', 'Error while storing business details', { error });
        throw CustomError(error.code, error.message);
    }
};

const stakeholder = async (userId, payload) => {
    try {
        const options = { where: { userId } };
        const paymentGatewayDetails = await paymentGatewayEntitiesRepo.find(options);
        logger('debug', `payment gateway details for user ${userId}`, paymentGatewayDetails);

        const stakeholderDetails = {
            name: payload.name,
            email: payload.email,
            profile: {},
            kyc: {
                pan: payload.kyc.pan
            }
        };

        const addresses = {};
        addresses.street = payload.addresses?.residential?.street ? payload.addresses?.residential?.street : undefined;
        addresses.city = payload.addresses?.residential?.city ? payload.addresses?.residential?.city : undefined;
        addresses.state = payload.addresses?.residential?.state ? payload.addresses?.residential?.state : undefined;
        // eslint-disable-next-line camelcase
        addresses.postal_code = payload.addresses?.residential?.postalCode
            ? payload.addresses?.residential?.postalCode
            : undefined;
        addresses.country = payload.addresses?.residential?.country
            ? payload.addresses?.residential?.country
            : undefined;
        if (Object.values(addresses).find((obj) => obj !== undefined)) {
            stakeholderDetails.profile.addresses = { residential: { ...addresses } };
        }

        logger('debug', 'Registering stakeholder to razorpay:', stakeholderDetails);
        const stakeholder = await razorpayService.createStakeholder(
            paymentGatewayDetails.accountId,
            stakeholderDetails
        );

        const gatewayDetails = await paymentGatewayEntitiesRepo.update(
            { where: { userId } },
            { stakeholderId: stakeholder.id }
        );
        logger('debug', 'Gateway details updated successfully', gatewayDetails);

        const preference = await preferencesRepo.update({ where: { userId } }, { payment: PAYMENT_PREFERENCE[2] });
        logger('debug', 'payment preference updated for user', { userId, preference });

        return { stakeholderId: stakeholder.id };
    } catch (error) {
        logger('error', 'Error while storing stakeholder details', { error });
        throw CustomError(error.code, error.message);
    }
};

const account = async (userId, input) => {
    try {
        const options = { where: { userId } };
        const paymentGatewayDetails = await paymentGatewayEntitiesRepo.find(options);
        logger('debug', `payment gateway details for user ${userId}`, paymentGatewayDetails);

        let bankDetails = input;
        if (input.token) {
            const decrypted = CryptoJS.AES.decrypt(input.token, env.cryptoSecret).toString(CryptoJS.enc.Utf8);
            bankDetails = JSON.parse(decrypted);
        }

        const requestProductPayload = {
            // eslint-disable-next-line camelcase
            product_name: 'route',
            // eslint-disable-next-line camelcase
            tnc_accepted: true
        };

        const product = await razorpayService.requestProduct(paymentGatewayDetails.accountId, requestProductPayload);
        logger('debug', 'Product details requested', product);

        const updateProductPayload = {
            settlements: {
                // eslint-disable-next-line camelcase
                account_number: bankDetails.accountNumber,
                // eslint-disable-next-line camelcase
                ifsc_code: bankDetails.ifscCode,
                // eslint-disable-next-line camelcase
                beneficiary_name: bankDetails.beneficiaryName
            },
            // eslint-disable-next-line camelcase
            tnc_accepted: true
        };
        logger('debug', 'Payload to update product', updateProductPayload);
        await razorpayService.updateProduct(paymentGatewayDetails.accountId, product.id, updateProductPayload);

        const gatewayDetails = await paymentGatewayEntitiesRepo.update(
            { where: { userId } },
            { productId: product.id }
        );
        logger('debug', 'Gateway details updated successfully', gatewayDetails);

        const preference = await preferencesRepo.update({ where: { userId } }, { payment: PAYMENT_PREFERENCE[3] });
        logger('debug', 'payment preference updated for user', { userId, preference });

        return { productId: product.id };
    } catch (error) {
        logger('error', 'Error while storing bank details', { error });
        throw CustomError(error.code, error.message);
    }
};

const getPlanId = (planId) => {
    switch (planId) {
        case PLANS.STANDARD_MONTHLY:
            return {
                planId: env.plans.standaranMonthly,
                tables: 100
            };
        case PLANS.STANDARD_YEARLY:
            return {
                planId: env.plans.standardYearly,
                tables: 100
            };
        default:
            throw CustomError(STATUS_CODE.BAD_REQUEST, 'Invalid Plan id');
    }
};

const subscribe = async (payload) => {
    try {
        if (payload.plan === PLANS.CUSTOM) {
            const hotelOptions = {
                where: {
                    hotelId: payload.hotelId
                },
                attributes: ['userId', 'hotelId'],
                include: [
                    {
                        model: db.users,
                        where: { role: USER_ROLES[0] },
                        attributes: ['firstName', 'lastName', 'email', 'phoneNumber']
                    },
                    {
                        model: db.hotel,
                        attributes: ['name']
                    }
                ]
            };

            const { rows } = await hotelUserRelationRepo.find(hotelOptions);
            if (!rows.length) {
                throw CustomError(STATUS_CODE.NOT_FOUND, 'Cafe owner details not found');
            }
            const { user, hotel } = rows[0];
            const emailData = {
                name: `${user.firstName} ${user.lastName}`,
                phoneNumber: `${user.phoneNumber}`,
                hotelName: `${hotel.name}`,
                email: `${user.email}`
            };
            logger('debug', 'payload to send email to support', emailData);
            await sendEmail(emailData, env.supportEmail, EMAIL_ACTIONS.CUSTOM_SUBSCRIPTION);
            return {
                message:
                    'Thank you for contacting us! We have received your request for a custom plan. Our team will assist you shortly.'
            };
        }

        const { planId, tables } = getPlanId(payload.plan);
        const hotelSubscription = await subscriptionRepo.findOne({
            where: { hotelId: payload.hotelId }
        });

        // eslint-disable-next-line camelcase
        const data = { plan_id: planId, total_count: 1 };
        logger('debug', `Request to create subscription data`, data);
        const subscription = await razorpayService.subscribe(data);

        if (!hotelSubscription) {
            const options = {
                id: uuidv4(),
                hotelId: payload.hotelId,
                subscriptionId: subscription.id,
                planId: subscription.plan_id,
                planName: payload.plan,
                tables
            };
            logger('debug', `Options to store in table`, options);
            await subscriptionRepo.save(options);
        } else {
            const options = { where: { hotelId: payload.hotelId } };
            const data = {
                subscriptionId: subscription.id,
                planId: subscription.plan_id,
                planName: payload.plan,
                tables
            };
            logger('debug', `Existing subscription updated`, { options, data });
            await subscriptionRepo.update(options, data);
        }

        return { id: subscription.id };
    } catch (error) {
        logger('error', 'Error while creating subscription', { error });
        throw CustomError(error.code, error.message);
    }
};

const success = async (userId, payload) => {
    try {
        const subscription = await razorpayService.fetch(payload.subscriptionId);
        logger('debug', `Subscription details`, subscription);

        const options = { where: { subscriptionId: payload.subscriptionId } };
        const data = {
            customerId: subscription.customer_id,
            paymentId: payload.paymentId,
            status: SUBSCRIPTION_STATUS[0],
            startDate: moment(subscription.current_start * 1000).toISOString(),
            endDate: moment(subscription.current_end * 1000).toISOString()
        };
        logger('debug', `Update subscription on success`, { options, data });
        await subscriptionRepo.update(options, data);

        await notificationService.sendNotification([userId], {
            title: 'Subscription Done',
            message: `You have successfully subscribed to plan - ${subscription.plan_id}`
        });
        return { message: 'Success' };
    } catch (error) {
        logger('error', 'Error in subscription success', { error });
        throw CustomError(error.code, error.message);
    }
};

const getSettlementTotal = (orders) => {
    const storedFinalAmount = orders.reduce((total, order) => total + Number(order.finalAmount || 0), 0);
    if (storedFinalAmount > 0) return Number(storedFinalAmount.toFixed(2));

    const price = orders.reduce((total, order) => total + Number(order.price || 0), 0);
    return calculateBill(price).totalPrice;
};

const getHotelPaymentGateway = async (hotelId, { requireEnabled = true } = {}) => {
    const hotel = await db.hotel.findOne({
        where: { id: hotelId },
        attributes: ['id', 'paymentEnabled', 'razorpayKeyId', 'razorpayKeySecret']
    });
    if (!hotel) throw CustomError(STATUS_CODE.NOT_FOUND, 'Hotel not found');
    if (requireEnabled && !hotel.paymentEnabled) {
        throw CustomError(STATUS_CODE.BAD_REQUEST, 'Online payment is disabled for this hotel');
    }

    const keySecret = decryptServerSecret(hotel.razorpayKeySecret);
    if (!hotel.razorpayKeyId || !keySecret) {
        throw CustomError(STATUS_CODE.BAD_REQUEST, 'Hotel Razorpay settings are incomplete');
    }

    return {
        keyId: hotel.razorpayKeyId,
        keySecret,
        // Razorpay SDK requires snake_case credential keys.
        // eslint-disable-next-line camelcase
        client: new Razorpay({ key_id: hotel.razorpayKeyId, key_secret: keySecret })
    };
};

const payment = async ({ customerId, hotelId, manual }) => {
    try {
        const options = {
            where: {
                customerId,
                status: ORDER_STATUS[1],
                paymentStatus: { [Op.ne]: 'PAID' }
            }
        };
        const { rows: orders } = await orderRepo.find(options);
        const { rows } = await customerRepo.find({
            where: { id: customerId, hotelId },
            include: [{ model: db.tables }]
        });
        const customer = rows[0];
        if (!customer) throw CustomError(STATUS_CODE.NOT_FOUND, 'Customer not found');
        const orderTableId = orders.find((order) => order.tableId)?.tableId || customer.table?.id;
        const activeTable = orderTableId
            ? await db.tables.findOne({
                where: {
                    id: orderTableId,
                    hotelId
                }
            })
            : null;
        if (!activeTable) throw CustomError(STATUS_CODE.NOT_FOUND, 'Order table not found');
        if (!orders.length) throw CustomError(STATUS_CODE.BAD_REQUEST, 'No served orders are awaiting payment');
        logger('debug', 'Customer details', customer);

        const totalPrice = getSettlementTotal(orders);
        logger('info', `total price for ${customerId} - ${totalPrice}`);
        if (manual) {
            try {
                const userIds = await orderService.getNotificationUserIds(hotelId);
                await notificationService.sendNotification(userIds, {
                    title: 'Payment Request',
                    message: `Payment request for Table-${activeTable.tableNumber} of amount ${totalPrice}. Please approve once the payment is done.`,
                    path: '/orders',
                    meta: {
                        action: NOTIFICATION_ACTIONS.PAYMENT_REQUEST,
                        tableId: activeTable.id,
                        customerId,
                        tableNumber: activeTable.tableNumber,
                        totalPrice
                    }
                });
            } catch (notificationError) {
                logger('warn', 'Manual payment request saved, but notification delivery failed', { notificationError });
            }
            return { message: 'Success' };
        } else {
            const gateway = await getHotelPaymentGateway(hotelId);
            const order = await db.orders.sequelize.transaction(async (transaction) => {
                const { rows: lockedOrders } = await orderRepo.find({
                    ...options,
                    transaction,
                    lock: transaction.LOCK.UPDATE
                });
                if (!lockedOrders.length) {
                    throw CustomError(STATUS_CODE.BAD_REQUEST, 'No served orders are awaiting payment');
                }

                const lockedTotal = getSettlementTotal(lockedOrders);
                const expectedAmount = Math.round(lockedTotal * 100);
                const existingOrderId = lockedOrders.find((item) => item.razorpayOrderId)?.razorpayOrderId;
                if (existingOrderId) {
                    const existingOrder = await gateway.client.orders.fetch(existingOrderId);
                    const notes = existingOrder.notes || {};
                    if (
                        Number(existingOrder.amount) === expectedAmount &&
                        String(existingOrder.currency || '').toUpperCase() === 'INR' &&
                        String(notes.customerId || '') === String(customerId) &&
                        String(notes.hotelId || '') === String(hotelId) &&
                        String(notes.type || '') === 'ORDER_SETTLEMENT'
                    ) {
                        if (String(existingOrder.status || '').toLowerCase() === 'paid') {
                            throw CustomError(STATUS_CODE.CONFLICT, 'Payment is already processing');
                        }
                        return existingOrder;
                    }
                }

                const payload = {
                    amount: expectedAmount,
                    currency: 'INR',
                    receipt: `settle_${String(customerId).replace(/-/g, '').slice(0, 16)}_${Date.now()}`,
                    notes: { customerId, hotelId, type: 'ORDER_SETTLEMENT' }
                };
                const createdOrder = await gateway.client.orders.create(payload);
                await db.orders.update(
                    { razorpayOrderId: createdOrder.id },
                    {
                        where: { id: { [Op.in]: lockedOrders.map((item) => item.id) } },
                        transaction
                    }
                );
                return createdOrder;
            });
            return {
                email: customer.email,
                name: customer.name,
                phoneNumber: customer.phoneNumber,
                orderId: order.id,
                amount: Number(order.amount),
                key: gateway.keyId,
                isSettlementPayment: true
            };
        }
    } catch (error) {
        logger('error', 'Error while order payment ', { error });
        throw CustomError(error.code, error.message);
    }
};

const verifyPaymentConfirmation = async (payload) => {
    const { customerId, hotelId, orderId, paymentId, razorpaySignature } = payload;
    const gateway = await getHotelPaymentGateway(hotelId, { requireEnabled: false });

    const generatedSignature = crypto
        .createHmac('sha256', gateway.keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');
    const generatedBuffer = Buffer.from(generatedSignature, 'utf8');
    const receivedBuffer = Buffer.from(String(razorpaySignature), 'utf8');
    if (
        generatedBuffer.length !== receivedBuffer.length ||
        !crypto.timingSafeEqual(generatedBuffer, receivedBuffer)
    ) {
        throw CustomError(STATUS_CODE.FORBIDDEN, 'Invalid payment signature');
    }

    const existingPayment = await db.orders.findOne({
        where: { razorpayPaymentId: paymentId },
        attributes: ['id', 'customerId', 'hotelId', 'razorpayOrderId', 'status', 'paymentStatus']
    });
    if (existingPayment) {
        const sameCompletedPayment =
            String(existingPayment.customerId) === String(customerId) &&
            String(existingPayment.hotelId) === String(hotelId) &&
            String(existingPayment.razorpayOrderId) === String(orderId) &&
            existingPayment.status === ORDER_STATUS[3] &&
            existingPayment.paymentStatus === 'PAID';
        if (sameCompletedPayment) return { message: 'Success', duplicate: true };
        throw CustomError(STATUS_CODE.CONFLICT, 'This payment has already been used');
    }

    const [{ rows: orders }, razorpayOrder, razorpayPayment] = await Promise.all([
        orderRepo.find({
            where: {
                customerId,
                hotelId,
                status: ORDER_STATUS[1],
                paymentStatus: { [Op.ne]: 'PAID' },
                razorpayOrderId: orderId
            }
        }),
        gateway.client.orders.fetch(orderId),
        gateway.client.payments.fetch(paymentId)
    ]);
    if (!orders.length) throw CustomError(STATUS_CODE.BAD_REQUEST, 'No served orders are awaiting payment');

    const totalPrice = getSettlementTotal(orders);
    const expectedAmount = Math.round(totalPrice * 100);
    const notes = razorpayOrder.notes || {};
    if (
        String(razorpayPayment.order_id || '') !== String(orderId) ||
        String(razorpayOrder.currency || '').toUpperCase() !== 'INR' ||
        String(razorpayPayment.currency || '').toUpperCase() !== 'INR' ||
        Number(razorpayOrder.amount) !== expectedAmount ||
        Number(razorpayPayment.amount) !== expectedAmount ||
        String(notes.customerId || '') !== String(customerId) ||
        String(notes.hotelId || '') !== String(hotelId) ||
        String(notes.type || '') !== 'ORDER_SETTLEMENT'
    ) {
        throw CustomError(STATUS_CODE.FORBIDDEN, 'Payment does not match this order settlement');
    }

    let verifiedPayment = razorpayPayment;
    if (String(razorpayPayment.status).toLowerCase() === 'authorized') {
        verifiedPayment = await gateway.client.payments.capture(paymentId, expectedAmount, 'INR');
    }
    if (String(verifiedPayment.status).toLowerCase() !== 'captured' && verifiedPayment.captured !== true) {
        throw CustomError(STATUS_CODE.BAD_REQUEST, 'Payment is not captured');
    }

    return paymentConfirmation({
        customerId,
        hotelId,
        manual: false,
        orderId,
        paymentId
    });
};

const paymentConfirmation = async (payload) => {
    try {
        const { customerId } = payload;

        let { rows: customerDetails } = await customerRepo.find({
            where: { id: customerId },
            attributes: ['id', 'name', 'email'],
            include: [
                {
                    model: db.hotel,
                    attributes: ['id', 'name', 'careNumber']
                },
                {
                    model: db.orders,
                    attributes: [
                        'id',
                        'status',
                        'quantity',
                        'price',
                        'discountType',
                        'discountValue',
                        'discountAmount',
                        'cgstAmount',
                        'sgstAmount',
                        'tipAmount',
                        'finalAmount',
                        'paymentStatus',
                        'razorpayOrderId',
                        'tableId'
                    ],
                    include: [
                        {
                            model: db.menu,
                            attributes: ['name']
                        }
                    ]
                },
                {
                    model: db.tables,
                    attributes: ['tableNumber']
                }
            ]
        });
        customerDetails = customerDetails[0];

        if (!customerDetails) {
            throw CustomError(STATUS_CODE.NOT_FOUND, 'Customer not found');
        }
        if (payload.hotelId && String(customerDetails.hotel?.id) !== String(payload.hotelId)) {
            throw CustomError(STATUS_CODE.FORBIDDEN, 'Access denied to this cafe');
        }

        const payableOrders = customerDetails.orders.filter(
            (order) =>
                order.status === ORDER_STATUS[1] &&
                order.paymentStatus !== 'PAID' &&
                (payload.manual || String(order.razorpayOrderId || '') === String(payload.orderId || ''))
        );
        if (!payableOrders.length) {
            throw CustomError(STATUS_CODE.BAD_REQUEST, 'No served orders are awaiting payment');
        }

        const settlementTableId = payableOrders.find((order) => order.tableId)?.tableId;
        const settlementTable =
            customerDetails.table ||
            (settlementTableId
                ? await db.tables.findOne({
                    where: { id: settlementTableId, hotelId: customerDetails.hotel.id },
                    attributes: ['id', 'tableNumber']
                })
                : null);
        const settlementTableNumber = settlementTable?.tableNumber || '-';

        const transaction = await db.orders.sequelize.transaction();
        try {
            const payableIds = payableOrders.map((order) => order.id);
            const [paidCount] = await orderRepo.update(
                {
                    where: {
                        id: { [Op.in]: payableIds },
                        customerId,
                        status: ORDER_STATUS[1],
                        paymentStatus: { [Op.ne]: 'PAID' }
                    },
                    transaction
                },
                {
                    status: ORDER_STATUS[3],
                    paymentStatus: 'PAID',
                    paymentMethod: payload.manual ? 'CASH' : 'UPI'
                }
            );
            if (!paidCount) {
                throw CustomError(STATUS_CODE.CONFLICT, 'Payment was already confirmed');
            }

            if (!payload.manual) {
                await db.orders.update(
                    { razorpayPaymentId: payload.paymentId },
                    { where: { id: payableOrders[0].id }, transaction }
                );
            }

            // Prepaid served batches do not belong in this settlement amount,
            // but they can be closed with the same table checkout.
            await orderRepo.update(
                {
                    where: { customerId, status: ORDER_STATUS[1], paymentStatus: 'PAID' },
                    transaction
                },
                { status: ORDER_STATUS[3] }
            );

            await transaction.commit();
        } catch (transactionError) {
            await transaction.rollback();
            throw transactionError;
        }

        const invoicePdfData = [['Item', 'Quantity', 'Price']];
        payableOrders.forEach((order) => {
            invoicePdfData.push([order.menu.name, String(order.quantity), String(order.price)]);
        });

        const firstOrder = payableOrders[0] || {};
        const discountType = firstOrder.discountType || '';
        const discountValue = Number(firstOrder.discountValue || 0);
        const discountAmount = payableOrders.reduce(
            (total, order) => total + Number(order.discountAmount || 0),
            0
        );

        if (discountAmount > 0) {
            const discountLabel = discountType === 'PERCENT' ? `Discount (${discountValue}%)` : 'Discount';
            invoicePdfData.push(['', discountLabel, `-${discountAmount}`]);
        }

        const totalPrice = getSettlementTotal(payableOrders);
        const sgst = payableOrders.reduce((total, order) => total + Number(order.sgstAmount || 0), 0);
        const cgst = payableOrders.reduce((total, order) => total + Number(order.cgstAmount || 0), 0);
        const tip = payableOrders.reduce((total, order) => total + Number(order.tipAmount || 0), 0);
        [
            { label: 'Tip', value: tip },
            { label: 'SGST', value: sgst },
            { label: 'CGST', value: cgst },
            { label: 'Total', value: totalPrice }
        ].forEach((obj) => {
            invoicePdfData.push(['', obj.label, String(obj.value)]);
        });

        try {
            if (payload.manual) {
                await notificationService.sendNotification(
                    undefined,
                    {
                        title: 'Payment Confirmed',
                        message: `Payment successfully confirmed`,
                        meta: {
                            action: NOTIFICATION_ACTIONS.MANUAL_PAYMENT_CONFIRMED,
                            tableNumber: settlementTableNumber
                        }
                    },
                    customerId
                );
            } else {
                const userIds = await orderService.getNotificationUserIds(customerDetails.hotel.id);
                await notificationService.sendNotification(userIds, {
                    title: 'Payment Received',
                    message: `Payment received for Table ${settlementTableNumber}: ₹${totalPrice}`,
                    meta: {
                        tableNumber: settlementTableNumber,
                        action: NOTIFICATION_ACTIONS.ONLINE_PAYMENT_CONFIRMED,
                        hotelId: customerDetails.hotel.id
                    }
                });
            }
        } catch (notificationError) {
            logger('warn', 'Payment completed, but confirmation notification failed', { notificationError });
        }

        // send mail to customer
        try {
            const invoiceReference = payload.orderId || `manual-${customerId}-${Date.now()}`;
            const pdfData = await createInvoicePdf({
                title: customerDetails.hotel.name,
                hotelId: customerDetails.hotel.id,
                invoiceNumber: invoiceReference,
                orderId: invoiceReference,
                date: moment().format('DD-MMM-YYYY HH:mm:ss'),
                tableNumber: String(settlementTableNumber),
                totalAmount: String(totalPrice),
                discountType,
                discountValue,
                discountAmount,
                tableData: invoicePdfData,
                paymentMode: payload.manual ? 'MANUAL' : 'ONLINE',
                razorpayPaymentId: payload.paymentId || (payload.manual ? 'manual' : '-')
            });

            const emailOptions = {
                hotelName: customerDetails.hotel.name,
                customerName: customerDetails.name,
                hotelContact: customerDetails.hotel.careNumber
            };
            await sendEmail(emailOptions, customerDetails.email, EMAIL_ACTIONS.INVOICE_EMAIL, [
                {
                    filename: `invoice-${invoiceReference}.pdf`,
                    content: pdfData,
                    encoding: 'base64'
                }
            ]);
        } catch (emailError) {
            logger('error', 'Error sending invoice email:', { emailError });
        }

        return { message: 'Success' };
    } catch (error) {
        logger('error', 'Error while order payment confirmation', { error });
        throw CustomError(error.code, error.message);
    }
};

const calculateRefundAmount = (subscription, plan) => {
    try {
        const amount = plan.item.amount / 100;
        const totalDays = moment(subscription.endDate, 'YYYY-MM-DD hh:mm:ss')
            .startOf('day')
            .diff(moment(subscription.startDate, 'YYYY-MM-DD hh:mm:ss').startOf('day'), 'days');
        const remainingDays = moment(subscription.endDate, 'YYYY-MM-DD hh:mm:ss').startOf('day').diff(moment(), 'days');
        if (!Number.isFinite(amount) || totalDays <= 0 || remainingDays <= 0) return 0;
        return Math.max(0, Math.min(Math.round(amount), Math.round(remainingDays * (amount / totalDays))));
    } catch (error) {
        logger('error', 'Error while calculate refund amount', { error });
        throw CustomError(error.code, error.message);
    }
};

const cancel = async (ownerId, payload) => {
    try {
        const { subscriptionId, cancelImmediately } = payload;
        logger('debug', `Payload for cancel subscription`, payload);

        const subscriptionOptions = {
            where: { subscriptionId },
            attributes: ['id', 'subscriptionId', 'planId', 'paymentId', 'startDate', 'endDate']
        };
        const subscription = await subscriptionRepo.findOne(subscriptionOptions);
        logger('debug', `Subscription details`, { subscription });

        if (!subscription) {
            throw CustomError(STATUS_CODE.NOT_FOUND, 'Subscription not found');
        }
        const ownership = await hotelUserRelationRepo.find({
            where: { userId: ownerId, hotelId: subscription.hotelId },
            limit: 1
        });
        if (!ownership.count) {
            throw CustomError(STATUS_CODE.FORBIDDEN, 'Access denied to this subscription');
        }

        await razorpayService.cancel(subscriptionId, !cancelImmediately);
        logger('debug', `Subscription cancelled successfully`);

        if (cancelImmediately) {
            const plan = await razorpayService.getPlan(subscription.planId);
            logger('debug', `Plan details on cancel subscription`, { plan });

            if (!plan) {
                throw CustomError(STATUS_CODE.NOT_FOUND, 'Invalid Plan');
            }

            const refundAmount = calculateRefundAmount(subscription, plan);
            logger('debug', `Refund amount`, { refundAmount });
            if (refundAmount > 0 && subscription.paymentId) {
                await razorpayService.refund(subscription.paymentId, refundAmount * 100);
            }

            const options = { where: { id: subscription.id } };
            const data = {
                endDate: moment().endOf('day').toISOString(),
                status: SUBSCRIPTION_STATUS[1]
            };

            logger('debug', `Update subscription on cancel subscription`, { options, data });
            await subscriptionRepo.update(options, data);
        }

        return {
            message: cancelImmediately
                ? 'Subscription canceled immediately and refund processed.'
                : 'Subscription canceled at the end of the period.'
        };
    } catch (error) {
        logger('error', 'Error while canceling subscription', { error });
        throw CustomError(error.code, error.message);
    }
};

export default {
    business,
    stakeholder,
    account,
    subscribe,
    success,
    payment,
    verifyPaymentConfirmation,
    paymentConfirmation,
    cancel
};
