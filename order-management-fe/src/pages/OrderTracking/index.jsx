import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loader from '../../components/Loader';
import OMTModal from '../../components/Modal';
import { cancelOrder, downloadInvoice, getOrderStatus, getPublicOrderDetails } from '../../services/order.service';
import { connectSocket } from '../../services/socket.service';
import { setOrderDetails, setTrackingOrder } from '../../store/slice';
import { registerRefreshHandler, runBackgroundTask } from '../../utils/refreshBus';
import { playOrderCancelledSound, playOrderReadySound } from '../../utils/sound';
import '../../assets/styles/menuCard.css';

function OrderTracking() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [order, setOrder] = useState(null);
    const [liveStatus, setLiveStatus] = useState('PENDING');
    const [loading, setLoading] = useState(true);
    const [showReadyModal, setShowReadyModal] = useState(false);
    const [downloadingInvoice, setDownloadingInvoice] = useState(false);
    const [cancellingOrder, setCancellingOrder] = useState(false);
    const [cancellationTimeLeft, setCancellationTimeLeft] = useState(300);
    const [orderCreatedAt, setOrderCreatedAt] = useState(null);

    const statusIntervalRef = useRef(null);
    const countdownIntervalRef = useRef(null);

    useEffect(() => registerRefreshHandler('order-tracking', async () => {
        if (!orderId) return false;
        const result = await getOrderStatus(orderId);
        const nextStatus = result?.status || result?.orderStatus;
        if (!nextStatus || nextStatus === liveStatus) return false;
        setLiveStatus(nextStatus);
        return true;
    }), [liveStatus, orderId]);

    useEffect(() => {
        if (!orderId) return;

        const loadOrderDetails = async () => {
            try {
                const stored = localStorage.getItem('activeOrder');

                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (parsed && String(parsed.orderId) === String(orderId)) {
                        setOrder(parsed);
                        setLiveStatus(parsed.orderStatus || 'PENDING');
                        if (parsed.orderDateTime) {
                            setOrderCreatedAt(new Date(parsed.orderDateTime));
                        }
                        setLoading(false);
                        return;
                    }
                }

                const data = await getPublicOrderDetails(orderId);

                if (data) {
                    const fetchedOrder = {
                        orderId: data.orderId || data.id,
                        orderNumber: data.orderNumber,
                        tableNumber: data.tableNumber,
                        totalPrice: data.totalAmount || data.totalPrice,
                        hotelId: data.hotelId,
                        hotelName: data.hotelName,
                        customerId: data.customerId,
                        tableId: data.tableId,
                        orderDateTime: data.orderDateTime || data.createdAt
                    };

                    setOrder(fetchedOrder);
                    setLiveStatus(data.orderStatus || data.status || 'PENDING');
                    setOrderCreatedAt(new Date(fetchedOrder.orderDateTime));
                }
            } catch (error) {
                console.error('Failed to load order details', error);
            } finally {
                setLoading(false);
            }
        };

        loadOrderDetails();
    }, [orderId]);

    useEffect(() => {
        if (!orderId) return undefined;

        const socket = connectSocket();

        const joinOrderRoom = () => {
            socket.emit('join-order', orderId);
        };

        const handleOrderCancelled = (payload) => {
            if (String(payload?.orderId) !== String(orderId)) return;

            setLiveStatus('CANCELLED');
            playOrderCancelledSound(orderId);
            toast.error('Your order has been cancelled.');
        };

        const handleOrderStatusUpdated = (payload) => {
            if (String(payload?.orderId) !== String(orderId) || !payload?.status) return;
            setLiveStatus((previousStatus) => {
                if (
                    (payload.status === 'COMPLETED' || payload.status === 'READY') &&
                    previousStatus !== payload.status
                ) {
                    playOrderReadySound(orderId);
                    setShowReadyModal(true);
                }
                return payload.status;
            });
        };

        if (socket.connected) {
            joinOrderRoom();
        }

        socket.on('connect', joinOrderRoom);
        socket.on('order-cancelled', handleOrderCancelled);
        socket.on('order-status-updated', handleOrderStatusUpdated);

        return () => {
            socket.emit('leave-order', orderId);
            socket.off('connect', joinOrderRoom);
            socket.off('order-cancelled', handleOrderCancelled);
            socket.off('order-status-updated', handleOrderStatusUpdated);
        };
    }, [orderId]);

    useEffect(() => {
        if (!orderId || loading) return;

        const checkStatus = async () => {
            try {
                const res = await runBackgroundTask(() => getOrderStatus(orderId));
                const nextStatus = res?.status || res?.orderStatus;

                if (nextStatus) {
                    setLiveStatus((prevStatus) => {
                        if ((nextStatus === 'COMPLETED' || nextStatus === 'READY') && prevStatus !== nextStatus) {
                            playOrderReadySound(orderId);
                            setShowReadyModal(true);
                        }
                        return nextStatus;
                    });
                }
            } catch (error) {
                console.error('Error fetching order status', error);
            }
        };

        statusIntervalRef.current = setInterval(checkStatus, 5000);
        checkStatus();

        return () => {
            clearInterval(statusIntervalRef.current);
            statusIntervalRef.current = null;
        };
    }, [orderId, loading]);

    useEffect(() => {
        if (!orderCreatedAt) return;

        countdownIntervalRef.current = setInterval(() => {
            const now = new Date();
            const secondsElapsed = Math.floor((now - orderCreatedAt) / 1000);
            const timeLeft = Math.max(0, 300 - secondsElapsed);
            setCancellationTimeLeft(timeLeft);
        }, 1000);

        return () => {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        };
    }, [orderCreatedAt]);

    const handleDownloadInvoice = async () => {
        if (!order) {
            toast.error('Order details not available');
            return;
        }

        try {
            setDownloadingInvoice(true);
            await downloadInvoice(order.hotelId, order.orderId, order.hotelName || 'hotel', order.orderNumber || 'order');
            toast.success('Invoice downloaded successfully');
        } catch (error) {
            console.error('Failed to download invoice', error);
            toast.error('Failed to download invoice');
        } finally {
            setDownloadingInvoice(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!order || cancellationTimeLeft <= 0) {
            toast.error('Cannot cancel this order');
            return;
        }

        try {
            setCancellingOrder(true);
            await cancelOrder(order.orderId);
            toast.success('Order cancelled successfully');
            playOrderCancelledSound(order.orderId);
            setLiveStatus('CANCELLED');
        } catch (error) {
            console.error('Failed to cancel order', error);
            toast.error(error.response?.data?.message || 'Failed to cancel order');
        } finally {
            setCancellingOrder(false);
        }
    };

    const getCustomerOrderRoute = () => {
        const storedToken = localStorage.getItem('customerToken');
        if (storedToken) return `/place/${encodeURIComponent(storedToken)}`;
        if (order?.tableId) return `/place/${encodeURIComponent(order.tableId)}`;
        return '/';
    };

    const clearTrackingState = () => {
        clearInterval(statusIntervalRef.current);
        clearInterval(countdownIntervalRef.current);
        localStorage.removeItem('activeOrder');
        dispatch(setOrderDetails({}));
        dispatch(setTrackingOrder(null));
    };

    const handleCloseOrder = () => {
        clearTrackingState();
        navigate(getCustomerOrderRoute(), { replace: true });
    };

    const normalizedStatus = String(liveStatus || '').toUpperCase();
    const isReady = normalizedStatus === 'COMPLETED' || normalizedStatus === 'READY';
    const isCancelled = normalizedStatus === 'CANCELLED';

    const progressPercent = isCancelled ? 100 : isReady ? 100 : normalizedStatus === 'PREPARING' ? 66 : 33;

    if (loading) return <Loader />;

    if (!order) {
        return (
            <div className="rc-track-page">
                <div className="rc-track-card">
                    <h2>Order not found</h2>
                    <button className="rc-track-primary" onClick={() => navigate('/')}>
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="rc-track-page">
            <div className="rc-track-phone">
                <div className="rc-track-top">
                    <button onClick={handleCloseOrder}>‹</button>
                    <span>Order Tracking</span>
                    <b>RC</b>
                </div>

                <div className="rc-track-hero">
                    <div className="rc-track-chef">
                        <span>👨‍🍳</span>
                    </div>

                    <div className="rc-track-success">Payment Successful ✅</div>
                    <h1>{isReady ? 'Order is Ready!' : isCancelled ? 'Order Cancelled' : 'Your food is cooking'}</h1>
                    <p>
                        {isReady
                            ? 'Please collect your order from the counter.'
                            : isCancelled
                                ? 'Your order has been cancelled.'
                                : 'We have received your order and kitchen has started preparing it.'}
                    </p>
                </div>

                <div className="rc-track-card">
                    <div className="rc-track-status-head">
                        <div>
                            <small>Live Status</small>
                            <strong>{isReady ? 'Ready to Serve' : isCancelled ? 'Cancelled' : 'Preparing'}</strong>
                        </div>
                        <span className={`rc-track-badge ${isReady ? 'ready' : isCancelled ? 'cancelled' : 'preparing'}`}>
                            {isReady ? '🟢 Ready' : isCancelled ? '🔴 Cancelled' : '🟡 Preparing'}
                        </span>
                    </div>

                    <div className="rc-track-progress">
                        <div style={{ width: `${progressPercent}%` }} />
                    </div>

                    <div className="rc-track-steps">
                        <div className="active">
                            <span>✓</span>
                            <p>Confirmed</p>
                        </div>
                        <div className={!isCancelled ? 'active' : ''}>
                            <span>🍳</span>
                            <p>Preparing</p>
                        </div>
                        <div className={isReady ? 'active' : ''}>
                            <span>🍽️</span>
                            <p>Ready</p>
                        </div>
                    </div>
                </div>

                <div className="rc-track-card rc-track-info">
                    <div>
                        <span>Restaurant</span>
                        <strong>{order.hotelName || 'RC Dine Partner'}</strong>
                    </div>
                    <div>
                        <span>Order No.</span>
                        <strong>#{order.orderNumber || order.orderId}</strong>
                    </div>
                    <div>
                        <span>Table</span>
                        <strong>Table {order.tableNumber || '-'}</strong>
                    </div>
                    <div>
                        <span>Total Paid</span>
                        <strong>₹{order.totalPrice || 0}</strong>
                    </div>
                </div>

                {!isReady && !isCancelled && (
                    <div className="rc-track-offer">
                        <div>
                            <b>Want to add more?</b>
                            <p>You can go back to menu and add extra items.</p>
                        </div>
                        <button onClick={() => navigate(getCustomerOrderRoute())}>Menu</button>
                    </div>
                )}

                <div className="rc-track-actions">
                    <button className="rc-track-primary" onClick={handleDownloadInvoice} disabled={downloadingInvoice}>
                        {downloadingInvoice ? 'Downloading...' : 'Download Invoice'}
                    </button>

                    {!isReady && !isCancelled && cancellationTimeLeft > 0 && (
                        <button className="rc-track-warning" onClick={handleCancelOrder} disabled={cancellingOrder}>
                            {cancellingOrder ? 'Cancelling...' : `Cancel Order (${Math.ceil(cancellationTimeLeft / 60)}m)`}
                        </button>
                    )}

                    {(isReady || isCancelled) && (
                        <button className="rc-track-done" onClick={handleCloseOrder}>
                            Close Order
                        </button>
                    )}
                </div>
            </div>

            {showReadyModal && (
                <OMTModal
                    show={showReadyModal}
                    title="Order Ready"
                    description="Your order is ready. Please collect your order."
                    handleClose={() => setShowReadyModal(false)}
                    submitText="Okay"
                    handleSubmit={() => setShowReadyModal(false)}
                    isFooter={true}
                    size="md"
                />
            )}
        </div>
    );
}

export default OrderTracking;
