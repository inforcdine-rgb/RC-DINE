import { createSlice } from '@reduxjs/toolkit';
import { ORDER_STATUS } from '../../utils/constants';
import { ORDER_PLACEMENT } from '../types';

const orderPlacementSlice = createSlice({
    name: ORDER_PLACEMENT,
    reducers: {
        setCurrentPage(state, action) {
            state.currentPage = action.payload;
        },
        getTableDetailsRequest() {},
        getTableDetailsSuccess(state, action) {
            const nextTableDetails = action.payload || {};
            const isSameTable =
                state.tableDetails?.id && String(state.tableDetails.id) === String(nextTableDetails?.id || '');
            const currentCustomer = isSameTable ? state.tableDetails.customer : null;

            state.tableDetails = {
                ...nextTableDetails,
                customer: nextTableDetails.customer || currentCustomer || null
            };
        },
        setTableCustomer(state, action) {
            const { tableId, customer } = action.payload || {};
            if (!tableId || !customer?.id || String(state.tableDetails?.id || '') !== String(tableId)) return;

            state.tableDetails.customer = customer;
        },
        registerCustomerRequest() {},
        getMenuDetailsRequest() {},
        getMenuDetailsSuccess(state, action) {
            state.menuCard = action.payload;
        },
        setOrderDetails(state, action) {
            state.orderDetails = action.payload;
        },
        placeOrderRequest() {},
        getCustomerOrderDetailsRequest() {},
        customerPrePaymentRequest() {},
        verifyCustomerPaymentRequest() {},
        setViewOrderDetails(state, action) {
            const { count, rows } = action.payload;
            const firstBillRow = rows?.find((obj) => Number(obj.finalAmount || 0) > 0) || rows?.[0] || {};
            const hasPendingOrder = rows?.some((obj) => obj.status === ORDER_STATUS[0]);
            const hasOutstandingPayment = rows?.some(
                (obj) => obj.status !== 'CANCELLED' && obj.paymentStatus !== 'PAID'
            );
            const subtotal =
                rows?.reduce((cur, next) => {
                    cur += Number(next.price || 0);
                    return cur;
                }, 0) || 0;
            state.viewOrderDetails = {
                count,
                title: 'View Order',
                data: rows,
                submitText: hasPendingOrder ? 'Update' : hasOutstandingPayment ? 'Pay' : undefined,
                closeText: !hasPendingOrder && hasOutstandingPayment ? 'Pay Manually' : 'Close',
                updated: {},
                totalPrice: subtotal,
                finalAmount: Number(firstBillRow.finalAmount || 0),
                sgstAmount: Number(firstBillRow.sgstAmount || 0),
                cgstAmount: Number(firstBillRow.cgstAmount || 0),
                tipAmount: Number(firstBillRow.tipAmount || 0),
                discountType: firstBillRow.discountType || '',
                discountValue: Number(firstBillRow.discountValue || 0),
                discountAmount: Number(firstBillRow.discountAmount || 0)
            };
        },
        setUpdatedOrderDetails(state, action) {
            state.viewOrderDetails.updated = action.payload;
        },
        payOrderRequest() {},
        setOrderPaymentData(state, action) {
            state.orderPaymentData = action.payload;
        },
        customerPaymentConfirmationRequest() {},
        setFeedback(state, action) {
            state.feedback = action.payload;
        },
        sendFeedbackRequest() {},
        setFeedbackDetails(state, action) {
            state.feedbackDetails = action.payload;
        },
        setInvoicePrompt(state, action) {
            state.invoicePrompt = action.payload;
        },
        setTrackingOrder(state, action) {
            state.trackingOrder = action.payload;
        }
    },
    initialState: {
        currentPage: 0,
        tableDetails: {},
        menuCard: {},
        orderDetails: {},
        viewOrderDetails: {},
        orderPaymentData: false,
        feedback: false,
        feedbackDetails: {},
        invoicePrompt: false,
        trackingOrder: null
    }
});
export const {
    setCurrentPage,
    getTableDetailsRequest,
    getTableDetailsSuccess,
    setTableCustomer,
    registerCustomerRequest,
    getMenuDetailsRequest,
    getMenuDetailsSuccess,
    setOrderDetails,
    placeOrderRequest,
    setViewOrderDetails,
    getCustomerOrderDetailsRequest,
    setUpdatedOrderDetails,
    payOrderRequest,
    setOrderPaymentData,
    customerPaymentConfirmationRequest,
    setFeedback,
    sendFeedbackRequest,
    setFeedbackDetails,
    setInvoicePrompt,
    customerPrePaymentRequest,
    verifyCustomerPaymentRequest,
    setTrackingOrder
} = orderPlacementSlice.actions;

export const orderPlacementReducer = orderPlacementSlice.reducer;
