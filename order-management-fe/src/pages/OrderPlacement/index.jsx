import React, { useEffect, useRef, useState } from 'react';
import CryptoJS from 'crypto-js';
import { Card, FormControl } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import MenuBackgroundImg from '../../assets/images/menu-background.png';
import Loader from '../../components/Loader';
import MenuCard from '../../components/MenuCard';
import OMTModal from '../../components/Modal';
import Rating from '../../components/Rating';
import Razorpay, { ACTIONS } from '../../components/Razporpay';
import env from '../../config/env';
import {
    getMenuDetailsRequest,
    getCustomerOrderDetailsRequest,
    getTableDetailsRequest,
    payOrderRequest,
    placeOrderRequest,
    registerCustomerRequest,
    sendFeedbackRequest,
    setCurrentPage,
    setFeedback,
    setFeedbackDetails,
    setInvoicePrompt,
    setOrderDetails,
    setUpdatedOrderDetails,
    setViewOrderDetails,
    customerPaymentConfirmationRequest,
    customerPrePaymentRequest,
    verifyCustomerPaymentRequest
} from '../../store/slice';
import { NOTIFICATION_ACTIONS, ORDER_STATUS, PAYMENT_PREFERENCE, TABLE_STATUS } from '../../utils/constants';
import {
    getBackgroundRequestVersion,
    registerRefreshHandler,
    waitForBackgroundRequests
} from '../../utils/refreshBus';

