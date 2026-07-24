import React, { useCallback, useEffect, useRef, useState } from 'react';
import CryptoJS from 'crypto-js';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { IoMdArrowRoundBack, IoMdArrowRoundForward } from 'react-icons/io';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Logo from '../../assets/images/R-C DINE.png';
import '../../assets/styles/sidebar.css';
import env from '../../config/env';
import * as hotelService from '../../services/hotel.service';
import * as orderService from '../../services/order.service';
import { connectSocket } from '../../services/socket.service';
import { logoutRequest } from '../../store/slice';
import { USER_ROLES, COMMON_TABS, MANAGER_TABS, OWNER_TABS } from '../../utils/constants';
import { runBackgroundTask } from '../../utils/refreshBus';
import Loader from '../Loader';
import NoHotel from '../NoHotel';
import SmartImage from '../SmartImage';

const getTodayRange = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return {
        dateFrom: start.toISOString(),
        dateTo: end.toISOString()
    };
};

const getOrdersFromResponse = (response) => {
    const possibleData = [
        response?.data?.data,
        response?.data?.rows,
        response?.data,
        response?.rows,
        response
    ];

    return possibleData.find((value) => Array.isArray(value)) || [];
};

function Sidebar() {
    const [compress, setCompress] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [animatePendingCount, setAnimatePendingCount] = useState(false);
    const [hotelBrand, setHotelBrand] = useState({ name: '', logo: '' });
    const previousPendingCount = useRef(0);
    const pendingOrderIds = useRef(new Set());
    const animationTimer = useRef(null);
    const user = useSelector((state) => state.user?.data);
    const globalHotelId = useSelector((state) => state.hotel?.globalHotelId);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const handleClick = (item) => {
        navigate(item.path);
    };

    const updatePendingCount = useCallback((nextCount) => {
        const safeCount = Math.max(0, Number(nextCount) || 0);
        const countIncreased = safeCount > previousPendingCount.current;

        setPendingCount(safeCount);

        if (countIncreased) {
            setAnimatePendingCount(false);

            window.requestAnimationFrame(() => {
                setAnimatePendingCount(true);
            });

            if (animationTimer.current) {
                clearTimeout(animationTimer.current);
            }

            animationTimer.current = setTimeout(() => {
                setAnimatePendingCount(false);
            }, 900);
        }

        previousPendingCount.current = safeCount;
    }, []);

    const loadPendingCount = useCallback(async () => {
        if (!globalHotelId) {
            pendingOrderIds.current = new Set();
            updatePendingCount(0);
            return;
        }

        try {
            const { dateFrom, dateTo } = getTodayRange();
            const response = await orderService.getCompletedOrders({
                hotelId: globalHotelId,
                skip: 0,
                limit: 1000,
                sortKey: 'orderTime',
                sortOrder: 'DESC',
                filterKey: 'orderStatus',
                filterValue: 'PENDING',
                dateFrom,
                dateTo
            });

            const orders = getOrdersFromResponse(response);
            const pendingOrders = orders.filter(
                (order) => String(order?.orderStatus || order?.status || '').toUpperCase() === 'PENDING'
            );

            pendingOrderIds.current = new Set(pendingOrders.map((order) => String(order.orderId)));
            updatePendingCount(pendingOrderIds.current.size);
        } catch (error) {
            console.error(`Error while loading pending order count ${error}`);
        }
    }, [globalHotelId, updatePendingCount]);

    const refreshPendingCountInBackground = useCallback(
        () => runBackgroundTask(loadPendingCount),
        [loadPendingCount]
    );

    useEffect(() => {
        setCompress(window.innerWidth < 768);
    }, []);

    useEffect(() => {
        let active = true;

        const loadHotelBrand = async () => {
            if (!globalHotelId) {
                if (active) setHotelBrand({ name: '', logo: '' });
                return;
            }

            try {
                const response = await hotelService.dashboard(globalHotelId, {
                    fresh: true
                });
                const details =
                    response?.hotel ||
                    response?.data?.hotel ||
                    response?.data?.data?.hotel ||
                    response?.details ||
                    response?.data?.details ||
                    {};
                console.log('Dashboard Response:', response);
                console.log('Hotel Details:', details);
                console.log('Logo URL:', details?.logo);

                if (active) {
                    setHotelBrand({
                        name: details?.name || details?.hotelName || '',
                        logo: details?.logo || details?.logoUrl || ''
                    });
                }
            } catch (error) {
                console.error('Unable to load hotel branding:', error);
                if (active) setHotelBrand({ name: '', logo: '' });
            }
        };

        loadHotelBrand();

        return () => {
            active = false;
        };
    }, [globalHotelId]);

    useEffect(() => {
        refreshPendingCountInBackground();

        if (!globalHotelId) return undefined;

        const socket = connectSocket();
        const isCurrentHotel = (payload) => (
            !payload?.hotelId || String(payload.hotelId) === String(globalHotelId)
        );
        const mergePendingOrder = (payload, pending) => {
            if (!isCurrentHotel(payload)) return;
            const orderId = payload?.orderId || payload?.order?.orderId;
            if (!orderId) {
                refreshPendingCountInBackground();
                return;
            }

            if (pending) pendingOrderIds.current.add(String(orderId));
            else pendingOrderIds.current.delete(String(orderId));
            updatePendingCount(pendingOrderIds.current.size);
        };
        const handleNewOrder = (payload) => mergePendingOrder(payload, true);
        const handleStatusUpdated = (payload) => mergePendingOrder(
            payload,
            String(payload?.status || '').toUpperCase() === 'PENDING'
        );
        const handleOrderCancelled = (payload) => mergePendingOrder(payload, false);

        const joinHotelRoom = () => {
            socket.emit('join-hotel', globalHotelId);
        };

        if (socket.connected) {
            joinHotelRoom();
        }

        socket.on('connect', joinHotelRoom);
        socket.on('new-order', handleNewOrder);
        socket.on('order-status-updated', handleStatusUpdated);
        socket.on('order-cancelled', handleOrderCancelled);

        const refreshTimer = setInterval(refreshPendingCountInBackground, 30000);

        return () => {
            socket.off('connect', joinHotelRoom);
            socket.off('new-order', handleNewOrder);
            socket.off('order-status-updated', handleStatusUpdated);
            socket.off('order-cancelled', handleOrderCancelled);
            clearInterval(refreshTimer);

            if (animationTimer.current) {
                clearTimeout(animationTimer.current);
            }
        };
    }, [globalHotelId, refreshPendingCountInBackground]);

    let tabs = [];
    try {
        const viewData = JSON.parse(
            CryptoJS.AES.decrypt(localStorage.getItem('data'), env.cryptoSecret).toString(CryptoJS.enc.Utf8)
        );
        if (Object.keys(viewData).length === 1 && viewData.role.toUpperCase() === USER_ROLES[0]) {
            tabs = [...OWNER_TABS, ...COMMON_TABS].sort((a, b) => a.order - b.order);
        } else if (Object.keys(viewData).length === 1 && viewData.role.toUpperCase() === USER_ROLES[2]) {
            tabs = [...MANAGER_TABS, ...COMMON_TABS].sort((a, b) => a.order - b.order);
        } else {
            tabs = [...MANAGER_TABS, ...COMMON_TABS].sort((a, b) => a.order - b.order);
        }
    } catch (error) {
        toast.error('Oops! Something went wrong. Please try logging in again.');
        dispatch(logoutRequest());
    }

    const render = () => {
        if (location.pathname === '/subscription') {
            return <Outlet />;
        }
        if (Object.keys(user).length && user.role.toUpperCase() === USER_ROLES[0]) {
            return <Outlet />;
        } else if (Object.keys(user).length && user.role.toUpperCase() === USER_ROLES[1]) {
            if (!globalHotelId && [...MANAGER_TABS].find((obj) => obj.path === location.pathname)) {
                return <NoHotel />;
            } else if ([...MANAGER_TABS, ...COMMON_TABS].find((obj) => obj.path === location.pathname)) {
                return <Outlet />;
            }
        } else if (Object.keys(user).length && user.role.toUpperCase() === USER_ROLES[2]) {
            if (
                location.pathname.startsWith('/admin') ||
                [...COMMON_TABS].find((obj) => obj.path === location.pathname)
            ) {
                return <Outlet />;
            }
        }
        return <Loader />;
    };

    return (
        <>
            <div
                data-testid="sidebar-testId"
                className={`otm-sidebar ${compress ? 'compressed-sidebar' : 'full-sidebar'}`}
            >
                <div className={`d-flex my-4 align-items-center ${compress ? 'flex-column' : 'flex-row'}`}>
                    <div
                        className={`sidebar-brand-wrap d-flex align-items-center justify-content-center w-100 ${compress ? 'order-2' : 'order-1'}`}
                    >
                        {globalHotelId ? (
                            <>
                                <SmartImage
                                    eager
                                    src={hotelBrand.logo || Logo}
                                    alt={hotelBrand.name || 'Hotel logo'}
                                    fallbackSrc={Logo}
                                    className={`sidebar-hotel-logo ${compress ? 'mt-2' : ''}`}
                                    onError={(event) => {
                                        event.currentTarget.onerror = null;
                                        event.currentTarget.src = Logo;
                                    }}
                                />
                                {!compress && (
                                    <div className="sidebar-hotel-copy">
                                        <small>Restaurant</small>
                                        <strong title={hotelBrand.name || 'Hotel'}>
                                            {hotelBrand.name || 'Hotel'}
                                        </strong>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <h3 className={`brand-title m-0 ${compress && 'd-none'}`}>R</h3>
                                <img
                                    src={Logo}
                                    alt="R&C Dine"
                                    className={`sidebar-app-logo ${compress ? 'mt-2' : ''}`}
                                />
                                <h3 className={`brand-title m-0 ${compress && 'd-none'}`}>C-Dine</h3>
                            </>
                        )}
                    </div>
                    <div
                        className={`arrow ${compress ? 'arrow-compress order-1' : 'arrow-full order-2'}`}
                        onClick={() => {
                            setCompress(!compress);
                        }}
                    >
                        {compress ? (
                            <IoMdArrowRoundForward
                                data-testid="arrow-forward"
                                size={20}
                                color="white"
                                className="m-auto"
                            />
                        ) : (
                            <IoMdArrowRoundBack data-testid="arrow-back" size={20} color="white" className="m-auto" />
                        )}
                    </div>
                </div>
                <ul className="p-0">
                    {tabs.map((item) => {
                        const { Icon, title, id, path } = item;
                        const isOrdersTab = String(path).toLowerCase().includes('order');
                        const visiblePendingCount = pendingCount > 99 ? '99+' : pendingCount;

                        return (
                            <OverlayTrigger
                                key={`${title}-${id}`}
                                overlay={compress ? <Tooltip id={id}>{title}</Tooltip> : <></>}
                                placement="right"
                                delayShow={300}
                                delayHide={150}
                            >
                                <li
                                    data-testid={`test-${id}`}
                                    onClick={() => handleClick(item)}
                                    className={`d-flex align-items-center container ${window.location.pathname === path && 'active'}`}
                                >
                                    <Icon size={25} className={`${compress ? 'm-0' : 'ms-4'}`} />

                                    {compress ? null : (
                                        <div className="sidebar-menu-content">
                                            <h6 className="sidebar-menu-title">{title}</h6>

                                            {isOrdersTab && pendingCount > 0 && (
                                                <span
                                                    key={pendingCount}
                                                    className={`pending-order-count ${animatePendingCount ? 'pending-order-count-animate' : ''
                                                    }`}
                                                    aria-label={`${pendingCount} pending orders`}
                                                >
                                                    {visiblePendingCount}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {compress && isOrdersTab && pendingCount > 0 && (
                                        <span
                                            key={`compressed-${pendingCount}`}
                                            className={`pending-order-count pending-order-count-compressed ${animatePendingCount ? 'pending-order-count-animate' : ''
                                            }`}
                                            aria-label={`${pendingCount} pending orders`}
                                        >
                                            {visiblePendingCount}
                                        </span>
                                    )}
                                </li>
                            </OverlayTrigger>
                        );
                    })}
                </ul>
            </div>
            <div className={`main-container ${compress ? 'main-container-compress' : 'main-container-full'}`}>
                {render()}
            </div>
        </>
    );
}

export default Sidebar;
