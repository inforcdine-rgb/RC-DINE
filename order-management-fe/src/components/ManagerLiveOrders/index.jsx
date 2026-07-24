import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { connectSocket } from '../../services/socket.service';
import { playManagerBell, playOrderCancelledSound } from '../../utils/sound';

function ManagerLiveOrders() {
    const hotelId = useSelector((state) => state.hotel.globalHotelId);

    useEffect(() => {
        if (!hotelId) return undefined;

        const socket = connectSocket();

        const joinHotelRoom = () => {
            socket.emit('join-hotel', hotelId);
        };

        const handleNewOrder = (payload) => {
            if (String(payload?.hotelId) !== String(hotelId)) {
                return;
            }

            const isManagerPosOrder =
                payload?.source === 'MANAGER_POS' ||
                payload?.type === 'MANAGER_POS';

            if (isManagerPosOrder) {
                return;
            }

            const orderKey = payload?.orderId || payload?.orderNumber || Date.now();
            playManagerBell(orderKey);
            window.dispatchEvent(new CustomEvent('rcdine:manager-notification', {
                detail: { key: `new-order:${orderKey}` }
            }));

            const tableLabel =
                payload?.tableNumber &&
                Number(payload.tableNumber) > 0
                    ? `Table ${payload.tableNumber}`
                    : 'Customer QR';

            toast.info(`🔔 New order received from ${tableLabel}`, {
                toastId: `new-order-${payload?.orderId || payload?.orderNumber || Date.now()}`,
                position: 'top-right',
                autoClose: 6000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });
        };

        const handleOrderCancelled = (payload) => {
            if (String(payload?.hotelId) !== String(hotelId)) return;

            const orderKey = payload?.orderId || payload?.orderNumber || Date.now();
            playOrderCancelledSound(orderKey);
            window.dispatchEvent(new CustomEvent('rcdine:manager-notification', {
                detail: { key: `order-cancelled:${orderKey}` }
            }));

            const tableLabel =
                payload?.tableNumber && Number(payload.tableNumber) > 0
                    ? `Table ${payload.tableNumber}`
                    : 'Customer order';

            toast.error(
                `❌ ${tableLabel}${payload?.orderNumber ? ` · ${payload.orderNumber}` : ''} cancelled`,
                {
                    toastId: `order-cancelled-${orderKey}`,
                    position: 'top-right',
                    autoClose: 6000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true
                }
            );
        };

        if (socket.connected) {
            joinHotelRoom();
        }

        socket.on('connect', joinHotelRoom);
        socket.on('new-order', handleNewOrder);
        socket.on('order-cancelled', handleOrderCancelled);

        return () => {
            socket.emit('leave-hotel', hotelId);
            socket.off('connect', joinHotelRoom);
            socket.off('new-order', handleNewOrder);
            socket.off('order-cancelled', handleOrderCancelled);
        };
    }, [hotelId]);

    return null;
}

export default ManagerLiveOrders;