function OrderPlacement() {
    const { token } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {
        menuCard,
        currentPage,
        tableDetails,
        orderDetails,
        viewOrderDetails,
        orderPaymentData,
        feedback,
        feedbackDetails,
        invoicePrompt
    } = useSelector((state) => state.orderPlacement);
    const updateRefs = useRef({});
    const refreshSnapshotRef = useRef('');
    const [tipAmount, setTipAmount] = useState(0);
    const gstEnabled = Boolean(tableDetails?.hotel?.gstEnabled);
    refreshSnapshotRef.current = JSON.stringify({
        table: tableDetails?.status,
        menu: menuCard?.data,
        order: orderDetails,
        tracking: viewOrderDetails?.data
    });

    useEffect(() => registerRefreshHandler('customer-ordering', async () => {
        const before = refreshSnapshotRef.current;
        const checkpoint = getBackgroundRequestVersion();
        if (tableDetails?.id) dispatch(getTableDetailsRequest(tableDetails.id));
        if (tableDetails?.hotel?.id && tableDetails?.customer?.id) {
            dispatch(getMenuDetailsRequest({
                hotelId: tableDetails.hotel.id,
                customerId: tableDetails.customer.id
            }));
            dispatch(getCustomerOrderDetailsRequest(tableDetails.customer.id));
        }
        await waitForBackgroundRequests({ checkpoint });
        return before !== refreshSnapshotRef.current;
    }), [dispatch, tableDetails?.customer?.id, tableDetails?.hotel?.id, tableDetails?.id]);
    const gstPercent = gstEnabled ? Number(tableDetails?.hotel?.gstPercent || 0) : 0;
    const getGstSummary = (amount = 0) => {
        const subtotal = Number(amount) || 0;
        const storedDiscountAmount = Number(viewOrderDetails?.discountAmount || 0);
        const discountType = viewOrderDetails?.discountType || tableDetails?.hotel?.discountType || '';
        const discountValue = Number(viewOrderDetails?.discountValue || tableDetails?.hotel?.discountValue || 0);
        let discountAmount = storedDiscountAmount;

        if (!discountAmount && tableDetails?.hotel?.discountEnabled && discountValue > 0) {
            if (discountType === 'PERCENT') {
                discountAmount = Math.round(subtotal * (Math.min(100, Math.max(0, discountValue)) / 100));
            } else if (discountType === 'FLAT') {
                discountAmount = Math.min(subtotal, Math.round(Math.max(0, discountValue)));
            }
        }

        const taxableAmount = Math.max(0, subtotal - discountAmount);
        const totalGst = Math.round(taxableAmount * (gstPercent / 100));
        const sgst = Number(viewOrderDetails?.sgstAmount || 0) || Math.round(totalGst / 2);
        const cgst = Number(viewOrderDetails?.cgstAmount || 0) || totalGst - sgst;
        const finalAmount = Number(viewOrderDetails?.finalAmount || 0) || taxableAmount + sgst + cgst + Number(viewOrderDetails?.tipAmount || 0);

        return {
            discountType,
            discountValue,
            discountAmount,
            sgst,
            cgst,
            total: finalAmount
        };
    };

    useEffect(() => {
        if (token) {
            localStorage.setItem('customerToken', token);
            const decryptedText = CryptoJS.AES.decrypt(token, env.cryptoSecret).toString(CryptoJS.enc.Utf8);

            if (decryptedText && decryptedText.trim().length > 0) {
                try {
                    const data = JSON.parse(decryptedText);
                    dispatch(getTableDetailsRequest(data.tableId));
                } catch (error) {
                    dispatch(getTableDetailsRequest(token));
                }
            } else {
                dispatch(getTableDetailsRequest(token));
            }
        }
    }, [token]);

    useEffect(() => {
        if (tableDetails.customer) {
            dispatch(
                getMenuDetailsRequest({
                    hotelId: tableDetails.hotel.id,
                    customerId: tableDetails.customer.id
                })
            );
        }
    }, [tableDetails.customer?.id]);

    useEffect(() => {
        if (tableDetails.status === TABLE_STATUS[0] && tableDetails.hotel?.id) {
            const payload = {
                name: 'Guest',
                phoneNumber: 9999999999,
                email: 'guest@example.com',
                hotelId: tableDetails.hotel.id,
                tableId: tableDetails.id,
                tableNumber: tableDetails.tableNumber
            };
            dispatch(registerCustomerRequest(payload));
        }
    }, [tableDetails.status, tableDetails.id, tableDetails.hotel?.id, dispatch]);

    useEffect(() => {
        if (updateRefs && updateRefs.current[viewOrderDetails?.updated?.last]) {
            updateRefs.current[viewOrderDetails.updated.last].focus();
        }
    });

    useEffect(() => {
        const handleServiceWorkerMessage = (event) => {
            const payload = event.detail || event.data?.payload || event.data || {};
            const { meta } = payload;
            if (meta?.action === NOTIFICATION_ACTIONS.ORDER_SERVED) {
                if (tableDetails && tableDetails.hotel && tableDetails.customer) {
                    dispatch(
                        getMenuDetailsRequest({
                            hotelId: tableDetails.hotel.id,
                            customerId: tableDetails.customer.id
                        })
                    );
                } else {
                    console.warn('tableDetails or its properties are missing.');
                }
            }

            if (meta?.action === NOTIFICATION_ACTIONS.MANUAL_PAYMENT_CONFIRMED) {
                if (meta.tableNumber === tableDetails.tableNumber) {
                    toast.info(
                        '🥂 Payment confirmed, thank you for choosing us! 🌟 Your feedback means the world to us.'
                    );
                    dispatch(setViewOrderDetails({}));
                    dispatch(setFeedback(true));
                }
            }
        };
        window.addEventListener('rcdine:notification', handleServiceWorkerMessage);
        return () => {
            window.removeEventListener('rcdine:notification', handleServiceWorkerMessage);
        };
    }, [tableDetails.customer, tableDetails.hotel]);

    const handleOrderSubmit = () => {
        if (viewOrderDetails.submitText === 'Pay') {
            dispatch(
                payOrderRequest({
                    hotelId: tableDetails.hotel.id,
                    customerId: tableDetails.customer.id,
                    manual: false
                })
            );
            return;
        }
        const { last, ...updatedData } = viewOrderDetails.updated;
        const payload = {
            hotelId: tableDetails.hotel.id,
            customerId: tableDetails.customer.id,
            tableId: tableDetails.id,
            tableNumber: tableDetails.tableNumber,
            menus: Object.values(updatedData)
        };
        dispatch(placeOrderRequest(payload));
    };

    const handleOrderClose = (value) => {
        if (value === 'payment') {
            if (viewOrderDetails.closeText === 'Pay Manually') {
                dispatch(
                    payOrderRequest({
                        hotelId: tableDetails.hotel.id,
                        customerId: tableDetails.customer.id,
                        manual: true
                    })
                );
                return;
            }
        }
        dispatch(setViewOrderDetails({}));
    };

    const handleClick = ({ action, id = '' }) => {
        switch (action) {
            case 'next':
                dispatch(setCurrentPage(currentPage + 1));
                break;
            case 'prev':
                dispatch(setCurrentPage(currentPage - 1));
                break;
            case 'category':
                dispatch(setCurrentPage(1));
                break;
            case 'check-in': {
                const pageNo = menuCard?.mapping[id] || 0;
                dispatch(setCurrentPage(pageNo));
                break;
            }
            case 'view':
                dispatch(getCustomerOrderDetailsRequest(tableDetails.customer.id));
                break;
            case 'place': {
                const menus = { ...orderDetails };
                if (!Object.values(menus).length) {
                    toast.warn('Order is empty please add menu items.');
                    break;
                }
                delete menus.lastUpdated;
                dispatch(
                    customerPrePaymentRequest({
                        hotelId: tableDetails.hotel.id,
                        customerId: tableDetails.customer.id,
                        tableId: tableDetails.id,
                        tableNumber: tableDetails.tableNumber,
                        menus: Object.values(menus),
                        tipAmount
                    })
                );
                break;
            }
            default:
                break;
        }
    };

    const handleOnChange = (e, item) => {
        const obj = {
            menuId: item.id,
            menuName: item.name,
            quantity: Number(e.target.value),
            price: item.price,
            description: item.description || '',
            image: item.image || '',
            foodType: item.foodType || 'VEG',
            isBestSeller: Boolean(item.isBestSeller),
            isTodayDeal: Boolean(item.isTodayDeal),
            available: typeof item.available === 'boolean' ? item.available : item.status !== 'UNAVAILABLE'
        };
        dispatch(
            setOrderDetails({
                ...orderDetails,
                lastUpdated: item.id,
                [item.id]: obj
            })
        );
    };

    const handlePaymentSuccess = (payload) => {
        if (orderPaymentData?.isPrePayment) {
            /* eslint-disable camelcase */
            dispatch(
                verifyCustomerPaymentRequest({
                    razorpay_order_id: payload.orderId,
                    razorpay_payment_id: payload.paymentId,
                    razorpay_signature: payload.razorpaySignature,
                    hotelId: tableDetails.hotel.id,
                    customerId: tableDetails.customer.id,
                    tableId: tableDetails.id,
                    tableNumber: tableDetails.tableNumber,
                    menus: orderPaymentData.menus,
                    tipAmount: orderPaymentData.tipAmount || 0,
                    navigate
                })
            );
            /* eslint-enable camelcase */
        } else {
            dispatch(
                customerPaymentConfirmationRequest({
                    manual: false,
                    customerId: tableDetails.customer.id,
                    orderId: payload.orderId,
                    paymentId: payload.paymentId
                })
            );
        }
    };

    const downloadInvoicePdf = () => {
        const base64 = invoicePrompt?.invoicePdfBase64;
        if (!base64) {
            dispatch(setInvoicePrompt(false));
            return;
        }

        const byteCharacters = window.atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const hotelName = tableDetails.hotel?.name || 'hotel';
        const orderNumber = invoicePrompt?.order?.orderNumber || 'order';
        const cleanedHotelName = hotelName.toLowerCase().replace(/\s+/g, '-');
        const cleanedOrderNumber = orderNumber.toLowerCase();
        link.download = `${cleanedHotelName}-${cleanedOrderNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        dispatch(setInvoicePrompt(false));
    };

    const OrderView = ({ item }) => (
        <div className="d-flex align-items-center my-2">
            <p className="m-0 col-8">{item.menu.name}</p>
            <div className="col-2 d-flex justify-content-center">
                {item.status === ORDER_STATUS[0] ? (
                    <input
                        ref={(r) => (updateRefs.current[item.id] = r)}
                        name={item.id}
                        type="number"
                        value={
                            viewOrderDetails.updated[item.id]
                                ? viewOrderDetails.updated[item.id]?.quantity || ''
                                : item.quantity || ''
                        }
                        placeholder="-"
                        className="form-control px-1 text-center py-1 order-input"
                        onChange={(e) => {
                            dispatch(
                                setUpdatedOrderDetails({
                                    ...viewOrderDetails.updated,
                                    last: item.id,
                                    [item.id]: {
                                        menuId: item.menu.id,
                                        menuName: item.menu.name,
                                        price: item.menu.price,
                                        quantity: Number(e.target.value || 0)
                                    }
                                })
                            );
                        }}
                    />
                ) : (
                    <p className="m-0">{item.quantity}</p>
                )}
            </div>
            <p className="col-2 text-end m-0">
                ₹{' '}
                {item.menu.price *
                    (viewOrderDetails.updated[item.id] ? viewOrderDetails.updated[item.id].quantity : item.quantity)}
            </p>
        </div>
    );

    if (!Object.keys(tableDetails).length) {
        return <Loader />;
    }

    if (feedback) {
        return (
            <div className="d-flex h-100">
                <Card className="m-auto d-flex menu-container" style={{ backgroundImage: `url(${MenuBackgroundImg})` }}>
                    <Card.Body className="d-flex flex-column align-items-center justify-content-center py-5 position-relative">
                        <div>
                            <h6 className="text-center" style={{ color: '#fff' }}>
                                Feedback
                            </h6>
                            <FormControl
                                as="textarea"
                                rows={5}
                                style={{ background: '#fff', border: 'none' }}
                                placeholder="Your feedback helps us improve! Share your thoughts here..."
                                onChange={(e) => {
                                    dispatch(setFeedbackDetails({ ...feedbackDetails, feedback: e.target.value }));
                                }}
                            />
                        </div>
                        <div className="my-5">
                            <h6 className="text-center" style={{ color: '#fff' }}>
                                Rating
                            </h6>
                            <Rating
                                handleClick={(rating) => {
                                    dispatch(setFeedbackDetails({ ...feedbackDetails, rating }));
                                }}
                            />
                        </div>
                        <div
                            className="pb-5 text-center view-order"
                            onClick={() => {
                                if ('feedback' in feedbackDetails || 'rating' in feedbackDetails) {
                                    dispatch(
                                        sendFeedbackRequest({
                                            ...feedbackDetails,
                                            customerId: tableDetails.customer.id,
                                            tableId: tableDetails.id
                                        })
                                    );
                                }
                            }}
                        >
                            <h6 role="button">Submit</h6>
                        </div>
                    </Card.Body>
                </Card>
            </div>
        );
    }

    return tableDetails.status === TABLE_STATUS[0] ? (
        <Loader />
    ) : (
        <>
            <MenuCard
                name={menuCard.name}
                tableNumber={tableDetails.tableNumber}
                restaurant={tableDetails.hotel}
                data={menuCard.data}
                orders={menuCard.orders}
                currentOrder={orderDetails}
                handleClick={handleClick}
                handleOnChange={handleOnChange}
                tipAmount={tipAmount}
                onTipAmountChange={setTipAmount}
            />
            <OMTModal
                show={viewOrderDetails.count}
                title={viewOrderDetails?.title}
                description={
                    <div className="px-3" style={{ overflowY: 'auto', maxHeight: '480px' }}>
                        {Object.values(viewOrderDetails.data || {}).map((item) => (
                            <OrderView key={`${item.id}-${item.name}`} item={item} />
                        ))}
                        {!Object.values(viewOrderDetails?.data || []).find((obj) => obj.status === ORDER_STATUS[0]) &&
                            [
                                ...(getGstSummary(viewOrderDetails.totalPrice).discountAmount > 0
                                    ? [{
                                        title: getGstSummary(viewOrderDetails.totalPrice).discountType === 'PERCENT'
                                            ? `Discount (${getGstSummary(viewOrderDetails.totalPrice).discountValue}%)`
                                            : 'Discount',
                                        value: `- ${getGstSummary(viewOrderDetails.totalPrice).discountAmount}`
                                    }]
                                    : []),
                                { title: `SGST Price (${gstPercent / 2}%)`, value: getGstSummary(viewOrderDetails.totalPrice).sgst },
                                { title: `CGST Price (${gstPercent / 2}%)`, value: getGstSummary(viewOrderDetails.totalPrice).cgst },
                                {
                                    title: 'Total Price',
                                    value: getGstSummary(viewOrderDetails.totalPrice).total
                                }
                            ].map(({ title, value }, key) => (
                                <div key={`${key}-${title}`} className="d-flex justify-content-between my-2">
                                    <i className="fw-bold" style={{ color: '#570d0a' }}>
                                        {title}
                                    </i>
                                    <i className="fw-bold" style={{ color: '#570d0a' }}>
                                        ₹ {value}
                                    </i>
                                </div>
                            ))}
                        <div className="alert alert-warning mt-4 mb-2" role="alert" style={{ fontSize: '14px' }}>
                            <strong>⚠️ Note:</strong> No refund will be provided once payment is completed. You can cancel the order within 5 minutes of placement.
                        </div>
                    </div>
                }
                handleSubmit={handleOrderSubmit}
                handleClose={handleOrderClose}
                isFooter={true}
                size={'lg'}
                submitText={
                    !(viewOrderDetails.submitText === 'Pay' && tableDetails.hotel.payment !== PAYMENT_PREFERENCE.on)
                        ? viewOrderDetails.submitText
                        : undefined
                }
                closeText={viewOrderDetails.closeText}
            />
            {orderPaymentData && (
                <Razorpay
                    action={ACTIONS.ORDERS}
                    email={orderPaymentData.email}
                    name={orderPaymentData.name}
                    phoneNumber={orderPaymentData.phoneNumber}
                    hotelName={tableDetails.hotel.name}
                    orderId={orderPaymentData.orderId}
                    amount={orderPaymentData.amount}
                    keyId={orderPaymentData.keyId}
                    handleSuccess={handlePaymentSuccess}
                />
            )}
            {invoicePrompt && (
                <OMTModal
                    show={invoicePrompt}
                    title="Order Placed Successfully"
                    description={
                        <div>
                            <p className="mb-2">Do you want to download invoice?</p>
                            <div className="small text-muted">
                                Order Number: <strong>{invoicePrompt?.order?.orderNumber}</strong>
                            </div>
                        </div>
                    }
                    handleSubmit={downloadInvoicePdf}
                    handleClose={() => {
                        dispatch(setInvoicePrompt(false));
                    }}
                    isFooter={true}
                    size={'md'}
                    submitText={'Yes'}
                    closeText={'No'}
                />
            )}
        </>
    );
}

export default OrderPlacement;
