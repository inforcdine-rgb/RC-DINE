import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import defaultLogo from '../../assets/images/R-C DINE.png';
import SmartImage from '../../components/SmartImage';
import ThermalReceipt from '../../components/ThermalReceipt';
import features from '../../config/features';
import * as hotelService from '../../services/hotel.service';
import * as managerRcSessionService from '../../services/managerRcSession.service';
import * as menuService from '../../services/menu.service';
import * as orderService from '../../services/order.service';
import {
    loadPrinterSettings,
    readPrinterSettings
} from '../../services/printerSettings.service';
import { connectSocket } from '../../services/socket.service';
import * as tableService from '../../services/tables.service';
import { registerRefreshHandler, runBackgroundTask } from '../../utils/refreshBus';
import '../../assets/styles/walkinPOS.css';
import '../../assets/styles/managerStatusPopup.css';

const getRows = (res) => res?.rows || res?.data?.rows || res?.data || res || [];
const getId = (item) => item.id || item.value;
const getName = (item) => item.name || item.label || item.menuName || item.title || 'Menu Item';
const getPrice = (item) => Number(item.price || item.menuPrice || item.amount || 0);
const getImage = (item) => item.image || item.imageUrl || item.photo || item.photoUrl || '';
const getCategoryName = (cat) => cat.name || cat.label || 'Menu';
const toMoney = (value) => Number((Number(value || 0) + Number.EPSILON).toFixed(2));
const toPaise = (value) => Math.round(toMoney(value) * 100);
const createRequestKey = (prefix) => `${prefix}-${window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`}`;
const getOpenOrderType = (selection) => ({
    'Dine In': 'DINE_IN',
    'Walk In': 'WALK_IN',
    Parcel: 'PARCEL',
    'Take Away': 'TAKE_AWAY'
}[selection?.type] || 'WALK_IN');
const formatElapsed = (createdAt, now = Date.now()) => {
    const minutes = Math.max(0, Math.floor((now - new Date(createdAt).getTime()) / 60000));
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};

function ManagerPOS() {
    const location = useLocation();
    const navigate = useNavigate();
    const hotelId = useSelector((state) => state.hotel.globalHotelId);
    const loggedInUser = useSelector((state) => state.user?.data);
    const [step, setStep] = useState(1);
    const [tables, setTables] = useState([]);
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedType, setSelectedType] = useState(null);
    const [customerName, setCustomerName] = useState('');
    const [mobile, setMobile] = useState('');
    const [notes, setNotes] = useState('');
    const [cart, setCart] = useState({});
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [cashReceived, setCashReceived] = useState('');
    const [createdOrder, setCreatedOrder] = useState(null);
    const [printRequested, setPrintRequested] = useState(false);
    const [printerSettings, setPrinterSettings] = useState({ printerWidth: '58', address: '', phone: '', gstNumber: '', footerMessage: 'Thank you! Visit again.' });
    const [hotelName, setHotelName] = useState('R&C DINE');
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(false);
    const [dashboardOrders, setDashboardOrders] = useState([]);
    const dashboardOrdersRef = useRef([]);
    dashboardOrdersRef.current = dashboardOrders;
    const [dashboardLoading, setDashboardLoading] = useState(false);
    const [statusPopup, setStatusPopup] = useState(null);
    const [selectedDashboardOrder, setSelectedDashboardOrder] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [gstEnabled, setGstEnabled] = useState(false);
    const [gstPercent, setGstPercent] = useState(0);
    const [discountEnabled, setDiscountEnabled] = useState(false);
    const [discountType, setDiscountType] = useState(null);
    const [discountValue, setDiscountValue] = useState(0);
    const [mobileCartOpen, setMobileCartOpen] = useState(false);
    const [foodTypeFilter, setFoodTypeFilter] = useState('ALL');
    const [priceSort, setPriceSort] = useState('NONE');
    const [openOrders, setOpenOrders] = useState([]);
    const openOrdersRef = useRef([]);
    openOrdersRef.current = openOrders;
    const [openOrdersLoading, setOpenOrdersLoading] = useState(false);
    const [activeOpenOrder, setActiveOpenOrder] = useState(null);
    const [selectedOpenOrder, setSelectedOpenOrder] = useState(null);
    const [billingOrder, setBillingOrder] = useState(null);
    const [billForm, setBillForm] = useState({ discountType: '', discountValue: 0, tipAmount: 0 });
    const [kotPrintData, setKotPrintData] = useState(null);
    const [nowTick, setNowTick] = useState(Date.now());
    const [rcSessionModalOpen, setRcSessionModalOpen] = useState(false);
    const [rcSessionRows, setRcSessionRows] = useState([]);
    const [rcSessionLoading, setRcSessionLoading] = useState(false);
    const [rcSessionActionId, setRcSessionActionId] = useState(null);
    const [rcSessionConfirm, setRcSessionConfirm] = useState(null);
    const mutationInFlightRef = useRef(false);
    const createKeyRef = useRef(null);
    const additionKeyRef = useRef(null);
    const paymentKeyRef = useRef(null);

    useEffect(() => {
        const load = async () => {
            if (!hotelId) return;
            setDataLoading(true);
            const settingsRes = await hotelService.getPaymentSettings(hotelId).catch(() => null);
            setGstEnabled(!!settingsRes?.gstEnabled);
            setGstPercent(settingsRes?.gstEnabled ? Number(settingsRes?.gstPercent || 0) : 0);
            setDiscountEnabled(!!settingsRes?.discountEnabled);
            setDiscountType(settingsRes?.discountType || null);
            setDiscountValue(settingsRes?.discountEnabled ? Number(settingsRes?.discountValue || 0) : 0);
            setHotelName(settingsRes?.razorpayMerchantName || settingsRes?.name || 'R&C DINE');
            const cachedPrinter = readPrinterSettings(hotelId);
            const savedPrinter = await loadPrinterSettings(hotelId).catch(() => cachedPrinter);

            setPrinterSettings({
                printerWidth: ['58', '80', 'auto'].includes(savedPrinter.printerWidth)
                    ? savedPrinter.printerWidth
                    : '58',
                address: String(settingsRes?.address || '').slice(0, 250),
                phone: String(settingsRes?.careNumber || '').slice(0, 20),
                gstNumber: String(settingsRes?.gstNumber || '').slice(0, 15),
                footerMessage: 'Thank you! Visit again.'
            });
            const tableRes = await tableService.fetch(hotelId);
            setTables(getRows(tableRes));
            const catRes = await menuService.getCategories(hotelId);
            const cats = getRows(catRes);
            setCategories(cats);
            const menuRows = [];
            await Promise.all(
                cats.map(async (cat) => {
                    const categoryId = getId(cat);
                    const res = await menuService.fetchMenuItems({ categoryId, limit: 500 });
                    getRows(res).forEach((item) => {
                        menuRows.push({
                            ...item,
                            categoryId,
                            categoryName: getCategoryName(cat)
                        });
                    });
                })
            );
            setItems(menuRows.filter((item) => getId(item)));
            setDataLoading(false);
        };
        load().catch((error) => {
            setDataLoading(false);
            toast.error(error?.response?.data?.message || error.message || 'POS data load failed');
        });
    }, [hotelId]);

    const loadDashboardOrders = useCallback(async ({ silent = false } = {}) => {
        if (!hotelId) return false;
        try {
            if (!silent && dashboardOrdersRef.current.length === 0) setDashboardLoading(true);
            const result = await orderService.getCompletedOrders({
                hotelId,
                skip: 0,
                limit: 50,
                sortKey: 'orderTime',
                sortOrder: 'desc'
            });
            const rows = result?.data || result?.rows || [];
            const getFingerprint = (orders) => JSON.stringify(orders.map((order) => [
                order.orderId,
                order.orderStatus,
                order.updatedAt,
                order.totalPrice,
                order.tableNumber
            ]));
            const before = getFingerprint(dashboardOrdersRef.current);
            const after = getFingerprint(rows);
            const changed = before !== after;
            if (changed) setDashboardOrders(rows);
            return changed;
        } catch (error) {
            console.error('Failed to load POS dashboard orders', error);
            return false;
        } finally {
            setDashboardLoading(false);
        }
    }, [hotelId]);

    const loadOpenOrders = useCallback(async ({ silent = false } = {}) => {
        if (!hotelId) return false;
        try {
            if (!silent && openOrdersRef.current.length === 0) setOpenOrdersLoading(true);
            const result = await orderService.getOpenOrders(hotelId);
            const rows = result?.orders || result?.data?.orders || [];
            const fingerprint = (values) => JSON.stringify(values.map((order) => [
                order.id,
                order.status,
                order.revision,
                order.itemCount,
                order.runningTotal,
                order.updatedAt
            ]));
            const changed = fingerprint(openOrdersRef.current) !== fingerprint(rows);
            if (changed) setOpenOrders(rows);
            return changed;
        } catch (error) {
            if (!silent) toast.error(error.message || 'Open orders load failed');
            return false;
        } finally {
            setOpenOrdersLoading(false);
        }
    }, [hotelId]);
    useEffect(() => {
        if (!hotelId) return undefined;

        const socket = connectSocket();

        const joinHotelRoom = () => {
            socket.emit('join-hotel', hotelId);
            console.log(`Manager POS joined live hotel room: ${hotelId}`);
        };

        const handleNewOrder = (payload) => {
            if (String(payload?.hotelId) !== String(hotelId)) return;
            const incoming = payload?.order || {};
            const orderId = incoming.orderId || payload?.orderId;
            if (!orderId) {
                runBackgroundTask(() => loadDashboardOrders({ silent: true }));
                return;
            }

            const nextOrder = {
                ...incoming,
                orderId,
                orderNumber: incoming.orderNumber || payload?.orderNumber,
                orderStatus: incoming.orderStatus || incoming.status || 'PENDING',
                orderTime: incoming.orderTime || incoming.createdAt || payload?.createdAt,
                tableNumber: incoming.tableNumber || payload?.tableNumber,
                updatedAt: incoming.updatedAt || payload?.createdAt
            };
            const withoutDuplicate = dashboardOrdersRef.current.filter(
                (order) => String(order.orderId) !== String(orderId)
            );
            const nextOrders = [nextOrder, ...withoutDuplicate].slice(0, 50);
            dashboardOrdersRef.current = nextOrders;
            setDashboardOrders(nextOrders);
        };

        const handleOrderStatusUpdated = (payload) => {
            if (String(payload?.hotelId) !== String(hotelId)) return;
            const index = dashboardOrdersRef.current.findIndex(
                (order) => String(order.orderId) === String(payload?.orderId)
            );
            if (index < 0 || !payload?.status) {
                runBackgroundTask(() => loadDashboardOrders({ silent: true }));
                return;
            }

            const nextOrders = dashboardOrdersRef.current.map((order, orderIndex) => orderIndex === index
                ? { ...order, orderStatus: payload.status, updatedAt: payload.updatedAt || order.updatedAt }
                : order);
            dashboardOrdersRef.current = nextOrders;
            setDashboardOrders(nextOrders);
        };

        const handleOpenOrderEvent = (payload) => {
            if (String(payload?.hotelId) !== String(hotelId)) return;
            runBackgroundTask(async () => {
                await loadOpenOrders({ silent: true });
                if (activeOpenOrder?.id && String(activeOpenOrder.id) === String(payload?.orderId)) {
                    const detail = await orderService.getOpenOrder(activeOpenOrder.id);
                    setActiveOpenOrder(detail?.order || detail);
                }
            });
        };

        const openOrderEvents = [
            'open-order:created',
            'open-order:updated',
            'open-order:item-added',
            'open-order:bill-generated',
            'open-order:payment-completed',
            'open-order:closed',
            'open-order:table-freed'
        ];

        if (socket.connected) {
            joinHotelRoom();
        }

        socket.on('connect', joinHotelRoom);
        socket.on('new-order', handleNewOrder);
        socket.on('order-status-updated', handleOrderStatusUpdated);
        openOrderEvents.forEach((eventName) => socket.on(eventName, handleOpenOrderEvent));

        return () => {
            socket.off('connect', joinHotelRoom);
            socket.off('new-order', handleNewOrder);
            socket.off('order-status-updated', handleOrderStatusUpdated);
            openOrderEvents.forEach((eventName) => socket.off(eventName, handleOpenOrderEvent));
        };
    }, [activeOpenOrder?.id, hotelId, loadDashboardOrders, loadOpenOrders]);

    useEffect(() => {
        loadDashboardOrders();
        loadOpenOrders();
        const timer = setInterval(
            () => runBackgroundTask(() => Promise.all([
                loadDashboardOrders({ silent: true }),
                loadOpenOrders({ silent: true })
            ])),
            15000
        );
        return () => clearInterval(timer);
    }, [loadDashboardOrders, loadOpenOrders]);

    useEffect(
        () => registerRefreshHandler('manager-pos', () => Promise.all([
            loadDashboardOrders({ silent: true }),
            loadOpenOrders({ silent: true })
        ])),
        [loadDashboardOrders, loadOpenOrders]
    );

    useEffect(() => {
        const timer = window.setInterval(() => setNowTick(Date.now()), 60000);
        return () => window.clearInterval(timer);
    }, []);

    const getStatusKey = (status = '') => String(status).toUpperCase().replace(/\s+/g, '_');
    const getSourceLabel = (order) => (order?.source === 'MANAGER_POS' ? '🟢 Manager POS' : '📱 Customer QR');
    const recentOrders = dashboardOrders.slice(0, 5);
    const pendingCount = dashboardOrders.filter((order) => getStatusKey(order.orderStatus) === 'PENDING').length;
    const completedTodayOrders = dashboardOrders.filter((order) => {
        const orderDate = order.orderTime ? new Date(order.orderTime) : null;
        const today = new Date();
        return (
            getStatusKey(order.orderStatus) === 'COMPLETED' &&
            orderDate &&
            orderDate.getDate() === today.getDate() &&
            orderDate.getMonth() === today.getMonth() &&
            orderDate.getFullYear() === today.getFullYear()
        );
    });
    const pendingOrders = dashboardOrders.filter((order) => getStatusKey(order.orderStatus) === 'PENDING');
    const completedTodayCount = completedTodayOrders.length;
    const activeRcSessions = rcSessionRows.filter((row) => row.session).length;
    const dashboardStats = [
        { label: 'Open Orders', value: openOrders.length, note: 'Live running', status: 'OPEN' },
        { label: 'Pending', value: pendingCount, note: 'Live counter', status: 'PENDING' },
        { label: 'Completed', value: completedTodayCount, note: 'Today', status: 'COMPLETED' },
        ...(features.managerSessionControls ? [{
            label: 'RC Session Control',
            value: rcSessionRows.length ? `${activeRcSessions} / ${rcSessionRows.length}` : tables.length,
            note: 'Table-wise control',
            status: 'RC_SESSION'
        }] : [])
    ];
    const popupOrders = statusPopup === 'PENDING' ? pendingOrders : completedTodayOrders;

    const openDashboardOrderDetails = async (order) => {
        if (!order?.orderId || !hotelId) return;
        try {
            setDetailsLoading(true);
            const result = await orderService.getOrderDetails(hotelId, order.orderId);
            const details = result?.data || result?.order || result || order;
            setSelectedDashboardOrder({ ...order, ...details });
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message || 'Order details load nahi hua');
        } finally {
            setDetailsLoading(false);
        }
    };

    const closeDashboardPopups = () => {
        setStatusPopup(null);
        setSelectedDashboardOrder(null);
    };

    const loadRcSessionRows = async () => {
        if (!tables.length) {
            setRcSessionRows([]);
            return;
        }
        setRcSessionLoading(true);
        try {
            const rows = await Promise.all(tables.map(async (table) => {
                const tableId = getId(table);
                try {
                    const details = await managerRcSessionService.getManagerRcSession(tableId);
                    return { table, tableId, ...details };
                } catch (error) {
                    return { table, tableId, error: error.message };
                }
            }));
            setRcSessionRows(rows);
        } finally {
            setRcSessionLoading(false);
        }
    };

    const openRcSessionControl = async () => {
        setRcSessionModalOpen(true);
        setRcSessionConfirm(null);
        await loadRcSessionRows();
    };

    const runRcSessionAction = async (row, action) => {
        try {
            setRcSessionActionId(row.tableId);
            await managerRcSessionService.setManagerTableAction(row.tableId, action);
            toast.success('RC Session status updated');
            await loadRcSessionRows();
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message || 'Session update failed');
        } finally {
            setRcSessionActionId(null);
        }
    };

    const completeRcSession = async (row, keepTableActive) => {
        try {
            setRcSessionActionId(row.tableId);
            await managerRcSessionService.closeManagerRcSession(row.tableId, keepTableActive);
            setRcSessionConfirm(null);
            toast.success(keepTableActive ? 'Session closed; QR kept ON' : 'Session closed; QR turned OFF');
            await loadRcSessionRows();
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message || 'Session close failed');
        } finally {
            setRcSessionActionId(null);
        }
    };

    const tableOptions = useMemo(() => {
        const base = tables.map((table) => ({
            id: getId(table),
            label: table.label || `Table ${table.tableNumber || table.number}`,
            tableNumber: Number(table.tableNumber || table.number || 0),
            type: 'Dine In',
            status: String(table.status || '').toUpperCase(),
            disabled: false
        }));

        return [
            ...base,
            {
                id: 'walk-in',
                label: 'Walk-in',
                tableNumber: 0,
                type: 'Walk In'
            },
            {
                id: 'parcel',
                label: 'Parcel',
                tableNumber: 0,
                type: 'Parcel'
            },
            {
                id: 'take-away',
                label: 'Take Away',
                tableNumber: 0,
                type: 'Take Away'
            }
        ];
    }, [tables]);

    const cartItems = Object.values(cart);
    const subtotal = toMoney(
        cartItems.reduce(
            (sum, item) => sum + toMoney(item.price) * Number(item.quantity || 0),
            0
        )
    );
    const activeGstPercent = gstEnabled ? Number(gstPercent || 0) : 0;
    const activeDiscountValue = discountEnabled ? Number(discountValue || 0) : 0;
    const rawDiscount = discountType === 'PERCENT'
        ? subtotal * (Math.min(100, activeDiscountValue) / 100)
        : activeDiscountValue;
    const discountAmount = discountEnabled ? toMoney(Math.min(subtotal, rawDiscount)) : 0;
    const taxableAmount = toMoney(Math.max(0, subtotal - discountAmount));
    const gst = toMoney(taxableAmount * (activeGstPercent / 100));
    const total = toMoney(taxableAmount + gst);
    const paymentSubtotal = activeOpenOrder?.status === 'BILLED'
        ? toMoney(activeOpenOrder.subtotalAmount)
        : subtotal;
    const paymentDiscount = activeOpenOrder?.status === 'BILLED'
        ? toMoney(activeOpenOrder.discountAmount)
        : discountAmount;
    const paymentGst = activeOpenOrder?.status === 'BILLED'
        ? toMoney(Number(activeOpenOrder.cgstAmount) + Number(activeOpenOrder.sgstAmount))
        : gst;
    const paymentTip = activeOpenOrder?.status === 'BILLED'
        ? toMoney(activeOpenOrder.tipAmount)
        : 0;
    const paymentTotal = activeOpenOrder?.status === 'BILLED'
        ? toMoney(activeOpenOrder.finalAmount)
        : total;
    const change = toMoney(Math.max(0, toMoney(cashReceived) - paymentTotal));
    const totalQty = cartItems.reduce((sum, item) => sum + Number(item.quantity), 0);
    const existingOrderTotal = toMoney(activeOpenOrder?.subtotalAmount || 0);
    const runningOrderTotal = toMoney(existingOrderTotal + subtotal);

    const filteredItems = useMemo(() => {
        const query = search.trim().toLowerCase();

        const nextItems = items.filter((item) => {
            const searchableText = `${getName(item)} ${item.categoryName || ''} ${item.description || ''}`.toLowerCase();
            const matchSearch = !query || searchableText.includes(query);
            const matchCategory = query || activeCategory === 'all' || item.categoryId === activeCategory;
            const itemFoodType = String(item.foodType || item.food_type || '').toUpperCase();
            const matchFoodType =
                foodTypeFilter === 'ALL' ||
                (foodTypeFilter === 'VEG' && itemFoodType === 'VEG') ||
                (foodTypeFilter === 'NON_VEG' && ['NON_VEG', 'NON-VEG', 'NONVEG'].includes(itemFoodType));

            return matchCategory && matchSearch && matchFoodType;
        });

        if (priceSort === 'LOW_HIGH') {
            return [...nextItems].sort((a, b) => getPrice(a) - getPrice(b));
        }

        if (priceSort === 'HIGH_LOW') {
            return [...nextItems].sort((a, b) => getPrice(b) - getPrice(a));
        }

        return nextItems;
    }, [activeCategory, foodTypeFilter, items, priceSort, search]);

    const addItem = (item) => {
        const id = getId(item);
        setCart((prev) => ({
            ...prev,
            [id]: {
                menuId: id,
                menuName: getName(item),
                price: getPrice(item),
                quantity: (prev[id]?.quantity || 0) + 1
            }
        }));
    };

    const updateQty = (id, diff) => {
        setCart((prev) => {
            const next = { ...prev };
            const qty = (next[id]?.quantity || 0) + diff;
            if (qty <= 0) delete next[id];
            else next[id] = { ...next[id], quantity: qty };
            return next;
        });
    };

    const startNewOrder = () => {
        setStep(2);
        setSelectedType(null);
        setActiveOpenOrder(null);
        setCart({});
        setCreatedOrder(null);
        setPaymentMethod('Cash');
        setCashReceived('');
        setCustomerName('');
        setMobile('');
        setNotes('');
        setSearch('');
        setActiveCategory('all');
        setMobileCartOpen(false);
        setFoodTypeFilter('ALL');
        setPriceSort('NONE');
        createKeyRef.current = createRequestKey('open');
        additionKeyRef.current = null;
        paymentKeyRef.current = null;
    };

    const goItems = async () => {
        if (!selectedType) {
            toast.warn('Table / Parcel / Take Away select karo');
            return;
        }
        if (mutationInFlightRef.current) return;
        try {
            mutationInFlightRef.current = true;
            setLoading(true);
            const result = await orderService.createOpenOrder({
                hotelId,
                tableId: selectedType.type === 'Dine In' ? selectedType.id : null,
                orderType: getOpenOrderType(selectedType),
                customerName: customerName || null,
                customerPhone: mobile || null,
                notes: notes || null,
                idempotencyKey: createKeyRef.current || createRequestKey('open')
            });
            const order = result?.order || result;
            setActiveOpenOrder(order);
            createKeyRef.current = null;
            setStep(3);
            await loadOpenOrders({ silent: true });
            toast.success(`Open order ${order.orderNumber} created`);
        } catch (error) {
            toast.error(error.message || 'Open order create failed');
        } finally {
            mutationInFlightRef.current = false;
            setLoading(false);
        }
    };

    const saveOpenOrderItems = async () => {
        if (!cartItems.length) {
            toast.warn('Cart empty hai');
            return;
        }
        if (!activeOpenOrder?.id || activeOpenOrder.status !== 'OPEN') {
            toast.error('This order is no longer editable');
            return;
        }
        if (mutationInFlightRef.current) return;
        try {
            mutationInFlightRef.current = true;
            setLoading(true);
            if (!additionKeyRef.current) additionKeyRef.current = createRequestKey('items');
            const result = await orderService.addOpenOrderItems(activeOpenOrder.id, {
                idempotencyKey: additionKeyRef.current,
                expectedRevision: activeOpenOrder.revision,
                items: cartItems.map((item) => ({
                    menuId: item.menuId,
                    quantity: item.quantity
                }))
            });
            const order = result?.order || result;
            setActiveOpenOrder(order);
            setCart({});
            additionKeyRef.current = null;
            setMobileCartOpen(false);
            await loadOpenOrders({ silent: true });
            toast.success(
                `${totalQty} item${totalQty === 1 ? '' : 's'} added to ${order.orderNumber}. Print KOT manually from Open Orders.`
            );
            // KOT must never print automatically after adding items.
            // Newly added items remain unprinted until the manager explicitly
            // selects the separate "Print KOT" action from the Open Orders card.
            setKotPrintData(null);
            setStep(1);
        } catch (error) {
            toast.error(error.message || 'Items add failed');
        } finally {
            mutationInFlightRef.current = false;
            setLoading(false);
        }
    };

    const resumeOpenOrder = async (order) => {
        if (order.status !== 'OPEN') {
            toast.info('Bill generated hai; editing locked hai');
            return;
        }
        try {
            setLoading(true);
            const result = await orderService.getOpenOrder(order.id);
            const detail = result?.order || result;
            setActiveOpenOrder(detail);
            setSelectedType({
                id: detail.tableId || detail.orderType.toLowerCase(),
                label: detail.table ? `Table ${detail.table.tableNumber}` : detail.orderType.replaceAll('_', ' '),
                tableNumber: detail.table?.tableNumber || 0,
                type: {
                    DINE_IN: 'Dine In',
                    WALK_IN: 'Walk In',
                    PARCEL: 'Parcel',
                    TAKE_AWAY: 'Take Away'
                }[detail.orderType]
            });
            setCustomerName(detail.customerName || '');
            setMobile(detail.customerPhone || '');
            setNotes(detail.notes || '');
            setCart({});
            additionKeyRef.current = null;
            paymentKeyRef.current = null;
            setStep(3);
        } catch (error) {
            toast.error(error.message || 'Order resume failed');
        } finally {
            setLoading(false);
        }
    };

    const viewOpenOrder = async (order) => {
        try {
            setDetailsLoading(true);
            const result = await orderService.getOpenOrder(order.id);
            setSelectedOpenOrder(result?.order || result);
        } catch (error) {
            toast.error(error.message || 'Open order details load failed');
        } finally {
            setDetailsLoading(false);
        }
    };

    const printOpenOrderKot = async (order) => {
        try {
            setLoading(true);
            const result = await orderService.printOpenOrderKot(order.id);
            if (!result?.items?.length) {
                toast.info('No new items for KOT');
                return;
            }
            setKotPrintData({ ...result, tableLabel: order.table ? `Table ${order.table.tableNumber}` : order.orderType.replaceAll('_', ' ') });
            toast.success(`KOT batch ${result.batchNumber} ready`);
        } catch (error) {
            toast.error(error.message || 'KOT failed');
        } finally {
            setLoading(false);
        }
    };

    const cancelOpenOrder = async (order) => {
        if (!window.confirm(`Cancel ${order.orderNumber}? This cannot be undone.`)) return;
        try {
            setLoading(true);
            await orderService.closeOpenOrder(order.id, {
                cancel: true,
                freeTable: false,
                reason: 'Cancelled from Manager POS'
            });
            await loadOpenOrders({ silent: true });
            toast.success('Open order cancelled');
        } catch (error) {
            toast.error(error.message || 'Order cancel failed');
        } finally {
            setLoading(false);
        }
    };

    const openBilling = (order) => {
        paymentKeyRef.current = null;
        if (order.status === 'BILLED') {
            orderService.getOpenOrder(order.id).then((result) => {
                const detail = result?.order || result;
                setActiveOpenOrder(detail);
                setCashReceived(Number(detail.finalAmount).toFixed(2));
                setStep(4);
            }).catch((error) => toast.error(error.message || 'Bill load failed'));
            return;
        }
        setBillingOrder(order);
        setBillForm({
            discountType: discountEnabled ? (discountType || '') : '',
            discountValue: discountEnabled ? Number(discountValue || 0) : 0,
            tipAmount: 0
        });
    };

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const openOrderId = query.get('openOrderId');
        const action = query.get('action') || 'add';
        if (!openOrderId || !hotelId || !openOrders.length) return;

        const matchedOrder = openOrders.find(
            (order) => String(order.id) === String(openOrderId)
        );
        if (!matchedOrder) return;

        if (action === 'payment') {
            openBilling(matchedOrder);
        } else if (matchedOrder.status === 'OPEN') {
            resumeOpenOrder(matchedOrder);
        } else {
            toast.info('Bill generate hone ke baad items add nahi kar sakte');
        }

        navigate('/walkin-pos', { replace: true });
    // Run only when the requested order becomes available in the open-order list.
    }, [hotelId, location.search, navigate, openOrders]);

    const generateBill = async () => {
        if (!billingOrder?.id) return;
        try {
            setLoading(true);
            const result = await orderService.generateOpenOrderBill(billingOrder.id, {
                discountType: billForm.discountType || null,
                discountValue: Number(billForm.discountValue || 0),
                tipAmount: Number(billForm.tipAmount || 0),
                idempotencyKey: createRequestKey('bill')
            });
            const order = result?.order || result;
            setActiveOpenOrder(order);
            setBillingOrder(null);
            setPaymentMethod('Cash');
            setCashReceived(Number(order.finalAmount).toFixed(2));
            await loadOpenOrders({ silent: true });
            setStep(4);
            toast.success('Bill generated. Order editing is now locked.');
        } catch (error) {
            toast.error(error.message || 'Bill generation failed');
        } finally {
            setLoading(false);
        }
    };

    const confirmOrder = async (shouldPrint = false) => {
        if (!activeOpenOrder?.id || activeOpenOrder.status !== 'BILLED') {
            toast.error('Generate bill before payment');
            return;
        }
        if (mutationInFlightRef.current) return;
        try {
            mutationInFlightRef.current = true;
            setLoading(true);
            if (!paymentKeyRef.current) paymentKeyRef.current = createRequestKey('payment');
            const result = await orderService.payOpenOrder(activeOpenOrder.id, {
                paymentMethod: paymentMethod.toUpperCase(),
                cashReceived: paymentMethod === 'Cash' ? toMoney(cashReceived) : 0,
                idempotencyKey: paymentKeyRef.current
            });
            const savedOrder = result?.order || result;
            setCreatedOrder(savedOrder);
            paymentKeyRef.current = null;
            setActiveOpenOrder(savedOrder);
            setPrintRequested(shouldPrint);
            await Promise.all([
                loadDashboardOrders({ silent: true }),
                loadOpenOrders({ silent: true })
            ]);
            toast.success('Payment completed');
            setStep(5);
        } catch (error) {
            toast.error(error.message || 'Payment failed');
        } finally {
            mutationInFlightRef.current = false;
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!printRequested || !createdOrder || step !== 5) return undefined;
        const timer = window.setTimeout(() => {
            window.print();
            setPrintRequested(false);
        }, 350);
        return () => window.clearTimeout(timer);
    }, [createdOrder, printRequested, step]);

    useEffect(() => {
        if (!kotPrintData) return undefined;
        const timer = window.setTimeout(() => {
            document.body.classList.add('printing-kot');
            window.print();
            document.body.classList.remove('printing-kot');
            setKotPrintData(null);
        }, 250);
        return () => {
            window.clearTimeout(timer);
            document.body.classList.remove('printing-kot');
        };
    }, [kotPrintData]);

    const receiptData = createdOrder
        ? {
            hotelName: createdOrder.hotelName || hotelName,
            address: createdOrder.hotelAddress || printerSettings.address,
            phone: createdOrder.hotelPhone || printerSettings.phone,
            gstNumber: createdOrder.gstNumber || printerSettings.gstNumber,
            footerMessage: printerSettings.footerMessage,
            logo: printerSettings.showLogo ? (createdOrder.hotelLogo || printerSettings.logo || defaultLogo) : null,
            orderNumber: createdOrder.orderNumber,
            tableNumber: createdOrder.table?.tableNumber
                ? `Table ${createdOrder.table.tableNumber}`
                : createdOrder.tableNumber ? `Table ${createdOrder.tableNumber}` : '-',
            orderType: createdOrder.orderType || selectedType?.type || 'Take Away',
            customerName: createdOrder.customerName || customerName || 'Walk-in Guest',
            dateTime: new Date(createdOrder.createdAt || createdOrder.orderTime || Date.now()).toLocaleString(),
            cashierName:
                createdOrder.cashierName ||
                loggedInUser?.name ||
                loggedInUser?.fullName ||
                loggedInUser?.username ||
                'Manager',
            items: createdOrder.items || createdOrder.orderedItems || cartItems,
            subtotal: Number(createdOrder.subtotalAmount ?? createdOrder.subtotal ?? subtotal),
            discountAmount: Number(createdOrder.discountAmount ?? discountAmount),
            cgst: Number(createdOrder.cgstAmount ?? createdOrder.cgst ?? gst / 2),
            sgst: Number(createdOrder.sgstAmount ?? createdOrder.sgst ?? gst / 2),
            tipAmount: Number(createdOrder.tipAmount ?? 0),
            grandTotal: Number(createdOrder.finalAmount ?? createdOrder.totalPrice ?? total),
            paymentMethod: String(createdOrder.paymentMethod || paymentMethod).toUpperCase(),
            cashReceived: Number(createdOrder.cashReceived ?? cashReceived ?? 0),
            changeAmount: Number(
                createdOrder.changeAmount ??
                Math.max(
                    0,
                    Number(createdOrder.cashReceived ?? cashReceived ?? 0) -
                    Number(createdOrder.totalPrice ?? createdOrder.finalAmount ?? total)
                )
            )
        }
        : null;

    const stepTitle = step === 2 ? 'Select Table' : step === 3 ? 'Add Items' : step === 4 ? 'Payment' : step === 5 ? 'Done' : 'Dashboard';

    return (
        <div className="pos-pro-page">
            <div className="pos-pro-header">
                <div>
                    <h1>Manager Dashboard</h1>
                    <span>{stepTitle} · resumable counter and table orders</span>
                </div>
                <button className="pos-primary" onClick={startNewOrder}>+ New Open Order</button>
            </div>

            <div className="pos-dashboard-grid">
                {dashboardStats.map((stat) => (
                    <button
                        type="button"
                        className={`pos-stat-card clickable ${stat.status.toLowerCase()}`}
                        key={stat.label}
                        onClick={() => {
                            if (stat.status === 'OPEN') {
                                document.getElementById('open-orders-section')?.scrollIntoView({ behavior: 'smooth' });
                            } else if (stat.status === 'RC_SESSION') {
                                openRcSessionControl();
                            } else {
                                setStatusPopup(stat.status);
                            }
                        }}
                    >
                        <span>{stat.label}</span>
                        <strong>{dashboardLoading ? '...' : stat.value}</strong>
                        <small>{stat.note} · Tap to view</small>
                    </button>
                ))}
            </div>

            <div className="pos-home-grid">
                <div className="pos-panel pos-hero-panel">
                    <div>
                        <p className="pos-kicker">Quick Billing</p>
                        <h2>Counter order, parcel aur table billing ek hi flow me.</h2>
                        <p>Table select karo, menu add karo, payment lo aur kitchen/bill print ready.</p>
                    </div>
                    <button className="pos-primary wide" onClick={startNewOrder}>+ New Open Order</button>
                </div>
                <div className="pos-panel">
                    <div className="panel-head">
                        <h2>Recent Orders</h2>
                        <button className="view-all-link" onClick={() => { window.location.href = '/orders'; }}>View all</button>
                    </div>
                    {dashboardLoading && !recentOrders.length ? <div className="pos-empty small">Loading real orders...</div> : null}
                    {!dashboardLoading && !recentOrders.length ? <div className="pos-empty small">Abhi koi order nahi hai</div> : null}
                    {recentOrders.map((order) => (
                        <div className="recent-pro-row real" key={order.orderId || order.orderNumber}>
                            <div className="recent-order-main">
                                <b>{order.orderNumber || '-'}</b>
                                <small>{getSourceLabel(order)}</small>
                            </div>
                            <span>{order.tableNumber && order.tableNumber !== '-' ? `Table ${order.tableNumber}` : order.orderType || 'Take Away'}</span>
                            <span>₹{order.totalPrice || order.price || 0}</span>
                            <em className={`status-pill ${String(order.orderStatus || '').toLowerCase()}`}>{order.orderStatus || '-'}</em>
                        </div>
                    ))}
                </div>
            </div>

            <section className="open-orders-section pos-panel" id="open-orders-section">
                <div className="panel-head open-orders-head">
                    <div>
                        <p className="pos-kicker">Live running tabs</p>
                        <h2>Open Orders <span className="open-order-count">{openOrders.length}</span></h2>
                    </div>
                    <button type="button" className="pos-secondary" onClick={() => loadOpenOrders()}>
                        Refresh
                    </button>
                </div>

                {openOrdersLoading && !openOrders.length ? <div className="pos-empty">Loading open orders...</div> : null}
                {!openOrdersLoading && !openOrders.length ? (
                    <div className="open-orders-empty">
                        <b>No running open orders</b>
                        <span>Create one for a table or walk-in customer.</span>
                    </div>
                ) : null}

                <div className="open-order-grid">
                    {openOrders.map((order) => (
                        <article className={`open-order-card ${order.status.toLowerCase()}`} key={order.id}>
                            <div className="open-order-card-head">
                                <div>
                                    <span className="open-order-badge">{order.status}</span>
                                    <h3>{order.table ? `Table ${order.table.tableNumber}` : order.orderType.replaceAll('_', ' ')}</h3>
                                </div>
                                <b>{order.orderNumber}</b>
                            </div>
                            <div className="open-order-customer">
                                <strong>{order.customerName || 'Walk-in Guest'}</strong>
                                {order.customerPhone ? <span>{order.customerPhone}</span> : null}
                            </div>
                            <div className="open-order-metrics">
                                <div><span>Running Total</span><b>₹{Number(order.runningTotal || 0).toFixed(2)}</b></div>
                                <div><span>Items</span><b>{order.itemCount || 0}</b></div>
                                <div><span>Elapsed</span><b>{formatElapsed(order.createdAt, nowTick)}</b></div>
                                <div><span>Last Updated</span><b>{new Date(order.lastUpdated || order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</b></div>
                            </div>
                            <div className="open-order-actions">
                                <button type="button" className="resume" disabled={order.status !== 'OPEN' || loading} onClick={() => resumeOpenOrder(order)}>Resume Order</button>
                                <button type="button" disabled={loading} onClick={() => printOpenOrderKot(order)}>Print KOT</button>
                                <button type="button" onClick={() => viewOpenOrder(order)}>View Details</button>
                                <button type="button" className="danger" disabled={loading} onClick={() => cancelOpenOrder(order)}>Cancel</button>
                                <button type="button" className="bill" disabled={loading} onClick={() => openBilling(order)}>
                                    {order.status === 'BILLED' ? 'Collect Payment' : 'Generate Bill'}
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {features.managerSessionControls && rcSessionModalOpen && (
                <div className="pos-modal" onMouseDown={(event) => {
                    if (event.target === event.currentTarget) setRcSessionModalOpen(false);
                }}>
                    <div className="pos-dialog rc-session-dashboard-dialog">
                        <div className="dialog-head">
                            <div>
                                <p className="pos-kicker">Table-wise control</p>
                                <h2>RC Session Control</h2>
                            </div>
                            <button type="button" onClick={() => setRcSessionModalOpen(false)}>×</button>
                        </div>

                        <div className="rc-session-dashboard-summary">
                            <div><span>Active Sessions</span><strong>{activeRcSessions}</strong></div>
                            <div><span>Total Tables</span><strong>{rcSessionRows.length || tables.length}</strong></div>
                            <button type="button" onClick={loadRcSessionRows} disabled={rcSessionLoading}>
                                {rcSessionLoading ? 'Refreshing...' : 'Refresh'}
                            </button>
                        </div>

                        <div className="rc-session-table-list">
                            {rcSessionLoading && !rcSessionRows.length && <div className="pos-empty">RC Sessions loading...</div>}
                            {!rcSessionLoading && !rcSessionRows.length && <div className="pos-empty">No tables found</div>}
                            {rcSessionRows.map((row) => {
                                const sessionStatus = String(row.session?.status || '').toUpperCase();
                                const isBusy = rcSessionActionId === row.tableId;
                                const tableLabel = row.table?.label || `Table ${row.table?.tableNumber || row.table?.number || ''}`;
                                const stateLabel = row.error
                                    ? 'Unavailable'
                                    : sessionStatus === 'PAYMENT_PENDING'
                                        ? 'Payment Pending'
                                        : row.session
                                            ? 'Active Session'
                                            : row.table?.qrEnabled
                                                ? 'Waiting for Customer'
                                                : 'QR Disabled';
                                const stateClass = row.error
                                    ? 'error'
                                    : sessionStatus === 'PAYMENT_PENDING'
                                        ? 'payment'
                                        : row.session
                                            ? 'active'
                                            : row.table?.qrEnabled ? 'ready' : 'disabled';

                                return (
                                    <div className="rc-session-table-row" key={row.tableId}>
                                        <div className={`rc-session-state-dot ${stateClass}`} />
                                        <div className="rc-session-table-info">
                                            <strong>{tableLabel}</strong>
                                            <span>{stateLabel}</span>
                                            {row.session && <small>Code: {row.session.sessionCode || '—'} · {row.session.sessionMembers?.length || 0} customer(s)</small>}
                                        </div>
                                        <div className="rc-session-row-actions">
                                            {!row.session && !row.table?.qrEnabled && (
                                                <button type="button" disabled={isBusy} onClick={() => runRcSessionAction(row, 'ACTIVATE')}>Enable QR</button>
                                            )}
                                            {!row.session && row.table?.qrEnabled && (
                                                <button type="button" className="muted" disabled={isBusy} onClick={() => runRcSessionAction(row, 'DISABLE')}>Disable QR</button>
                                            )}
                                            {sessionStatus === 'ACTIVE' && (
                                                <button type="button" disabled={isBusy} onClick={() => runRcSessionAction(row, 'PAYMENT_PENDING')}>Collect Payment</button>
                                            )}
                                            {sessionStatus === 'PAYMENT_PENDING' && (
                                                <>
                                                    <button type="button" className="muted" disabled={isBusy} onClick={() => runRcSessionAction(row, 'REOPEN')}>Resume</button>
                                                    <button type="button" className="success" disabled={isBusy} onClick={() => setRcSessionConfirm(row)}>Complete</button>
                                                </>
                                            )}
                                            {isBusy && <span className="rc-session-saving">Saving...</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {features.managerSessionControls && rcSessionConfirm && (
                <div className="pos-modal rc-session-confirm-layer">
                    <div className="pos-dialog rc-session-confirm-dialog">
                        <div className="dialog-head">
                            <h2>Complete & Free Table?</h2>
                            <button type="button" onClick={() => setRcSessionConfirm(null)}>×</button>
                        </div>
                        <div className="rc-session-confirm-body">
                            <p><strong>{rcSessionConfirm.table?.label || 'Selected Table'}</strong> ka current RC Session close ho jayega.</p>
                            <span>Next customer ke liye QR ka status select karo:</span>
                            <div className="rc-session-confirm-actions">
                                <button type="button" className="pos-secondary" onClick={() => setRcSessionConfirm(null)}>Cancel</button>
                                <button type="button" className="pos-secondary danger" disabled={rcSessionActionId === rcSessionConfirm.tableId} onClick={() => completeRcSession(rcSessionConfirm, false)}>Close + QR Off</button>
                                <button type="button" className="pos-primary" disabled={rcSessionActionId === rcSessionConfirm.tableId} onClick={() => completeRcSession(rcSessionConfirm, true)}>Complete + Keep QR On</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {statusPopup && (
                <div className="pos-modal dashboard-orders-modal">
                    <div className="pos-dialog dashboard-orders-dialog">
                        <div className="dialog-head">
                            <div>
                                <h2>{statusPopup === 'PENDING' ? 'Pending Orders' : 'Completed Orders'}</h2>
                                <small>{popupOrders.length} order found</small>
                            </div>
                            <button onClick={closeDashboardPopups}>×</button>
                        </div>

                        {dashboardLoading ? <div className="pos-empty small">Loading orders...</div> : null}
                        {!dashboardLoading && !popupOrders.length ? (
                            <div className="pos-empty small">
                                {statusPopup === 'PENDING' ? 'Abhi pending order nahi hai' : 'Aaj completed order nahi hai'}
                            </div>
                        ) : null}

                        <div className="dashboard-order-list">
                            {popupOrders.map((order) => (
                                <button
                                    type="button"
                                    className="dashboard-order-card"
                                    key={order.orderId || order.orderNumber}
                                    onClick={() => openDashboardOrderDetails(order)}
                                >
                                    <div>
                                        <b>{order.orderNumber || '-'}</b>
                                        <small>{getSourceLabel(order)}</small>
                                    </div>
                                    <div>
                                        <span>{order.tableNumber && order.tableNumber !== '-' ? `Table ${order.tableNumber}` : order.orderType || 'Take Away'}</span>
                                        <strong>₹{order.totalPrice || order.price || 0}</strong>
                                    </div>
                                    <em className={`status-pill ${String(order.orderStatus || '').toLowerCase()}`}>{order.orderStatus || '-'}</em>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {selectedDashboardOrder && (
                <div className="pos-modal dashboard-orders-modal">
                    <div className="pos-dialog dashboard-details-dialog">
                        <div className="dialog-head">
                            <div>
                                <h2>Order Details</h2>
                                <small>{selectedDashboardOrder.orderNumber || '-'}</small>
                            </div>
                            <button onClick={() => setSelectedDashboardOrder(null)}>×</button>
                        </div>

                        {detailsLoading ? <div className="pos-empty small">Loading details...</div> : null}

                        <div className="dashboard-details-top">
                            <div><span>Table</span><b>{selectedDashboardOrder.tableNumber || selectedDashboardOrder.orderType || '-'}</b></div>
                            <div>
                                <span>Status</span>

                                {statusPopup === 'COMPLETED' ? (
                                    <b className="status-pill completed">Completed</b>
                                ) : (
                                    <select
                                        className="form-select"
                                        value={selectedDashboardOrder.orderStatus || 'PENDING'}
                                        onChange={(e) =>
                                            setSelectedDashboardOrder((prev) => ({
                                                ...prev,
                                                orderStatus: e.target.value
                                            }))
                                        }
                                    >
                                        <option value="PENDING">Pending</option>
                                        <option value="COMPLETED">Completed</option>
                                    </select>
                                )}
                            </div>
                            <div><span>Source</span><b>{getSourceLabel(selectedDashboardOrder)}</b></div>
                            <div><span>Total</span><b>₹{selectedDashboardOrder.totalAmount || selectedDashboardOrder.totalPrice || selectedDashboardOrder.price || 0}</b></div>
                        </div>

                        <h3 className="dashboard-details-title">Items</h3>
                        <div className="dashboard-items-list">
                            {(selectedDashboardOrder.orderedItems || selectedDashboardOrder.items || []).length ? (
                                (selectedDashboardOrder.orderedItems || selectedDashboardOrder.items || []).map((item, index) => (
                                    <div className="dashboard-item-row" key={`${item.name || item.menuName}-${index}`}>
                                        <div>
                                            <b>{item.name || item.menuName || 'Item'}</b>
                                            <small>Qty: {item.quantity || 1}</small>
                                        </div>
                                        <strong>₹{item.itemPrice || item.totalPrice || item.price || item.unitPrice || 0}</strong>
                                    </div>
                                ))
                            ) : (
                                <div className="pos-empty small">Item details nahi mila</div>
                            )}
                        </div>

                        <div className="dashboard-details-total">
                            <span>Final Amount</span>
                            <strong>₹{selectedDashboardOrder.totalAmount || selectedDashboardOrder.totalPrice || selectedDashboardOrder.price || 0}</strong>
                        </div>
                        {statusPopup !== 'COMPLETED' && (
                            <div
                                className="dashboard-status-actions"
                                style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    gap: '10px',
                                    marginTop: '20px'
                                }}
                            >
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setSelectedDashboardOrder(null)}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={async () => {
                                        try {
                                            if (
                                                selectedDashboardOrder.orderStatus === 'COMPLETED' &&
                                                !window.confirm('Are you sure?\n\nPending → Completed')
                                            ) {
                                                return;
                                            }

                                            await orderService.updateOrderStatus(
                                                hotelId,
                                                selectedDashboardOrder.orderId,
                                                selectedDashboardOrder.orderStatus
                                            );

                                            toast.success('Order status updated successfully');

                                            await loadDashboardOrders();

                                            setSelectedDashboardOrder(null);
                                            setStatusPopup(null);
                                        } catch (error) {
                                            toast.error(
                                                error?.response?.data?.message ||
                                                error.message ||
                                                'Status update failed'
                                            );
                                        }
                                    }}
                                >
                                    Update
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {selectedOpenOrder && (
                <div className="pos-modal">
                    <div className="pos-dialog open-order-detail-dialog">
                        <div className="dialog-head">
                            <div>
                                <h2>Open Order Details</h2>
                                <small>{selectedOpenOrder.orderNumber}</small>
                            </div>
                            <button type="button" onClick={() => setSelectedOpenOrder(null)}>×</button>
                        </div>
                        <div className="open-detail-summary">
                            <div><span>Table / Type</span><b>{selectedOpenOrder.table ? `Table ${selectedOpenOrder.table.tableNumber}` : selectedOpenOrder.orderType.replaceAll('_', ' ')}</b></div>
                            <div><span>Customer</span><b>{selectedOpenOrder.customerName || 'Walk-in Guest'}</b></div>
                            <div><span>Status</span><b className={`status-pill ${selectedOpenOrder.status.toLowerCase()}`}>{selectedOpenOrder.status}</b></div>
                            <div><span>Running Total</span><b>₹{Number(selectedOpenOrder.subtotalAmount || 0).toFixed(2)}</b></div>
                        </div>
                        <h3 className="dashboard-details-title">Addition Timeline</h3>
                        <div className="open-order-timeline">
                            {(selectedOpenOrder.timeline || []).map((entry) => (
                                <div className="timeline-entry" key={entry.id}>
                                    <time>{new Date(entry.time).toLocaleString()}</time>
                                    <div>
                                        <b>{entry.item} × {entry.quantity}</b>
                                        <span>Added by {entry.addedBy}</span>
                                    </div>
                                    <em className={entry.kotPrintedAt ? 'printed' : 'new'}>
                                        {entry.kotPrintedAt ? 'KOT printed' : 'New for KOT'}
                                    </em>
                                </div>
                            ))}
                            {!selectedOpenOrder.timeline?.length ? <div className="pos-empty small">No items added yet.</div> : null}
                        </div>
                        <div className="dialog-actions">
                            <button type="button" className="pos-secondary" onClick={() => setSelectedOpenOrder(null)}>Close</button>
                            {selectedOpenOrder.status === 'OPEN' ? (
                                <button type="button" className="pos-primary" onClick={() => {
                                    setSelectedOpenOrder(null);
                                    resumeOpenOrder(selectedOpenOrder);
                                }}>Resume Order</button>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}

            {billingOrder && (
                <div className="pos-modal">
                    <div className="pos-dialog generate-bill-dialog">
                        <div className="dialog-head">
                            <div>
                                <h2>Generate Final Bill</h2>
                                <small>{billingOrder.orderNumber} · editing will be locked</small>
                            </div>
                            <button type="button" onClick={() => setBillingOrder(null)}>×</button>
                        </div>
                        <div className="bill-lock-notice">
                            <b>Running subtotal</b>
                            <strong>₹{Number(billingOrder.runningTotal || billingOrder.subtotalAmount || 0).toFixed(2)}</strong>
                        </div>
                        <div className="bill-form-grid">
                            <label>
                                Discount type
                                <select value={billForm.discountType} onChange={(event) => setBillForm((prev) => ({ ...prev, discountType: event.target.value }))}>
                                    <option value="">No discount</option>
                                    <option value="PERCENT">Percent</option>
                                    <option value="FLAT">Flat amount</option>
                                </select>
                            </label>
                            <label>
                                Discount value
                                <input type="number" min="0" max={billForm.discountType === 'PERCENT' ? 100 : undefined} disabled={!billForm.discountType} value={billForm.discountValue} onChange={(event) => setBillForm((prev) => ({ ...prev, discountValue: event.target.value }))} />
                            </label>
                            <label>
                                Tip amount
                                <input type="number" min="0" value={billForm.tipAmount} onChange={(event) => setBillForm((prev) => ({ ...prev, tipAmount: event.target.value }))} />
                            </label>
                        </div>
                        <div className="dialog-actions">
                            <button type="button" className="pos-secondary" onClick={() => setBillingOrder(null)}>Cancel</button>
                            <button type="button" className="pos-primary" disabled={loading} onClick={generateBill}>
                                {loading ? 'Generating...' : 'Lock & Generate Bill'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="pos-modal">
                    <div className="pos-dialog select-dialog">
                        <div className="dialog-head">
                            <div>
                                <h2>New Open Order</h2>
                                <small>Select a table or walk-in and save it immediately</small>
                            </div>
                            <button onClick={() => setStep(1)}>×</button>
                        </div>

                        <div className="select-dialog-body">
                            <div className="select-grid-pro">
                                <div className="table-picker">
                                    <h3>Select Table / Type</h3>
                                    <div className="table-list-pro">
                                        {tableOptions.map((table) => (
                                            <button
                                                type="button"
                                                key={table.id}
                                                className={`${selectedType?.id === table.id ? 'active' : ''} ${table.disabled ? 'disabled' : ''}`}
                                                disabled={table.disabled}
                                                onClick={() => setSelectedType(table)}
                                            >
                                                <span>{table.type === 'Dine In' ? '▣' : '▤'}</span>
                                                <b className="table-full-label">{table.label}</b>
                                                <b className="table-mobile-label">
                                                    {table.type === 'Dine In'
                                                        ? `T${table.tableNumber}`
                                                        : table.label}
                                                </b>
                                                <small>{table.type}</small>
                                                {table.disabled ? <em>{table.status}</em> : null}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="guest-form">
                                    <label>
                                        Customer Name <small>Optional</small>
                                        <input
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            placeholder="Walk-in Guest"
                                        />
                                    </label>

                                    <label>
                                        Mobile <small>Optional</small>
                                        <input
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value)}
                                            placeholder="Enter mobile number"
                                            inputMode="numeric"
                                        />
                                    </label>

                                    <label>
                                        Notes <small>Optional</small>
                                        <textarea
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Less spicy, extra cheese..."
                                        />
                                    </label>
                                </div>

                                <div className="order-preview-pro">
                                    <div className="preview-restaurant">🍽️</div>
                                    <h3>{selectedType?.label || 'Select Table'}</h3>
                                    <p>{selectedType ? 'Ready to add food items' : 'Choose table, parcel or take away'}</p>
                                    <div><b>Type</b><span>{selectedType?.type || '-'}</span></div>
                                    <div><b>Customer</b><span>{customerName || 'Walk-in Guest'}</span></div>
                                </div>
                            </div>
                        </div>

                        <div className="select-dialog-footer">
                            <button className="pos-secondary" onClick={() => setStep(1)}>Cancel</button>
                            <button className="pos-primary" disabled={!selectedType || loading} onClick={goItems}>
                                {loading ? 'Creating...' : 'Create & Add Items'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="pos-modal">
                    <div className="pos-dialog pos-full-dialog">
                        <div className="dialog-head">
                            <div>
                                <h2>Add Items · {selectedType?.label}</h2>
                                <small className="active-open-order-label">OPEN · {activeOpenOrder?.orderNumber}</small>
                            </div>
                            <button onClick={() => setStep(1)}>×</button>
                        </div>
                        <div className="billing-layout">
                            <div className="catalog-panel">
                                <div className="catalog-toolbar">
                                    <input placeholder="Search item / category..." value={search} onChange={(e) => setSearch(e.target.value)} />
                                    <button className="pos-secondary" onClick={() => { setSearch(''); setActiveCategory('all'); }}>Reset</button>
                                </div>
                                <div className="category-strip-pro" data-preserve-scroll>
                                    <button className={activeCategory === 'all' ? 'active' : ''} onClick={() => setActiveCategory('all')}>All</button>
                                    {categories.map((cat) => (
                                        <button key={getId(cat)} className={activeCategory === getId(cat) ? 'active' : ''} onClick={() => setActiveCategory(getId(cat))}>{getCategoryName(cat)}</button>
                                    ))}
                                </div>
                                <div className="pos-menu-filters">
                                    <div className="food-type-filter">
                                        {[
                                            { value: 'ALL', label: 'All' },
                                            { value: 'VEG', label: 'Veg' },
                                            { value: 'NON_VEG', label: 'Non-Veg' }
                                        ].map((option) => (
                                            <button
                                                type="button"
                                                key={option.value}
                                                className={foodTypeFilter === option.value ? 'active' : ''}
                                                onClick={() => setFoodTypeFilter(option.value)}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>

                                    <select
                                        value={priceSort}
                                        onChange={(e) => setPriceSort(e.target.value)}
                                        aria-label="Sort menu by price"
                                    >
                                        <option value="NONE">Sort by price</option>
                                        <option value="LOW_HIGH">Price: Low to High</option>
                                        <option value="HIGH_LOW">Price: High to Low</option>
                                    </select>
                                </div>
                                {dataLoading ? <div className="pos-empty">Loading menu...</div> : null}
                                {!dataLoading && !filteredItems.length ? <div className="pos-empty">No item found. Search clear karo ya All category select karo.</div> : null}
                                <div className="food-grid-pro" data-preserve-scroll>
                                    {filteredItems.map((item) => {
                                        const id = getId(item);
                                        const quantity = cart[id]?.quantity || 0;
                                        return (
                                            <div className="food-pro-card" key={id}>
                                                <div className="food-photo">
                                                    {getImage(item)
                                                        ? <SmartImage src={getImage(item)} alt={getName(item)} />
                                                        : <span>{getName(item).charAt(0)}</span>}
                                                </div>
                                                <div className="food-meta">
                                                    <small className="food-card-category">{item.categoryName}</small>
                                                    <div className="food-name-row">
                                                        <b>{getName(item)}</b>
                                                        {String(item.foodType || item.food_type || '').toUpperCase() === 'VEG' ? (
                                                            <i className="food-type-dot veg" title="Veg" />
                                                        ) : ['NON_VEG', 'NON-VEG', 'NONVEG'].includes(
                                                            String(item.foodType || item.food_type || '').toUpperCase()
                                                        ) ? (
                                                                <i className="food-type-dot non-veg" title="Non-Veg" />
                                                            ) : null}
                                                    </div>
                                                    <p>{item.description || 'Fresh item'}</p>
                                                    <div className="food-card-bottom">
                                                        <strong>₹{getPrice(item)}</strong>
                                                        {quantity ? (
                                                            <div className="food-inline-qty">
                                                                <button type="button" onClick={() => updateQty(id, -1)}>-</button>
                                                                <b>{quantity}</b>
                                                                <button type="button" onClick={() => updateQty(id, 1)}>+</button>
                                                            </div>
                                                        ) : (
                                                            <button type="button" className="food-add-btn" onClick={() => addItem(item)}>Add</button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className={`cart-pro-panel ${mobileCartOpen ? 'mobile-cart-open' : ''}`}>
                                <div className="panel-head">
                                    <h2>Cart</h2>
                                    <div className="cart-panel-head-actions">
                                        <span>{totalQty} items</span>
                                        <button
                                            type="button"
                                            className="mobile-cart-close"
                                            onClick={() => setMobileCartOpen(false)}
                                            aria-label="Close cart"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>
                                <div className="cart-scroll" data-preserve-scroll>
                                    {!cartItems.length ? <div className="pos-empty small">Cart empty</div> : null}
                                    {cartItems.map((item) => (
                                        <div className="cart-pro-row" key={item.menuId}>
                                            <div><b>{item.menuName}</b><span>₹{item.price}</span></div>
                                            <div className="qty-control"><button onClick={() => updateQty(item.menuId, -1)}>-</button><strong>{item.quantity}</strong><button onClick={() => updateQty(item.menuId, 1)}>+</button></div>
                                            <strong>₹{item.price * item.quantity}</strong>
                                        </div>
                                    ))}
                                </div>
                                <div className="cart-footer-pro">
                                    <div className="bill-summary">
                                        <div><span>Existing total</span><b>₹{existingOrderTotal.toFixed(2)}</b></div>
                                        <div><span>This addition</span><b>₹{subtotal.toFixed(2)}</b></div>
                                        <div className="grand"><span>Running total</span><b>₹{runningOrderTotal.toFixed(2)}</b></div>
                                    </div>
                                    <button className="pos-primary cart-pay-btn" disabled={loading || !cartItems.length} onClick={saveOpenOrderItems}>
                                        {loading ? 'Adding...' : 'Add Items & Keep Open'}
                                    </button>
                                    <button className="pos-secondary cart-clear-btn" onClick={() => setCart({})}>Clear Cart</button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            className={`mobile-cart-bar ${cartItems.length ? 'show' : ''}`}
                            onClick={() => setMobileCartOpen(true)}
                        >
                            <span>
                                <b>{totalQty} item{totalQty === 1 ? '' : 's'}</b>
                                <small>₹{subtotal.toFixed(2)}</small>
                            </span>
                            <strong>View Cart</strong>
                        </button>

                        {mobileCartOpen ? (
                            <button
                                type="button"
                                className="mobile-cart-backdrop"
                                aria-label="Close cart"
                                onClick={() => setMobileCartOpen(false)}
                            />
                        ) : null}
                    </div>
                </div>
            )}

            {step === 4 && (
                <div className="pos-modal">
                    <div className="pos-dialog payment-dialog">
                        <div className="dialog-head"><h2>Payment Details</h2><button onClick={() => setStep(1)}>×</button></div>
                        <div className="payment-grid-pro">
                            <div className="bill-summary large"><h3>Order Summary</h3><div><span>Items Total</span><b>₹{paymentSubtotal.toFixed(2)}</b></div><div><span>Discount</span><b>-₹{paymentDiscount.toFixed(2)}</b></div><div><span>GST ({activeOpenOrder?.gstPercent || activeGstPercent}%)</span><b>₹{paymentGst.toFixed(2)}</b></div>{paymentTip > 0 ? <div><span>Tip</span><b>₹{paymentTip.toFixed(2)}</b></div> : null}<div className="grand"><span>Grand Total</span><b>₹{paymentTotal.toFixed(2)}</b></div></div>
                            <div className="payment-method-panel">
                                <h3>Payment Method</h3>
                                <div className="payment-method-grid">
                                    {['Cash', 'UPI', 'Card'].map((method) => (
                                        <button
                                            type="button"
                                            key={method}
                                            className={`pay-btn ${paymentMethod === method ? 'active' : ''}`}
                                            onClick={() => {
                                                setPaymentMethod(method);
                                                setCashReceived(method === 'Cash' ? paymentTotal.toFixed(2) : '');
                                            }}
                                        >
                                            <span>{method === 'Cash' ? '₹' : method === 'UPI' ? '⌁' : '▣'}</span>
                                            <b>{method}</b>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {paymentMethod === 'Cash' ? (
                            <div className="cash-box"><label>Cash Received<input type="number" min="0" value={cashReceived} onChange={(e) => setCashReceived(e.target.value)} /></label><div><span>Change Amount</span><b>₹{change > 0 ? change.toFixed(2) : '0.00'}</b></div></div>
                        ) : null}
                        <div className="dialog-actions billing-actions">
                            <button className="pos-secondary" onClick={() => setStep(1)}>Back to Dashboard</button>
                            <button className="pos-secondary" disabled={loading || (paymentMethod === 'Cash' && toPaise(cashReceived) < toPaise(paymentTotal))} onClick={() => confirmOrder(false)}>{loading ? 'Saving...' : 'Complete Payment'}</button>
                            <button className="pos-primary" disabled={loading || (paymentMethod === 'Cash' && toPaise(cashReceived) < toPaise(paymentTotal))} onClick={() => confirmOrder(true)}>{loading ? 'Saving...' : 'Pay & Print Receipt'}</button>
                        </div>
                    </div>
                </div>
            )}

            {step === 5 && (
                <div className="pos-modal">
                    <div className="pos-dialog success-dialog">
                        <div className="success-check">✓</div>
                        <h2>Payment Completed</h2>
                        <p>Order ID</p>
                        <h1>{createdOrder?.orderNumber || '#1026'}</h1>
                        <div className="confirm-card-pro"><div><span>Table</span><b>{createdOrder?.table ? `Table ${createdOrder.table.tableNumber}` : selectedType?.label}</b></div><div><span>Items</span><b>{createdOrder?.itemCount || 0} Items</b></div><div><span>Total</span><b>₹{Number(createdOrder?.finalAmount ?? createdOrder?.totalPrice ?? paymentTotal).toFixed(2)}</b></div><div><span>Payment</span><b>{createdOrder?.paymentMethod || paymentMethod}</b></div><div><span>Status</span><em className="status-pill completed">Completed</em></div></div>
                        <div className="print-row">
                            <button className="pos-secondary" onClick={() => window.print()}>Print Bill Again</button>
                        </div>

                        <div className="success-actions">
                            <button className="pos-secondary" onClick={startNewOrder}>+ New Order</button>
                            <button className="pos-primary" onClick={() => navigate('/orders')}>Go to Orders</button>
                        </div>

                        <div className="print-receipt-host" aria-hidden="true">
                            {receiptData ? (
                                <ThermalReceipt receipt={receiptData} printerWidth={printerSettings.printerWidth} />
                            ) : null}
                        </div>
                    </div>
                </div>
            )}

            <section className="kot-print-host" aria-hidden={!kotPrintData}>
                {kotPrintData ? (
                    <div className="kot-slip">
                        <h1>KITCHEN ORDER TICKET</h1>
                        <div className="kot-meta">
                            <p><span>Order</span><b>{kotPrintData.orderNumber}</b></p>
                            <p><span>Table / Type</span><b>{kotPrintData.tableLabel}</b></p>
                            <p><span>KOT Batch</span><b>#{kotPrintData.batchNumber}</b></p>
                            <p><span>Printed</span><b>{new Date(kotPrintData.printedAt).toLocaleString()}</b></p>
                        </div>
                        <div className="kot-rule" />
                        {kotPrintData.items.map((item) => (
                            <div className="kot-item" key={item.id}>
                                <b>{item.quantity} × {item.itemName}</b>
                                {item.notes ? <span>Note: {item.notes}</span> : null}
                            </div>
                        ))}
                    </div>
                ) : null}
            </section>
        </div>
    );
}

export default ManagerPOS;
