import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { BsCalendar3, BsChevronLeft, BsChevronRight, BsInfoCircleFill } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import OMTModal from '../../components/Modal';
import * as orderService from '../../services/order.service';
import { connectSocket } from '../../services/socket.service';
import {
    clearOrderDetails,
    getOrderDetailsRequest,
    paymentConfirmationRequest,
    setPaymentRequest,
    updateOrderStatusRequest
} from '../../store/slice';
import { ORDER_STATUS } from '../../utils/constants';
import { handleManagerServiceWorkerMessage } from '../../utils/orderNotifications';
import { registerRefreshHandler, runBackgroundTask } from '../../utils/refreshBus';
import '../../assets/styles/orders.css';

const ORDERS_PER_PAGE = 24;
const PAID_POS_ORDERS_PER_PAGE = 4;
const HISTORY_DAYS = 7; // Today + previous 6 days

const startOfLocalDay = (date) => {
    const value = new Date(date);
    value.setHours(0, 0, 0, 0);
    return value;
};

const addDays = (date, days) => {
    const value = new Date(date);
    value.setDate(value.getDate() + days);
    return value;
};

const dateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatDate = (date) =>
    new Intl.DateTimeFormat('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    }).format(date);

const formatTime = (value) =>
    value
        ? new Intl.DateTimeFormat('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(value))
        : '-';

function Orders() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const hotelId = useSelector((state) => state.hotel.globalHotelId);
    const { paymentRequest, orderDetails, updateStatusLoading } = useSelector((state) => state.orders);

    const [activeView, setActiveView] = useState('today');
    const [selectedDate, setSelectedDate] = useState(startOfLocalDay(new Date()));
    const [orders, setOrders] = useState([]);
    const ordersRef = useRef([]);
    const [rowAnimations, setRowAnimations] = useState({});
    const rowAnimationTimerRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [customerSearchText, setCustomerSearchText] = useState('');
    const [searchField, setSearchField] = useState('orderNumber');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [page, setPage] = useState(1);
    const [completedPage, setCompletedPage] = useState(1);
    const [openOrders, setOpenOrders] = useState([]);
    const openOrdersRef = useRef([]);
    const [openOrdersLoading, setOpenOrdersLoading] = useState(false);
    const [completedOpenOrders, setCompletedOpenOrders] = useState([]);
    const completedOpenOrdersRef = useRef([]);
    const [completedOpenOrdersLoading, setCompletedOpenOrdersLoading] = useState(false);
    const [selectedCompletedPosOrder, setSelectedCompletedPosOrder] = useState(null);
    const [selectedRunningOrder, setSelectedRunningOrder] = useState(null);
    const [runningOrderDetailsLoading, setRunningOrderDetailsLoading] = useState(false);
    const [kotPrintingOrderId, setKotPrintingOrderId] = useState(null);
    const [kotPrintData, setKotPrintData] = useState(null);
    const lastDetailsRequestRef = useRef({ orderId: null, time: 0 });

    const availableDates = useMemo(() => {
        const today = startOfLocalDay(new Date());
        return Array.from({ length: HISTORY_DAYS }, (_, index) => addDays(today, -index));
    }, []);

    ordersRef.current = orders;
    openOrdersRef.current = openOrders;
    completedOpenOrdersRef.current = completedOpenOrders;

    const animateRows = useCallback((animations) => {
        if (!Object.keys(animations).length) return;
        if (rowAnimationTimerRef.current) window.clearTimeout(rowAnimationTimerRef.current);
        setRowAnimations(animations);
        rowAnimationTimerRef.current = window.setTimeout(() => setRowAnimations({}), 520);
    }, []);

    useEffect(() => () => {
        if (rowAnimationTimerRef.current) window.clearTimeout(rowAnimationTimerRef.current);
    }, []);

    const loadOrders = useCallback(async ({ silent = false } = {}) => {
        if (!hotelId) return;

        const dayStart = startOfLocalDay(selectedDate);
        const dayEnd = addDays(dayStart, 1);

        if (!silent && ordersRef.current.length === 0) setLoading(true);
        try {
            const response = await orderService.getCompletedOrders({
                hotelId,
                skip: 0,
                limit: 5000,
                sortKey: 'orderTime',
                sortOrder: 'desc',
                dateFrom: dayStart.toISOString(),
                dateTo: dayEnd.toISOString()
            });

            const responseData = response?.data?.data || response?.data || response?.rows || [];
            const rows = Array.isArray(responseData) ? responseData : [];

            // Safety filter: selected date ke alawa koi bhi order UI me nahi dikhega.
            const selectedDateKey = dateKey(dayStart);
            const selectedDateOrders = rows.filter((order) => {
                if (!order?.orderTime) return false;
                return dateKey(new Date(order.orderTime)) === selectedDateKey;
            });

            const sortedRows = [...selectedDateOrders].sort(
                (first, second) => new Date(second.orderTime) - new Date(first.orderTime)
            );

            const previousRows = ordersRef.current;
            const previousFingerprint = JSON.stringify(previousRows.map((order) => [order.orderId, order.orderStatus, order.updatedAt]));
            const nextFingerprint = JSON.stringify(sortedRows.map((order) => [order.orderId, order.orderStatus, order.updatedAt]));
            const changed = previousFingerprint !== nextFingerprint;
            if (changed) {
                if (previousRows.length) {
                    const previousById = new Map(previousRows.map((order) => [String(order.orderId), order]));
                    const animations = {};
                    sortedRows.forEach((order) => {
                        const previous = previousById.get(String(order.orderId));
                        if (!previous) animations[order.orderId] = 'refresh-insert';
                        else if (previous.orderStatus !== order.orderStatus) {
                            animations[order.orderId] = 'refresh-status-change';
                        }
                    });
                    animateRows(animations);
                }
                ordersRef.current = sortedRows;
                setOrders(sortedRows);
            }
            return changed;
        } catch (error) {
            console.error('Failed to load orders', error);
            if (!silent) toast.error('Orders load nahi ho paaye');
            if (!ordersRef.current.length) setOrders([]);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [animateRows, hotelId, selectedDate]);

    const loadOpenOrders = useCallback(async ({ silent = false } = {}) => {
        if (!hotelId) return false;
        try {
            if (!silent && openOrdersRef.current.length === 0) setOpenOrdersLoading(true);
            const response = await orderService.getOpenOrders(hotelId);
            const rows = response?.orders || response?.data?.orders || [];
            const nextOrders = Array.isArray(rows) ? rows : [];
            const before = JSON.stringify(openOrdersRef.current.map((order) => [
                order.id, order.status, order.revision, order.itemCount, order.runningTotal, order.updatedAt
            ]));
            const after = JSON.stringify(nextOrders.map((order) => [
                order.id, order.status, order.revision, order.itemCount, order.runningTotal, order.updatedAt
            ]));
            if (before !== after) setOpenOrders(nextOrders);
            return before !== after;
        } catch (error) {
            console.error('Failed to load open orders', error);
            if (!silent) toast.error('Open orders load nahi ho paaye');
            return false;
        } finally {
            setOpenOrdersLoading(false);
        }
    }, [hotelId]);

    const loadCompletedOpenOrders = useCallback(async ({ silent = false } = {}) => {
        if (!hotelId) return false;
        const dayStart = activeView === 'today'
            ? startOfLocalDay(new Date())
            : startOfLocalDay(selectedDate);
        const dayEnd = addDays(dayStart, 1);
        try {
            if (!silent && completedOpenOrdersRef.current.length === 0) {
                setCompletedOpenOrdersLoading(true);
            }
            const response = await orderService.getCompletedOpenOrders({
                hotelId,
                dateFrom: dayStart.toISOString(),
                dateTo: dayEnd.toISOString()
            });
            const rows = response?.orders || response?.data?.orders || [];
            const targetDateKey = dateKey(dayStart);

            // Backend response par kabhi stale/all-date data aaye tab bhi UI me
            // sirf selected payment date ke COMPLETED + PAID POS orders hi dikhayein.
            const nextOrders = (Array.isArray(rows) ? rows : [])
                .filter((order) => {
                    if (order?.status !== 'COMPLETED') return false;
                    if (order?.paymentStatus && order.paymentStatus !== 'PAID') return false;

                    const paidDate = order.paidAt || order.paymentCompletedAt || order.completedAt;
                    if (!paidDate) return false;

                    const parsedDate = new Date(paidDate);
                    if (Number.isNaN(parsedDate.getTime())) return false;
                    return dateKey(parsedDate) === targetDateKey;
                })
                .sort((first, second) => new Date(second.paidAt) - new Date(first.paidAt));

            const before = JSON.stringify(completedOpenOrdersRef.current.map((order) => [
                order.id, order.status, order.revision, order.finalAmount, order.paidAt, order.updatedAt
            ]));
            const after = JSON.stringify(nextOrders.map((order) => [
                order.id, order.status, order.revision, order.finalAmount, order.paidAt, order.updatedAt
            ]));
            if (before !== after) {
                completedOpenOrdersRef.current = nextOrders;
                setCompletedOpenOrders(nextOrders);
            }
            return before !== after;
        } catch (error) {
            console.error('Failed to load completed open orders', error);
            if (!silent) toast.error('Completed POS orders load nahi ho paaye');
            return false;
        } finally {
            setCompletedOpenOrdersLoading(false);
        }
    }, [activeView, hotelId, selectedDate]);

    useEffect(() => {
        loadOrders().catch(() => {});
        loadOpenOrders().catch(() => {});
        loadCompletedOpenOrders().catch(() => {});
    }, [loadCompletedOpenOrders, loadOpenOrders, loadOrders]);

    useEffect(() => registerRefreshHandler('manager-orders', async () => {
        const [normalChanged, openChanged, completedOpenChanged] = await Promise.all([
            loadOrders({ silent: true }),
            loadOpenOrders({ silent: true }),
            loadCompletedOpenOrders({ silent: true })
        ]);
        return normalChanged || openChanged || completedOpenChanged;
    }), [loadCompletedOpenOrders, loadOpenOrders, loadOrders]);

    useEffect(() => {
        setPage(1);
    }, [selectedDate, searchText, searchField, statusFilter]);

    useEffect(() => {
        setCompletedPage(1);
    }, [selectedDate, customerSearchText, activeView]);

    useEffect(() => {
        const checkDayChange = () => {
            if (activeView !== 'today') return;

            const today = startOfLocalDay(new Date());
            if (dateKey(today) !== dateKey(selectedDate)) {
                setSelectedDate(today);
                setPage(1);
            }
        };

        const intervalId = window.setInterval(checkDayChange, 60 * 1000);
        return () => window.clearInterval(intervalId);
    }, [activeView, selectedDate]);

    useEffect(() => {
        const handleServiceWorkerMessage = (event) => {
            const refreshOrdersInBackground = () => (
                runBackgroundTask(() => loadOrders({ silent: true })).catch(() => {})
            );
            handleManagerServiceWorkerMessage(event, {
                showToast: false,
                onOrderPlacement: refreshOrdersInBackground,
                onOrdersRefresh: refreshOrdersInBackground,
                onPaymentRequest: (meta) => {
                    dispatch(
                        setPaymentRequest({
                            title: 'Payment Request',
                            message: `Payment request for Table-${meta.tableNumber} of amount ${meta.totalPrice}. Please approve once the payment is done.`,
                            submitText: 'Approve',
                            tableId: meta.tableId,
                            customerId: meta.customerId
                        })
                    );
                }
            });
        };

        window.addEventListener('rcdine:notification', handleServiceWorkerMessage);

        return () => {
            window.removeEventListener('rcdine:notification', handleServiceWorkerMessage);
        };
    }, [dispatch, loadOrders]);

    useEffect(() => {
        if (!hotelId) return undefined;

        const socket = connectSocket();
        const joinHotelRoom = () => socket.emit('join-hotel', hotelId);
        const refreshFromApi = () => {
            runBackgroundTask(() => Promise.all([
                loadOrders({ silent: true }),
                loadOpenOrders({ silent: true }),
                loadCompletedOpenOrders({ silent: true })
            ])).catch(() => {});
        };
        const handleNewOrder = (payload) => {
            if (String(payload?.hotelId) !== String(hotelId)) return;
            const incomingOrder = payload?.order;
            if (!incomingOrder?.orderId || !incomingOrder?.orderTime) {
                refreshFromApi();
                return;
            }
            if (dateKey(new Date(incomingOrder.orderTime)) !== dateKey(selectedDate)) return;
            if (ordersRef.current.some((order) => String(order.orderId) === String(incomingOrder.orderId))) return;

            const nextOrders = [incomingOrder, ...ordersRef.current].sort(
                (first, second) => new Date(second.orderTime) - new Date(first.orderTime)
            );
            ordersRef.current = nextOrders;
            setOrders(nextOrders);
            animateRows({ [incomingOrder.orderId]: 'refresh-insert' });
        };
        const handleOrderStatusUpdated = (payload) => {
            if (String(payload?.hotelId) !== String(hotelId)) return;
            const index = ordersRef.current.findIndex(
                (order) => String(order.orderId) === String(payload?.orderId)
            );
            if (index < 0 || !payload?.status) {
                refreshFromApi();
                return;
            }

            const nextOrders = ordersRef.current.map((order, orderIndex) => orderIndex === index
                ? { ...order, orderStatus: payload.status, updatedAt: payload.updatedAt || order.updatedAt }
                : order);
            ordersRef.current = nextOrders;
            setOrders(nextOrders);
            animateRows({ [payload.orderId]: 'refresh-status-change' });
        };

        if (socket.connected) joinHotelRoom();
        socket.on('connect', joinHotelRoom);
        socket.on('new-order', handleNewOrder);
        socket.on('order-status-updated', handleOrderStatusUpdated);
        const openOrderEvents = [
            'open-order:created',
            'open-order:updated',
            'open-order:item-added',
            'open-order:bill-generated',
            'open-order:payment-completed',
            'open-order:closed',
            'open-order:table-freed'
        ];
        openOrderEvents.forEach((eventName) => socket.on(eventName, refreshFromApi));

        return () => {
            socket.off('connect', joinHotelRoom);
            socket.off('new-order', handleNewOrder);
            socket.off('order-status-updated', handleOrderStatusUpdated);
            openOrderEvents.forEach((eventName) => socket.off(eventName, refreshFromApi));
        };
    }, [animateRows, hotelId, loadCompletedOpenOrders, loadOpenOrders, loadOrders, selectedDate]);

    const ordersWithDailySrNo = useMemo(() => {
        const total = orders.length;
        return orders.map((order, index) => ({ ...order, srNo: total - index }));
    }, [orders]);

    const normalizedCustomerSearch = customerSearchText.trim().toLowerCase();

    const filteredOpenOrders = useMemo(() => {
        if (!normalizedCustomerSearch) return openOrders;
        return openOrders.filter((order) => String(order.customerName || 'Walk-in Guest')
            .toLowerCase()
            .includes(normalizedCustomerSearch));
    }, [normalizedCustomerSearch, openOrders]);

    const filteredCompletedOpenOrders = useMemo(() => {
        if (!normalizedCustomerSearch) return completedOpenOrders;
        return completedOpenOrders.filter((order) => String(order.customerName || 'Walk-in Guest')
            .toLowerCase()
            .includes(normalizedCustomerSearch));
    }, [completedOpenOrders, normalizedCustomerSearch]);

    const completedPageCount = Math.max(
        1,
        Math.ceil(filteredCompletedOpenOrders.length / PAID_POS_ORDERS_PER_PAGE)
    );
    const safeCompletedPage = Math.min(completedPage, completedPageCount);
    const visibleCompletedOpenOrders = useMemo(() => filteredCompletedOpenOrders.slice(
        (safeCompletedPage - 1) * PAID_POS_ORDERS_PER_PAGE,
        safeCompletedPage * PAID_POS_ORDERS_PER_PAGE
    ), [filteredCompletedOpenOrders, safeCompletedPage]);

    const filteredOrders = useMemo(() => {
        const query = searchText.trim().toLowerCase();

        return ordersWithDailySrNo.filter((order) => {
            const statusMatches = statusFilter === 'ALL' || order.orderStatus === statusFilter;
            if (!statusMatches) return false;
            if (!query) return true;

            const searchableValue = searchField === 'tableNumber'
                ? String(order.tableNumber || '')
                : String(order.orderNumber || '');

            return searchableValue.toLowerCase().includes(query);
        });
    }, [ordersWithDailySrNo, searchField, searchText, statusFilter]);

    const pageCount = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
    const safePage = Math.min(page, pageCount);
    const visibleOrders = useMemo(() => filteredOrders.slice(
        (safePage - 1) * ORDERS_PER_PAGE,
        safePage * ORDERS_PER_PAGE
    ), [filteredOrders, safePage]);

    const viewRunningOrder = async (order) => {
        if (!order?.id) return;
        try {
            setRunningOrderDetailsLoading(true);
            const response = await orderService.getOpenOrder(order.id);
            setSelectedRunningOrder(response?.order || response);
        } catch (error) {
            toast.error(error.message || 'Running order details load nahi ho paaye');
        } finally {
            setRunningOrderDetailsLoading(false);
        }
    };

    const printRunningOrderKot = async (order, event) => {
        event?.stopPropagation?.();
        if (!order?.id || kotPrintingOrderId) return;
        try {
            setKotPrintingOrderId(order.id);
            const result = await orderService.printOpenOrderKot(order.id);
            if (!result?.items?.length) {
                toast.info('KOT ke liye koi naya item nahi hai');
                return;
            }
            const tableLabel = order.table?.tableNumber
                ? `Table ${order.table.tableNumber}`
                : String(order.orderType || result.orderType || 'WALK_IN').replaceAll('_', ' ');
            setKotPrintData({ ...result, tableLabel });
            toast.success(`KOT batch ${result.batchNumber} print ke liye ready`);
            await loadOpenOrders({ silent: true });
            if (selectedRunningOrder?.id === order.id) {
                const refreshed = await orderService.getOpenOrder(order.id);
                setSelectedRunningOrder(refreshed?.order || refreshed);
            }
        } catch (error) {
            toast.error(error.message || 'KOT print nahi hui');
        } finally {
            setKotPrintingOrderId(null);
        }
    };

    useEffect(() => {
        if (!kotPrintData) return undefined;
        const timer = window.setTimeout(() => {
            document.body.classList.add('orders-printing-kot');
            window.print();
            document.body.classList.remove('orders-printing-kot');
            setKotPrintData(null);
        }, 250);
        return () => {
            window.clearTimeout(timer);
            document.body.classList.remove('orders-printing-kot');
        };
    }, [kotPrintData]);

    const openOrderDetailsSafely = (order) => {
        if (!order?.orderId || !hotelId) return;

        const now = Date.now();
        const isSameOrder = lastDetailsRequestRef.current.orderId === order.orderId;
        const isTooFast = now - lastDetailsRequestRef.current.time < 1500;
        if (isSameOrder && isTooFast) return;

        lastDetailsRequestRef.current = { orderId: order.orderId, time: now };
        dispatch(getOrderDetailsRequest({ hotelId, orderId: order.orderId, srNo: order.srNo }));
    };

    const selectToday = () => {
        const today = startOfLocalDay(new Date());
        completedOpenOrdersRef.current = [];
        setCompletedOpenOrders([]);
        setSelectedCompletedPosOrder(null);
        setActiveView('today');
        setSelectedDate(today);
        setPage(1);
        setCompletedPage(1);
    };

    const selectPrevious = () => {
        const defaultPreviousDate = availableDates[1] || addDays(startOfLocalDay(new Date()), -1);
        completedOpenOrdersRef.current = [];
        setCompletedOpenOrders([]);
        setSelectedCompletedPosOrder(null);
        setActiveView('previous');
        setSelectedDate(defaultPreviousDate);
        setPage(1);
        setCompletedPage(1);
    };

    const handleDownloadInvoice = async () => {
        if (!orderDetails) return;
        try {
            await orderService.downloadInvoice(
                hotelId,
                orderDetails.orderId,
                orderDetails.hotelName || 'hotel',
                orderDetails.orderNumber || 'order'
            );
            toast.success('Invoice downloaded successfully');
        } catch (error) {
            console.error('Failed to download invoice', error);
            toast.error('Failed to download invoice');
        }
    };

    const handleMarkAsCompleted = () => {
        if (!orderDetails || orderDetails.orderStatus === 'CANCELLED') return;
        dispatch(
            updateOrderStatusRequest({
                hotelId,
                orderId: orderDetails.orderId,
                status: ORDER_STATUS[3]
            })
        );
    };

    const OrderDetailsModal = () => {
        if (!orderDetails) return null;

        const subtotal = orderDetails.subtotal ?? (orderDetails.orderedItems || []).reduce(
            (sum, item) => sum + (Number(item.itemPrice) || 0),
            0
        );
        const sgst = orderDetails.sgst ?? Math.round(subtotal * 0.025);
        const cgst = orderDetails.cgst ?? Math.round(subtotal * 0.025);
        const tip = orderDetails.tipAmount ?? 0;
        const discountAmount = Number(orderDetails.discountAmount || 0);
        const discountType = orderDetails.discountType || '';
        const discountValue = Number(orderDetails.discountValue || 0);
        const totalAmount = orderDetails.totalAmount ?? subtotal + tip + sgst + cgst - discountAmount;

        return (
            <OMTModal
                show={true}
                title="Order Details"
                description={
                    <div className="order-details-container">
                        <Row className="mb-3">
                            <Col md={6}>
                                <p><strong>Order Number:</strong> {orderDetails.orderNumber}</p>
                                <p><strong>Daily Sr. No.:</strong> {orderDetails.srNo || '-'}</p>
                                <p><strong>Table Number:</strong> {orderDetails.tableNumber}</p>
                                <p>
                                    <strong>Source:</strong>{' '}
                                    {orderDetails.source === 'MANAGER_POS' ? 'Manager POS' : 'Customer QR'}
                                </p>
                            </Col>
                            <Col md={6}>
                                <p><strong>Date/Time:</strong> {new Date(orderDetails.orderDateTime).toLocaleString()}</p>
                                <p><strong>Status:</strong> {orderDetails.orderStatus}</p>
                                <p><strong>Payment Mode:</strong> {orderDetails.paymentMode}</p>
                            </Col>
                        </Row>

                        <div className="mx-2 my-4 px-3 py-4 rounded table-borders">
                            <h6 className="fw-bold">Ordered Items:</h6>
                            <table className="table order-bill-table">
                                <thead>
                                    <tr>
                                        <th>Sr.</th>
                                        <th>Item</th>
                                        <th className="text-center">Qty</th>
                                        <th className="text-end">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(orderDetails.orderedItems || []).map((item, index) => (
                                        <tr key={`${item.name}-${index}`}>
                                            <td>{index + 1}</td>
                                            <td>{item.name}</td>
                                            <td className="text-center">{item.quantity}</td>
                                            <td className="text-end">₹ {item.itemPrice}</td>
                                        </tr>
                                    ))}
                                    <tr><td colSpan="3" className="text-end fw-bold">Subtotal:</td><td className="text-end">₹ {subtotal}</td></tr>
                                    <tr><td colSpan="3" className="text-end fw-bold">Tip:</td><td className="text-end">₹ {tip}</td></tr>
                                    {discountAmount > 0 && (
                                        <tr>
                                            <td colSpan="3" className="text-end fw-bold">
                                                {discountType === 'PERCENT' ? `Discount (${discountValue}%):` : 'Discount:'}
                                            </td>
                                            <td className="text-end text-danger">- ₹ {discountAmount}</td>
                                        </tr>
                                    )}
                                    <tr><td colSpan="3" className="text-end fw-bold">SGST:</td><td className="text-end">₹ {sgst}</td></tr>
                                    <tr><td colSpan="3" className="text-end fw-bold">CGST:</td><td className="text-end">₹ {cgst}</td></tr>
                                    <tr><td colSpan="3" className="text-end fw-bold">Final Amount:</td><td className="text-end fw-bold">₹ {totalAmount}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                }
                handleClose={() => dispatch(clearOrderDetails())}
                handleSubmit={handleMarkAsCompleted}
                size="lg"
                submitText={
                    orderDetails.orderStatus !== 'COMPLETED' && orderDetails.orderStatus !== 'CANCELLED'
                        ? 'Mark as Completed'
                        : null
                }
                closeText="Close"
                additionalButtons={[
                    { text: 'Download Invoice', onClick: handleDownloadInvoice, variant: 'outline-primary' }
                ]}
                isLoading={updateStatusLoading}
            />
        );
    };

    return (
        <div className="orders-page">
            <div className="orders-header">
                <div>
                    <h4>Orders</h4>
                    <p>{activeView === 'today' ? 'Today\'s live orders' : `Orders from ${formatDate(selectedDate)}`}</p>
                </div>
                <div className="orders-view-tabs">
                    <button type="button" className={activeView === 'today' ? 'active' : ''} onClick={selectToday}>
                        Today
                    </button>
                    <button type="button" className={activeView === 'previous' ? 'active' : ''} onClick={selectPrevious}>
                        Previous
                    </button>
                </div>
            </div>

            <div className="customer-order-search">
                <span>Customer Search</span>
                <input
                    type="search"
                    value={customerSearchText}
                    onChange={(event) => setCustomerSearchText(event.target.value)}
                    placeholder="Customer name search karein, jaise Ram"
                    aria-label="Search orders by customer name"
                />
                {customerSearchText && (
                    <button type="button" onClick={() => setCustomerSearchText('')}>Clear</button>
                )}
            </div>

            {activeView === 'today' && (
                <section className="running-orders-section">
                    <div className="running-orders-head">
                        <div>
                            <span className="running-orders-kicker">LIVE RUNNING ORDERS</span>
                            <h5>Customer Open Orders <b>{filteredOpenOrders.length}</b></h5>
                            <p>Customer name aur table dekhkar same order me naye items add karo.</p>
                        </div>
                        <button type="button" onClick={() => navigate('/walkin-pos')}>+ New Order</button>
                    </div>

                    {openOrdersLoading && openOrders.length === 0 ? (
                        <div className="running-orders-loading">Open orders loading...</div>
                    ) : filteredOpenOrders.length === 0 ? (
                        <div className="running-orders-empty">{customerSearchText ? 'Is customer name se koi open order nahi mila.' : 'Abhi koi open customer order nahi hai.'}</div>
                    ) : (
                        <div className="running-orders-grid">
                            {filteredOpenOrders.map((order) => {
                                const tableLabel = order.table?.tableNumber
                                    ? `Table ${order.table.tableNumber}`
                                    : String(order.orderType || 'WALK_IN').replaceAll('_', ' ');
                                const items = Array.isArray(order.items) ? order.items : [];
                                const itemSummary = items.length
                                    ? items.slice(0, 3).map((item) => `${item.itemName || item.name} ×${item.quantity}`).join(', ')
                                    : `${order.itemCount || 0} item${Number(order.itemCount || 0) === 1 ? '' : 's'}`;
                                return (
                                    <article
                                        className="running-order-card running-order-card-clickable"
                                        key={order.id}
                                        role="button"
                                        tabIndex={0}
                                        aria-label={`View ${order.customerName || 'customer'} running order details`}
                                        onClick={() => viewRunningOrder(order)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter' || event.key === ' ') {
                                                event.preventDefault();
                                                viewRunningOrder(order);
                                            }
                                        }}
                                    >
                                        <div className="running-order-top">
                                            <div>
                                                <span className="running-customer-label">CUSTOMER</span>
                                                <h3>{order.customerName || 'Walk-in Guest'}</h3>
                                            </div>
                                            <span className={`running-status ${String(order.status || '').toLowerCase()}`}>{order.status}</span>
                                        </div>
                                        <div className="running-order-meta">
                                            <strong>{tableLabel}</strong>
                                            <span>{order.orderNumber}</span>
                                        </div>
                                        <p className="running-order-items" title={itemSummary}>{itemSummary}</p>
                                        <div className="running-order-total">
                                            <span>Running Total</span>
                                            <strong>₹ {Number(order.runningTotal ?? order.subtotalAmount ?? 0).toFixed(2)}</strong>
                                        </div>
                                        <div className="running-order-actions">
                                            <button
                                                type="button"
                                                className="running-add-button"
                                                disabled={order.status !== 'OPEN'}
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    navigate(`/walkin-pos?openOrderId=${encodeURIComponent(order.id)}&action=add`);
                                                }}
                                            >
                                                {order.status === 'OPEN' ? '+ Add Order' : 'Items Locked'}
                                            </button>
                                            <button
                                                type="button"
                                                className="running-kot-button"
                                                disabled={kotPrintingOrderId === order.id}
                                                onClick={(event) => printRunningOrderKot(order, event)}
                                            >
                                                {kotPrintingOrderId === order.id ? 'Preparing KOT...' : 'Print KOT'}
                                            </button>
                                            <button
                                                type="button"
                                                className="running-payment-button"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    navigate(`/walkin-pos?openOrderId=${encodeURIComponent(order.id)}&action=payment`);
                                                }}
                                            >
                                                {order.status === 'BILLED' ? 'Complete Payment' : 'Complete'}
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            )}

            {activeView === 'previous' && (
                <div className="previous-date-strip" data-preserve-scroll>
                    {availableDates.slice(1).map((date) => (
                        <button
                            type="button"
                            key={dateKey(date)}
                            className={dateKey(date) === dateKey(selectedDate) ? 'active' : ''}
                            onClick={() => {
                                completedOpenOrdersRef.current = [];
                                setCompletedOpenOrders([]);
                                setSelectedCompletedPosOrder(null);
                                setSelectedDate(startOfLocalDay(date));
                                setPage(1);
                                setCompletedPage(1);
                            }}
                        >
                            <BsCalendar3 />
                            <span>{formatDate(date)}</span>
                        </button>
                    ))}
                </div>
            )}

            <section className="completed-pos-orders-section">
                <div className="completed-pos-orders-head">
                    <div>
                        <span className="completed-pos-orders-kicker">PAID MANAGER POS ORDERS</span>
                        <h5>{activeView === 'today' ? 'Today Complete Orders' : `Completed Orders · ${formatDate(selectedDate)}`} <b>{filteredCompletedOpenOrders.length}</b></h5>
                        <p>{activeView === 'today' ? `${formatDate(startOfLocalDay(new Date()))} ko payment complete hue orders.` : 'Upar date select karo; sirf us din payment complete hue orders dikhenge.'}</p>
                    </div>
                </div>

                {completedOpenOrdersLoading && completedOpenOrders.length === 0 ? (
                    <div className="completed-pos-orders-empty">Completed orders loading...</div>
                ) : filteredCompletedOpenOrders.length === 0 ? (
                    <div className="completed-pos-orders-empty">{customerSearchText ? 'Is customer name se koi completed order nahi mila.' : activeView === 'today' ? 'Aaj koi completed Manager POS order nahi hai.' : 'Selected date par koi completed Manager POS order nahi hai.'}</div>
                ) : (
                    <div className="completed-pos-orders-grid">
                        {visibleCompletedOpenOrders.map((order) => {
                            const tableLabel = order.table?.tableNumber
                                ? `Table ${order.table.tableNumber}`
                                : String(order.orderType || 'WALK_IN').replaceAll('_', ' ');
                            const items = Array.isArray(order.items) ? order.items : [];
                            const itemSummary = items.length
                                ? items.slice(0, 4).map((item) => `${item.itemName || item.name} ×${item.quantity}`).join(', ')
                                : `${order.itemCount || 0} items`;
                            return (
                                <button
                                    type="button"
                                    className="completed-pos-order-card"
                                    key={order.id}
                                    onClick={() => setSelectedCompletedPosOrder(order)}
                                >
                                    <div className="completed-pos-order-top">
                                        <div>
                                            <span>CUSTOMER</span>
                                            <h3>{order.customerName || 'Walk-in Guest'}</h3>
                                        </div>
                                        <b>PAID</b>
                                    </div>
                                    <div className="completed-pos-order-meta">
                                        <strong>{tableLabel}</strong>
                                        <span>{order.orderNumber}</span>
                                    </div>
                                    <p title={itemSummary}>{itemSummary}</p>
                                    <div className="completed-pos-order-footer">
                                        <span>{order.paymentMethod || 'PAID'} · {formatTime(order.paidAt || order.updatedAt)}</span>
                                        <strong>₹ {Number(order.finalAmount ?? order.runningTotal ?? 0).toFixed(2)}</strong>
                                    </div>
                                    <small className="completed-pos-touch-hint">Touch to view details</small>
                                </button>
                            );
                        })}
                    </div>
                )}

                {completedPageCount > 1 && (
                    <div className="orders-pagination completed-pos-pagination">
                        <button
                            type="button"
                            disabled={safeCompletedPage === 1}
                            onClick={() => setCompletedPage((value) => Math.max(1, value - 1))}
                        >
                            <BsChevronLeft /> Previous
                        </button>
                        <span>Page {safeCompletedPage} of {completedPageCount}</span>
                        <button
                            type="button"
                            disabled={safeCompletedPage === completedPageCount}
                            onClick={() => setCompletedPage((value) => Math.min(completedPageCount, value + 1))}
                        >
                            Next <BsChevronRight />
                        </button>
                    </div>
                )}
            </section>

            <div className="orders-toolbar">
                <input
                    type="text"
                    className="form-control"
                    placeholder={searchField === 'tableNumber' ? 'Search table number' : 'Search order number'}
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                />
                <select className="form-select" value={searchField} onChange={(event) => setSearchField(event.target.value)}>
                    <option value="orderNumber">Order Number</option>
                    <option value="tableNumber">Table Number</option>
                </select>
                <select className="form-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                    <option value="ALL">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="PREPARING">Preparing</option>
                    <option value="READY">Ready</option>
                    <option value="COMPLETED">Completed</option>
                </select>
                {(searchText || statusFilter !== 'ALL') && (
                    <button type="button" className="btn btn-outline-secondary" onClick={() => { setSearchText(''); setStatusFilter('ALL'); }}>
                        Clear
                    </button>
                )}
            </div>

            <div className="orders-summary-line">
                <strong>{formatDate(selectedDate)}</strong>
                <span>{filteredOrders.length} orders</span>
            </div>

            {loading ? (
                <div className="orders-skeleton" role="status" aria-label="Loading orders">
                    {[0, 1, 2, 3].map((item) => (
                        <span className="orders-skeleton-card" key={item}>
                            <b /><small /><small /><i />
                        </span>
                    ))}
                </div>
            ) : visibleOrders.length === 0 ? (
                <div className="orders-empty">
                    <BsCalendar3 size={34} />
                    <h5>No orders found</h5>
                    <p>{activeView === 'today' ? 'New orders ke liye screen ready hai.' : 'Is date par koi order nahi hai.'}</p>
                </div>
            ) : (
                <div className="orders-card-grid">
                    {visibleOrders.map((order) => {
                        const isManagerOrder = order.source === 'MANAGER_POS';
                        const itemSummary = (order.menu || [])
                            .map((item) => `${item.name} ×${item.quantity}`)
                            .join(', ');

                        return (
                            <button
                                type="button"
                                className={`order-card ${rowAnimations[order.orderId] || ''}`}
                                key={order.orderId}
                                onClick={() => openOrderDetailsSafely(order)}
                            >
                                <div className="order-card-top">
                                    <span className="daily-sr-badge">Sr. {order.srNo}</span>
                                    <span className={`order-status-badge ${(order.orderStatus || '').toLowerCase()}`}>
                                        {order.orderStatus}
                                    </span>
                                </div>
                                <div className="order-card-number">
                                    <span>{order.orderNumber || '-'}</span>
                                    <BsInfoCircleFill />
                                </div>
                                <span className={`order-source-badge ${isManagerOrder ? 'manager' : 'customer'}`}>
                                    {isManagerOrder ? 'Manager POS' : 'Customer QR'}
                                </span>
                                <div className="order-card-meta">
                                    <span>Table <strong>{order.tableNumber || '-'}</strong></span>
                                    <span>{formatTime(order.orderTime)}</span>
                                </div>
                                <p className="order-card-items" title={itemSummary}>{itemSummary || 'No items'}</p>
                                <div className="order-card-total">
                                    <span>Total</span>
                                    <strong>₹ {order.totalPrice ?? 0}</strong>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            {pageCount > 1 && (
                <div className="orders-pagination">
                    <button type="button" disabled={safePage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>
                        <BsChevronLeft /> Previous
                    </button>
                    <span>Page {safePage} of {pageCount}</span>
                    <button type="button" disabled={safePage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))}>
                        Next <BsChevronRight />
                    </button>
                </div>
            )}

            {selectedRunningOrder && (
                <OMTModal
                    show={Boolean(selectedRunningOrder)}
                    title={`${selectedRunningOrder.customerName || 'Walk-in Guest'} · ${selectedRunningOrder.orderNumber || 'Running Order'}`}
                    description={
                        <div className="running-order-details">
                            <div className="running-order-details-summary">
                                <div><span>Status</span><strong>{selectedRunningOrder.status || 'OPEN'}</strong></div>
                                <div><span>Table</span><strong>{selectedRunningOrder.table?.tableNumber ? `Table ${selectedRunningOrder.table.tableNumber}` : String(selectedRunningOrder.orderType || 'WALK_IN').replaceAll('_', ' ')}</strong></div>
                                <div><span>Customer</span><strong>{selectedRunningOrder.customerName || 'Walk-in Guest'}</strong></div>
                                <div><span>Last Updated</span><strong>{formatTime(selectedRunningOrder.lastUpdated || selectedRunningOrder.updatedAt)}</strong></div>
                            </div>
                            <div className="running-order-details-items">
                                <div className="running-order-details-row running-order-details-head">
                                    <span>Item</span><span>Qty</span><span>KOT</span><span>Amount</span>
                                </div>
                                {(Array.isArray(selectedRunningOrder.items) ? selectedRunningOrder.items : []).map((item, index) => (
                                    <div className="running-order-details-row" key={item.id || `${item.itemName || item.name}-${index}`}>
                                        <span>{item.itemName || item.name || 'Item'}</span>
                                        <span>{item.quantity || 0}</span>
                                        <span className={item.kotPrintedAt ? 'kot-done' : 'kot-new'}>{item.kotPrintedAt ? 'Printed' : 'New'}</span>
                                        <span>₹ {Number(item.lineTotal ?? item.totalAmount ?? ((item.unitPrice ?? item.price ?? 0) * (item.quantity || 0))).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="running-order-details-total">
                                <span>Running Total</span>
                                <strong>₹ {Number(selectedRunningOrder.runningTotal ?? selectedRunningOrder.subtotalAmount ?? 0).toFixed(2)}</strong>
                            </div>
                            {runningOrderDetailsLoading && <p className="running-order-details-loading">Latest details loading...</p>}
                        </div>
                    }
                    handleClose={() => setSelectedRunningOrder(null)}
                    size="lg"
                    submitText={null}
                    closeText="Close"
                    additionalButtons={[
                        {
                            text: kotPrintingOrderId === selectedRunningOrder.id ? 'Preparing KOT...' : 'Print KOT',
                            onClick: () => printRunningOrderKot(selectedRunningOrder),
                            variant: 'outline-dark',
                            disabled: Boolean(kotPrintingOrderId)
                        },
                        ...(selectedRunningOrder.status === 'OPEN' ? [{
                            text: '+ Add Order',
                            onClick: () => navigate(`/walkin-pos?openOrderId=${encodeURIComponent(selectedRunningOrder.id)}&action=add`),
                            variant: 'primary'
                        }] : [])
                    ]}
                />
            )}

            {selectedCompletedPosOrder && (
                <OMTModal
                    show={Boolean(selectedCompletedPosOrder)}
                    title={`${selectedCompletedPosOrder.customerName || 'Walk-in Guest'} · ${selectedCompletedPosOrder.orderNumber || 'Completed Order'}`}
                    description={
                        <div className="completed-pos-details">
                            <div className="completed-pos-details-summary">
                                <div><span>Status</span><strong>PAID · COMPLETED</strong></div>
                                <div><span>Table</span><strong>{selectedCompletedPosOrder.table?.tableNumber ? `Table ${selectedCompletedPosOrder.table.tableNumber}` : String(selectedCompletedPosOrder.orderType || 'WALK_IN').replaceAll('_', ' ')}</strong></div>
                                <div><span>Payment</span><strong>{selectedCompletedPosOrder.paymentMethod || 'PAID'}</strong></div>
                                <div><span>Completed</span><strong>{selectedCompletedPosOrder.paidAt || selectedCompletedPosOrder.updatedAt ? `${formatDate(new Date(selectedCompletedPosOrder.paidAt || selectedCompletedPosOrder.updatedAt))}, ${formatTime(selectedCompletedPosOrder.paidAt || selectedCompletedPosOrder.updatedAt)}` : '-'}</strong></div>
                            </div>
                            <div className="completed-pos-details-items">
                                <div className="completed-pos-details-row completed-pos-details-head">
                                    <span>Item</span><span>Qty</span><span>Amount</span>
                                </div>
                                {(Array.isArray(selectedCompletedPosOrder.items) ? selectedCompletedPosOrder.items : []).map((item, index) => (
                                    <div className="completed-pos-details-row" key={item.id || `${item.itemName || item.name}-${index}`}>
                                        <span>{item.itemName || item.name || 'Item'}</span>
                                        <span>{item.quantity || 0}</span>
                                        <span>₹ {Number(item.lineTotal ?? item.totalAmount ?? ((item.unitPrice ?? item.price ?? 0) * (item.quantity || 0))).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="completed-pos-details-totals">
                                <div><span>Subtotal</span><strong>₹ {Number(selectedCompletedPosOrder.subtotalAmount ?? selectedCompletedPosOrder.runningTotal ?? 0).toFixed(2)}</strong></div>
                                {Number(selectedCompletedPosOrder.discountAmount || 0) > 0 && <div><span>Discount</span><strong>- ₹ {Number(selectedCompletedPosOrder.discountAmount).toFixed(2)}</strong></div>}
                                {Number(selectedCompletedPosOrder.taxAmount || selectedCompletedPosOrder.gstAmount || 0) > 0 && <div><span>GST</span><strong>₹ {Number(selectedCompletedPosOrder.taxAmount || selectedCompletedPosOrder.gstAmount).toFixed(2)}</strong></div>}
                                {Number(selectedCompletedPosOrder.tipAmount || 0) > 0 && <div><span>Tip</span><strong>₹ {Number(selectedCompletedPosOrder.tipAmount).toFixed(2)}</strong></div>}
                                <div className="completed-pos-details-grand"><span>Paid Total</span><strong>₹ {Number(selectedCompletedPosOrder.finalAmount ?? selectedCompletedPosOrder.runningTotal ?? 0).toFixed(2)}</strong></div>
                            </div>
                        </div>
                    }
                    handleClose={() => setSelectedCompletedPosOrder(null)}
                    size="lg"
                    submitText={null}
                    closeText="Close"
                />
            )}

            <section className="orders-kot-print-host" aria-hidden={!kotPrintData}>
                {kotPrintData ? (
                    <div className="orders-kot-slip">
                        <h1>KITCHEN ORDER TICKET</h1>
                        <div className="orders-kot-meta">
                            <p><span>Order</span><b>{kotPrintData.orderNumber}</b></p>
                            <p><span>Table / Type</span><b>{kotPrintData.tableLabel}</b></p>
                            <p><span>KOT Batch</span><b>#{kotPrintData.batchNumber}</b></p>
                            <p><span>Printed</span><b>{new Date(kotPrintData.printedAt).toLocaleString()}</b></p>
                        </div>
                        <div className="orders-kot-rule" />
                        {kotPrintData.items.map((item) => (
                            <div className="orders-kot-item" key={item.id}>
                                <b>{item.quantity} × {item.itemName}</b>
                                {item.notes ? <span>Note: {item.notes}</span> : null}
                            </div>
                        ))}
                    </div>
                ) : null}
            </section>

            {orderDetails && <OrderDetailsModal />}

            {paymentRequest && (
                <OMTModal
                    show={paymentRequest}
                    title={paymentRequest.title}
                    description={<p>{paymentRequest.message}</p>}
                    handleSubmit={() => dispatch(paymentConfirmationRequest({ manual: true, customerId: paymentRequest.customerId }))}
                    size="md"
                    submitText={paymentRequest.submitText}
                />
            )}
        </div>
    );
}

export default Orders;
