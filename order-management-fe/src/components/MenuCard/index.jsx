import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import { createPortal } from 'react-dom';

import defaultLogo from '../../assets/images/R-C DINE.png';
import '../../assets/styles/menuCard.css';
import features from '../../config/features';
import { initializeWebPush } from '../../services/notification.service';
import {
    endRcSession,
    getRcSessionDetails,
    getRcSessionPendingRequests,
    leaveRcSession,
    removeRcSessionMember,
    respondRcSessionJoinRequest
} from '../../services/rcSession.service';
import { joinRcSessionRoom, leaveRcSessionRoom } from '../../services/socket.service';
import { registerRefreshHandler } from '../../utils/refreshBus';
import Loader from '../Loader';
import NotificationCenter from '../NotificationCenter';
import SmartImage from '../SmartImage';

const types = {
    cover: 'COVER',
    category: 'CATEGORY',
    item: 'MENU_ITEM'
};

const normalizeCategory = (value = '') => String(value).trim().toLowerCase();
const getItemImage = (item = {}) => item.image || item.imageUrl || item.photo || item.photoUrl || '';
const isItemAvailable = (item = {}) => item.available !== false && item.status !== 'UNAVAILABLE';
const isTodayDeal = (item = {}) => item.isTodayDeal === true || item.todayDeal === true;
const isBestSeller = (item = {}) => item.isBestSeller === true || item.bestSeller === true;
const getItemDescription = (item = {}) => item.description || item.desc || 'Freshly prepared by the restaurant.';
const getFoodType = (item = {}) => item.foodType || item.type || 'VEG';
const getCleanText = (value, fallback) => {
    if (value === 0) return '0';
    return value ? String(value) : fallback;
};

function MenuCard({
    data = {},
    currentOrder = {},
    name = '',
    tableNumber,
    restaurant = {},
    handleClick = () => { },
    handleOnChange = () => { },
    tipAmount = 0,
    onTipAmountChange = () => { }
}) {
    const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('rcdineSplashSeen'));
    const [searchText, setSearchText] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [menuAnimationKey, setMenuAnimationKey] = useState(0);
    const [showFilter, setShowFilter] = useState(false);
    const [foodFilter, setFoodFilter] = useState('ALL');
    const [priceSort, setPriceSort] = useState('');
    const [draftFoodFilter, setDraftFoodFilter] = useState('ALL');
    const [draftPriceSort, setDraftPriceSort] = useState('');
    const [openPanel, setOpenPanel] = useState('');
    const [showCartScreen, setShowCartScreen] = useState(false);
    const [showUpsellPopup, setShowUpsellPopup] = useState(false);
    const [toastText, setToastText] = useState('');
    const [selectedTip, setSelectedTip] = useState(Number(tipAmount) || 0);
    const [unreadCount, setUnreadCount] = useState(() => Number(sessionStorage.getItem('rcdineUnreadCount')) || 0);
    const [rcSession, setRcSession] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('rcSession') || 'null');
        } catch (error) {
            return null;
        }
    });
    const [sessionDetails, setSessionDetails] = useState(null);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [joinRequestPopup, setJoinRequestPopup] = useState(null);
    const [sessionBusy, setSessionBusy] = useState(false);
    const customerToken = localStorage.getItem('rcCustomerToken');
    const customerMobile = localStorage.getItem('rcCustomerMobile') || '';
    const customerName = localStorage.getItem('rcCustomerName') || 'Guest User';
    const sessionSnapshotRef = useRef('');
    const pendingRequestsRef = useRef([]);
    sessionSnapshotRef.current = JSON.stringify({ sessionDetails, pendingRequests });
    pendingRequestsRef.current = pendingRequests;

    useEffect(() => {
        const notificationToken = customerToken || localStorage.getItem('rcCustomerPushToken');
        if (!notificationToken || !('Notification' in window) || Notification.permission !== 'granted') return;
        initializeWebPush({ audience: 'customer', token: notificationToken }).catch(() => { });
    }, [customerToken]);

    const clearRcSession = useCallback((message) => {
        localStorage.removeItem('rcSession');
        setRcSession(null);
        setSessionDetails(null);
        setPendingRequests([]);
        setOpenPanel('');
        if (message) setToastText(message);
        window.dispatchEvent(new CustomEvent('rcdine:session-cleared'));
    }, []);

    const loadSessionDetails = useCallback(async () => {
        if (!rcSession?.tableId || !customerToken) return false;
        const before = sessionSnapshotRef.current;
        try {
            const result = await getRcSessionDetails({ tableId: rcSession.tableId, token: customerToken });
            setSessionDetails(result);
            let pendingRequestsResult = pendingRequestsRef.current;
            if (result.isHost) {
                const pending = await getRcSessionPendingRequests({ tableId: rcSession.tableId, token: customerToken });
                pendingRequestsResult = pending.requests || [];
                setPendingRequests(pendingRequestsResult);
            }
            return before !== JSON.stringify({ sessionDetails: result, pendingRequests: pendingRequestsResult });
        } catch (error) {
            if ([403, 404].includes(error.status)) clearRcSession();
            return false;
        }
    }, [clearRcSession, customerToken, rcSession?.tableId]);

    useEffect(
        () => registerRefreshHandler('customer-rc-session', loadSessionDetails),
        [loadSessionDetails]
    );

    useEffect(() => {
        if (!rcSession?.id) return undefined;
        loadSessionDetails();
        const socket = joinRcSessionRoom(rcSession.id);
        const refresh = () => loadSessionDetails();
        const receiveRequest = (request) => {
            setPendingRequests((current) => current.some((item) => item.id === request.requestId)
                ? current
                : [...current, { ...request, id: request.requestId }]);
            setJoinRequestPopup({ ...request, id: request.requestId });
        };
        const removed = (payload) => {
            const ownMobile = localStorage.getItem('rcCustomerMobile');
            if (String(payload?.mobileNumber) === String(ownMobile)) clearRcSession('Host removed you from the session.');
            else refresh();
        };
        socket.on('session:join-requested', receiveRequest);
        socket.on('session:members-updated', refresh);
        socket.on('session:member-left', refresh);
        socket.on('session:member-removed', removed);
        socket.on('session:ended', () => clearRcSession('Session ended by host.'));
        return () => {
            socket.off('session:join-requested', receiveRequest);
            socket.off('session:members-updated', refresh);
            socket.off('session:member-left', refresh);
            socket.off('session:member-removed', removed);
            socket.off('session:ended');
            leaveRcSessionRoom(rcSession.id);
        };
    }, [clearRcSession, loadSessionDetails, rcSession?.id]);

    useEffect(() => {
        if (!pendingRequests.length) return undefined;
        const timer = window.setInterval(() => {
            const now = Date.now();
            setPendingRequests((current) => current.filter((request) => new Date(request.expiresAt).getTime() > now));
            setJoinRequestPopup((current) =>
                current && new Date(current.expiresAt).getTime() <= now ? null : current
            );
        }, 1000);
        return () => window.clearInterval(timer);
    }, [pendingRequests.length]);

    const copySessionCode = async () => {
        if (!rcSession?.sessionCode) return;
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(rcSession.sessionCode);
            } else {
                const input = document.createElement('textarea');
                input.value = rcSession.sessionCode;
                input.style.position = 'fixed';
                input.style.opacity = '0';
                document.body.appendChild(input);
                input.select();
                document.execCommand('copy');
                input.remove();
            }
            setToastText('Session code copied.');
        } catch (error) {
            setToastText('Unable to copy session code.');
        }
    };

    const shareSessionCode = async () => {
        if (!rcSession?.sessionCode) return;
        const text = `Join my RC Dine session with code ${rcSession.sessionCode}`;
        try {
            if (navigator.share) await navigator.share({ title: 'RC Dine Session', text });
            else await copySessionCode();
        } catch (error) {
            if (error?.name !== 'AbortError') await copySessionCode();
        }
    };

    const respondToJoinRequest = async (request, action) => {
        setSessionBusy(true);
        try {
            await respondRcSessionJoinRequest({
                tableId: rcSession.tableId,
                requestId: request.id,
                action,
                token: customerToken
            });
            setPendingRequests((current) => current.filter((item) => item.id !== request.id));
            setJoinRequestPopup(null);
            await loadSessionDetails();
        } catch (error) {
            setToastText(error.message);
        } finally {
            setSessionBusy(false);
        }
    };

    const removeMember = async (memberId) => {
        setSessionBusy(true);
        try {
            await removeRcSessionMember({ tableId: rcSession.tableId, memberId, token: customerToken });
            await loadSessionDetails();
        } catch (error) {
            setToastText(error.message);
        } finally {
            setSessionBusy(false);
        }
    };

    const leaveSession = async () => {
        setSessionBusy(true);
        try {
            await leaveRcSession({ tableId: rcSession.tableId, token: customerToken });
            clearRcSession('You left the session.');
        } catch (error) {
            setToastText(error.message);
            setSessionBusy(false);
        }
    };

    const endSession = async () => {
        setSessionBusy(true);
        try {
            await endRcSession({ tableId: rcSession.tableId, token: customerToken });
            clearRcSession('Session ended.');
        } catch (error) {
            setToastText(error.message);
            setSessionBusy(false);
        }
    };

    useEffect(() => {
        if (!showSplash) return undefined;
        const timer = setTimeout(() => {
            sessionStorage.setItem('rcdineSplashSeen', 'yes');
            setShowSplash(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, [showSplash]);

    useEffect(() => {
        onTipAmountChange(selectedTip);
    }, [selectedTip, onTipAmountChange]);

    useEffect(() => {
        sessionStorage.setItem('rcdineUnreadCount', String(unreadCount));
    }, [unreadCount]);

    const pagesList = useMemo(() => {
        if (!data || typeof data !== 'object') return [];
        return Object.keys(data)
            .sort((a, b) => Number(a) - Number(b))
            .map((key) => data[key]);
    }, [data]);

    const hotelDetails = useMemo(() => {
        const directHotel = data?.hotel || data?.restaurant || data?.business || data?.customer?.hotel || {};
        const pageHotel = pagesList.find((page) => page?.hotel || page?.restaurant || page?.business) || {};
        const source = directHotel?.id ? directHotel : pageHotel.hotel || pageHotel.restaurant || pageHotel.business || directHotel;
        return {
            cafeName: name || source?.name || source?.hotelName || source?.businessName || 'R&C Cafe',
            rating: source?.rating || source?.averageRating || source?.ratings || 'Not rated yet',
            address: source?.address || source?.location || source?.fullAddress || '',
            phone: source?.phone || source?.phoneNumber || source?.mobile || source?.contact || source?.contactNumber || '',
            timing: source?.timing || source?.hours || source?.openingHours || source?.businessHours || '',
            about: source?.about || source?.description || source?.bio || '',
            logo: restaurant?.logo || source?.logo || source?.logoUrl || ''
        };
    }, [data, name, pagesList, restaurant]);

    const { categories, allItems } = useMemo(() => {
        const categoryList = [];
        const items = [];

        pagesList.forEach((page) => {
            if (!page?.type) return;

            if (page.type === types.category && Array.isArray(page.data)) {
                page.data.forEach((cat) => {
                    if (!cat?.id || !cat?.name) return;
                    categoryList.push({ id: cat.id, name: cat.name });
                });
            }

            if (page.type === types.item && Array.isArray(page.data)) {
                const categoryName = page.title || 'Menu';
                page.data.forEach((item) => {
                    items.push({ ...item, categoryName });
                });
            }
        });

        return { categories: categoryList, allItems: items };
    }, [pagesList]);

    const filteredItems = useMemo(() => {
        const query = searchText.trim().toLowerCase();
        const nextItems = allItems.filter((item) => {
            const categoryOk = activeCategory === 'all' || normalizeCategory(item.categoryName) === normalizeCategory(activeCategory);
            const searchableText = `${item.name || ''} ${item.categoryName || ''} ${getItemDescription(item)}`.toLowerCase();
            const searchOk = !query || searchableText.includes(query);
            const itemFoodType = String(getFoodType(item)).toUpperCase().replace('-', '_');
            const foodTypeOk =
                foodFilter === 'ALL' ||
                (foodFilter === 'VEG' && itemFoodType === 'VEG') ||
                (foodFilter === 'NON_VEG' && itemFoodType === 'NON_VEG');

            return categoryOk && searchOk && foodTypeOk;
        });

        if (priceSort === 'LOW_TO_HIGH') {
            return [...nextItems].sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
        }

        if (priceSort === 'HIGH_TO_LOW') {
            return [...nextItems].sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
        }

        return nextItems;
    }, [activeCategory, allItems, foodFilter, priceSort, searchText]);

    const handleCategorySelect = (categoryName) => {
        setActiveCategory(categoryName);
        setMenuAnimationKey((current) => current + 1);
    };

    const activeCategoryLabel = activeCategory === 'all' ? 'All' : activeCategory;

    const activeFilterLabel = useMemo(() => {
        const labels = [];
        if (foodFilter === 'VEG') labels.push('Veg');
        if (foodFilter === 'NON_VEG') labels.push('Non-Veg');
        if (priceSort === 'LOW_TO_HIGH') labels.push('Low→High');
        if (priceSort === 'HIGH_TO_LOW') labels.push('High→Low');
        return labels.join(' • ');
    }, [foodFilter, priceSort]);

    const openFilterSheet = () => {
        setDraftFoodFilter(foodFilter);
        setDraftPriceSort(priceSort);
        setShowFilter(true);
    };

    const clearFilters = () => {
        setDraftFoodFilter('ALL');
        setDraftPriceSort('');
        setFoodFilter('ALL');
        setPriceSort('');
        setShowFilter(false);
    };

    const applyFilters = () => {
        setFoodFilter(draftFoodFilter);
        setPriceSort(draftPriceSort);
        setShowFilter(false);
    };

    const todayDealItems = useMemo(() => allItems.filter(isTodayDeal), [allItems]);
    const bestSellerItems = useMemo(() => allItems.filter(isBestSeller), [allItems]);

    const comboItems = useMemo(
        () =>
            allItems.filter((item) => {
                const category = String(item.categoryName || '').toLowerCase();
                return item.isCombo === true || item.combo === true || category === 'combo' || category === 'combos';
            }),
        [allItems]
    );
    const cartItems = useMemo(() => {
        const cart = [];
        Object.keys(currentOrder || {}).forEach((id) => {
            if (id === 'lastUpdated') return;
            const qty = Number(currentOrder[id]?.quantity) || 0;
            if (qty <= 0) return;
            cart.push({
                id,
                name: currentOrder[id]?.menuName || currentOrder[id]?.name,
                price: Number(currentOrder[id]?.price) || 0,
                quantity: qty
            });
        });
        return cart;
    }, [currentOrder]);

    const cartSuggestionItems = useMemo(
        () => allItems
            .filter((item) => item.isCartSuggestion === true)
            .filter(isItemAvailable)
            .slice(0, 4),
        [allItems]
    );

    const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);
    const gstEnabled = Boolean(restaurant?.gstEnabled || data?.hotel?.gstEnabled || data?.gstEnabled);
    const gstPercent = gstEnabled ? Number(restaurant?.gstPercent || data?.hotel?.gstPercent || data?.gstPercent || 0) : 0;
    const discountEnabled = Boolean(restaurant?.discountEnabled || data?.hotel?.discountEnabled || data?.discountEnabled);
    const discountType = restaurant?.discountType || data?.hotel?.discountType || data?.discountType || '';
    const discountValue = Number(restaurant?.discountValue || data?.hotel?.discountValue || data?.discountValue || 0);
    const discountAmount = useMemo(() => {
        if (!discountEnabled || !subtotal || !discountValue) return 0;
        if (discountType === 'PERCENT') return Math.round(subtotal * (Math.min(100, Math.max(0, discountValue)) / 100));
        if (discountType === 'FLAT') return Math.min(subtotal, Math.round(Math.max(0, discountValue)));
        return 0;
    }, [discountEnabled, discountType, discountValue, subtotal]);
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const gstAmount = taxableAmount * (gstPercent / 100);
    const grandTotal = taxableAmount + gstAmount + selectedTip;
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const getQuantity = (menuId) => Number(currentOrder?.[menuId]?.quantity) || 0;

    const showToast = (message) => {
        setToastText(message);
        setTimeout(() => setToastText(''), 1600);
    };

    const setMenuQuantity = (item, nextQuantity) => {
        if (!isItemAvailable(item)) {
            showToast('Item unavailable');
            return;
        }
        handleOnChange({ target: { value: nextQuantity } }, item);
        if (nextQuantity > getQuantity(item.id)) showToast('Added to Cart');
    };

    const openNotificationDrawer = () => {
        setOpenPanel('notifications');
    };

    const shareCafe = async () => {
        const shareData = {
            title: hotelDetails.cafeName,
            text: `Open ${hotelDetails.cafeName} menu for Table ${tableNumber || '-'}`,
            url: window.location.href
        };
        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else if (navigator.clipboard) {
                await navigator.clipboard.writeText(window.location.href);
                showToast('Cafe link copied');
            } else {
                showToast('Copy this page link from address bar');
            }
        } catch (error) {
            showToast('Share cancelled');
        }
    };

    const callRestaurant = () => {
        if (!hotelDetails.phone) {
            showToast('Restaurant phone not available');
            return;
        }
        window.location.href = `tel:${hotelDetails.phone}`;
    };

    const openMyOrders = () => {
        setOpenPanel('');
        handleClick({ action: 'view' });
    };

    const showComingSoon = (label) => {
        setOpenPanel('');
        showToast(`${label} coming soon`);
    };

    const logoutCustomer = () => {
        [
            'rcCustomerToken',
            'rcCustomerPushToken',
            'rcCustomerMobile',
            'rcCustomerName',
            'rcSession'
        ].forEach((key) => localStorage.removeItem(key));
        sessionStorage.removeItem('rcdineUnreadCount');
        setOpenPanel('');
        window.dispatchEvent(new CustomEvent('rcdine:session-cleared'));
        window.location.reload();
    };

    const finishPayment = () => {
        handleClick({ action: 'place' });
    };

    const handleProceedToPayment = () => {
        if (!cartItems.length) {
            showToast('Cart is empty');
            return;
        }

        if (cartSuggestionItems.length) {
            setShowUpsellPopup(true);
            return;
        }

        finishPayment();
    };

    const handleAddAndContinue = () => {
        setShowUpsellPopup(false);
        finishPayment();
    };

    if (!pagesList.length) {
        return (
            <div className="d-flex justify-content-center w-100 h-100">
                <Card className="m-auto d-flex menu-container customer-order-loading">
                    <Card.Body className="d-flex align-items-center justify-content-center">
                        <Loader />
                    </Card.Body>
                </Card>
            </div>
        );
    }

    if (showSplash) {
        return (
            <div className="rc-mobile-shell">
                <div className="rc-phone rc-splash-screen">
                    <div className="rc-splash-logo rc-hotel-logo-wrap">
                        <SmartImage
                            eager
                            src={hotelDetails.logo || defaultLogo}
                            alt={`${hotelDetails.cafeName || 'Hotel'} logo`}
                            fallbackSrc={defaultLogo}
                        />
                    </div>
                    <h1>{hotelDetails.cafeName}</h1>
                    <div className="rc-table-pill">Table {tableNumber ?? '-'}</div>
                    <p>Welcome</p>
                    <div className="rc-loader" />
                </div>
            </div>
        );
    }

    return (
        <div className="rc-mobile-shell">
            <div className="rc-phone rc-menu-screen">
                <div className="rc-sticky-menu-header">
                    <div className="rc-topbar">
                        <button
                            className="rc-icon-btn rc-profile-icon-btn rc-glass"
                            type="button"
                            aria-label="Open my profile"
                            title="My Profile"
                            onClick={() => setOpenPanel('profile')}
                        >
                            <span aria-hidden="true">👤</span>
                        </button>

                        <button
                            className="rc-topbar-restaurant rc-glass"
                            type="button"
                            onClick={() => setOpenPanel('info')}
                        >
                            <span className="rc-topbar-restaurant-logo">
                                <SmartImage
                                    eager
                                    src={hotelDetails.logo || defaultLogo}
                                    alt={`${hotelDetails.cafeName || 'Hotel'} logo`}
                                    fallbackSrc={defaultLogo}
                                />
                            </span>
                            <span className="rc-topbar-restaurant-copy">
                                <strong>{hotelDetails.cafeName}</strong>
                                <small>Table {tableNumber ?? '-'} · Restaurant Info</small>
                            </span>
                        </button>

                        <button
                            className="rc-icon-btn rc-glass"
                            type="button"
                            aria-label="Open notifications"
                            onClick={openNotificationDrawer}
                        >
                            🔔
                            {unreadCount > 0 && <span className="rc-badge">{unreadCount}</span>}
                        </button>
                    </div>

                    {features.rcSession && rcSession?.sessionCode && (
                        <button
                            className="rc-active-session-bar rc-glass"
                            type="button"
                            onClick={() => setOpenPanel('session-details')}
                        >
                            <span>RC: {rcSession.sessionCode}</span>
                            <small>Session Details</small>
                        </button>
                    )}

                    <div className="rc-search-filter-row">
                        <div className="rc-search rc-glass">
                            <span>🔍</span>
                            <input
                                value={searchText}
                                type="search"
                                placeholder="Search food..."
                                onChange={(event) => setSearchText(event.target.value)}
                            />
                        </div>
                        <button
                            className={`rc-filter-btn rc-glass ${activeFilterLabel ? 'active' : ''}`}
                            type="button"
                            onClick={openFilterSheet}
                        >
                            <span>☰</span>
                            <small>{activeFilterLabel || 'Filter'}</small>
                        </button>
                    </div>

                    <div className="rc-categories" data-preserve-scroll>
                        <button
                            className={`rc-cat rc-glass ${activeCategory === 'all' ? 'active' : ''}`}
                            type="button"
                            onClick={() => handleCategorySelect('all')}
                        >
                            <span className="rc-category-brand-icon"><img src={defaultLogo} alt="" /></span>
                            <span className="rc-category-label">All</span>
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                className={`rc-cat rc-glass ${activeCategory === category.name ? 'active' : ''}`}
                                type="button"
                                onClick={() => handleCategorySelect(category.name)}
                            >
                                <span className="rc-category-brand-icon"><img src={defaultLogo} alt="" /></span>
                                <span className="rc-category-label">{category.name}</span>
                            </button>
                        ))}
                    </div>

                </div>

                <div className="rc-menu-scroll-area">
                    {todayDealItems.length > 0 && (
                        <section className="rc-section">
                            <div className="rc-section-title">
                                <h3>🔥 Today&apos;s Deal</h3>
                                <small>Manager ON karega tabhi dikhega</small>
                            </div>
                            <div className="rc-deal-row" data-preserve-scroll>
                                {todayDealItems.map((item) => {
                                    const quantity = getQuantity(item.id);
                                    return (
                                        <div key={item.id} className={`rc-food-card rc-glass ${!isItemAvailable(item) ? 'is-unavailable' : ''}`}>
                                            <FoodMedia item={item} />
                                            <FoodContent item={item} quantity={quantity} setMenuQuantity={setMenuQuantity} />
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {bestSellerItems.length > 0 && (
                        <section className="rc-section">
                            <div className="rc-section-title">
                                <h3>⭐ Best Sellers</h3>
                                <small>Most loved dishes</small>
                            </div>
                            <div className="rc-deal-row" data-preserve-scroll>
                                {bestSellerItems.map((item) => {
                                    const quantity = getQuantity(item.id);
                                    return (
                                        <div key={item.id} className={`rc-food-card rc-glass ${!isItemAvailable(item) ? 'is-unavailable' : ''}`}>
                                            <FoodMedia item={item} />
                                            <FoodContent item={item} quantity={quantity} setMenuQuantity={setMenuQuantity} />
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {comboItems.length > 0 && (
                        <section className="rc-section">
                            <div className="rc-section-title">
                                <h3>🍱 Combos</h3>
                                <small>See All ›</small>
                            </div>

                            <div className="rc-deal-row" data-preserve-scroll>
                                {comboItems.map((item) => {
                                    const quantity = getQuantity(item.id);

                                    return (
                                        <div key={item.id} className={`rc-food-card rc-combo-card rc-glass ${!isItemAvailable(item) ? 'is-unavailable' : ''}`}>
                                            <ComboImageSlider combo={item} allItems={allItems} />
                                            <FoodContent item={item} quantity={quantity} setMenuQuantity={setMenuQuantity} isCombo />
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    <section className="rc-section rc-menu-results-section">
                        <div key={`category-title-${menuAnimationKey}`} className="rc-selected-category-indicator">
                            <h3>{activeCategoryLabel}</h3>
                            <span aria-hidden="true" />
                        </div>
                        <div key={menuAnimationKey} className="rc-menu-results-animate">
                            {filteredItems.length ? (
                                filteredItems.map((item) => {
                                    const quantity = getQuantity(item.id);
                                    return (
                                        <div key={item.id} className={`rc-food-list-card rc-glass ${!isItemAvailable(item) ? 'is-unavailable' : ''}`}>
                                            <FoodMedia item={item} />
                                            <FoodContent item={item} quantity={quantity} setMenuQuantity={setMenuQuantity} />
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="rc-empty rc-glass">No {activeCategory === 'all' ? 'food' : activeCategory} available</div>
                            )}
                        </div>
                    </section>
                </div>

                {showFilter &&
                    createPortal(
                        <div className="rc-filter-layer">
                            <button
                                className="rc-filter-backdrop"
                                type="button"
                                aria-label="Close filters"
                                onClick={() => setShowFilter(false)}
                            />
                            <div className="rc-filter-sheet">
                                <div className="rc-filter-handle" />
                                <div className="rc-filter-title-row">
                                    <h3>Filter</h3>
                                    <button type="button" onClick={() => setShowFilter(false)}>×</button>
                                </div>

                                <div className="rc-filter-group">
                                    <h4>Food Type</h4>
                                    {[
                                        { value: 'ALL', label: 'All' },
                                        { value: 'VEG', label: 'Veg' },
                                        { value: 'NON_VEG', label: 'Non-Veg' }
                                    ].map((option) => (
                                        <label key={option.value} className="rc-filter-option">
                                            <span>{option.label}</span>
                                            <input
                                                type="radio"
                                                name="food-filter"
                                                checked={draftFoodFilter === option.value}
                                                onChange={() => setDraftFoodFilter(option.value)}
                                            />
                                        </label>
                                    ))}
                                </div>

                                <div className="rc-filter-divider" />

                                <div className="rc-filter-group">
                                    <h4>Sort By</h4>
                                    {[
                                        { value: 'LOW_TO_HIGH', label: 'Price: Low to High' },
                                        { value: 'HIGH_TO_LOW', label: 'Price: High to Low' }
                                    ].map((option) => (
                                        <label key={option.value} className="rc-filter-option">
                                            <span>{option.label}</span>
                                            <input
                                                type="radio"
                                                name="price-sort"
                                                checked={draftPriceSort === option.value}
                                                onChange={() => setDraftPriceSort(option.value)}
                                            />
                                        </label>
                                    ))}
                                </div>

                                <div className="rc-filter-actions">
                                    <button className="rc-filter-clear" type="button" onClick={clearFilters}>Clear</button>
                                    <button className="rc-filter-apply" type="button" onClick={applyFilters}>Apply</button>
                                </div>
                            </div>
                        </div>,
                        document.body
                    )}

                {cartItems.length > 0 &&
                    createPortal(
                        <button className="rc-floating-cart rc-glass" type="button" onClick={() => setShowCartScreen(true)}>
                            <span className="rc-cart-icon">
                                🛒<span className="rc-badge">{cartCount}</span>
                            </span>
                            <span>
                                <b key={`${cartCount}-${subtotal}`} className="rc-cart-value-pop">
                                    {cartCount} Items | ₹{subtotal.toFixed(0)}
                                </b>
                                <small>Tap to view cart</small>
                            </span>
                            <b>View Cart →</b>
                        </button>,
                        document.body
                    )}

                {toastText && createPortal(<div className="rc-toast">{toastText}</div>, document.body)}

                {openPanel &&
                    createPortal(
                        <button
                            aria-label="Close"
                            className="rc-overlay"
                            type="button"
                            onClick={() => setOpenPanel('')}
                        />,
                        document.body
                    )}

                <NotificationCenter
                    open={openPanel === 'notifications'}
                    onClose={() => setOpenPanel('')}
                    audience="customer"
                    token={customerToken || localStorage.getItem('rcCustomerPushToken')}
                    onUnreadChange={setUnreadCount}
                />

                <SideDrawer open={openPanel === 'profile'} title="My Profile" onClose={() => setOpenPanel('')}>
                    <div className="rc-profile-card rc-glass">
                        <div className="rc-profile-avatar" aria-hidden="true">👤</div>
                        <div>
                            <h3>{customerName}</h3>
                            {features.customerOtpLogin && <p>{customerMobile || 'Mobile number not available'}</p>}
                        </div>
                    </div>
                    <button className="rc-option rc-profile-option rc-glass" type="button" onClick={openMyOrders}><span>🧾</span><b>My Orders</b><small>View current and previous orders</small></button>
                    <button className="rc-option rc-profile-option rc-glass" type="button" onClick={() => showComingSoon('Favorites')}><span>❤️</span><b>Favorites</b><small>Your saved food items</small></button>
                    <button className="rc-option rc-profile-option rc-glass" type="button" onClick={() => showComingSoon('Recently Visited')}><span>🏪</span><b>Recently Visited</b><small>Restaurants visited with RC Dine</small></button>
                    <button className="rc-option rc-profile-option rc-glass" type="button" onClick={() => showComingSoon('Saved Addresses')}><span>📍</span><b>Saved Addresses</b><small>Manage delivery addresses</small></button>
                    <button className="rc-option rc-profile-option rc-glass" type="button" onClick={() => showComingSoon('Payment Methods')}><span>💳</span><b>Payment Methods</b><small>Manage cards and UPI</small></button>
                    <button className="rc-option rc-profile-option rc-glass" type="button" onClick={() => setOpenPanel('notifications')}><span>🔔</span><b>Notifications</b><small>Order and restaurant updates</small></button>
                    {features.customerOtpLogin && (
                        <button className="rc-option rc-profile-option rc-glass" type="button" onClick={() => showComingSoon('Logged-in Devices')}><span>📱</span><b>Logged-in Devices</b><small>Manage active sessions</small></button>
                    )}
                    <button className="rc-option rc-profile-option rc-glass" type="button" onClick={() => setOpenPanel('help')}><span>❓</span><b>Help & Support</b><small>Get support for your order</small></button>
                    <button className="rc-option rc-profile-option rc-glass" type="button" onClick={() => setOpenPanel('privacy')}><span>🔒</span><b>Privacy Policy</b><small>How RC Dine uses your data</small></button>
                    <button className="rc-option rc-profile-option rc-glass" type="button" onClick={() => setOpenPanel('terms')}><span>📄</span><b>Terms & Conditions</b><small>Read customer terms</small></button>
                    {features.customerOtpLogin && (
                        <button className="rc-option rc-profile-option rc-profile-logout" type="button" onClick={logoutCustomer}><span>↪</span><b>Logout</b><small>Logout from this device</small></button>
                    )}
                </SideDrawer>

                <SideDrawer open={openPanel === 'info'} title="Restaurant Info" onClose={() => setOpenPanel('')}>
                    <div className="rc-restaurant-profile-card rc-glass">
                        <span className="rc-restaurant-profile-logo">
                            <SmartImage src={hotelDetails.logo || defaultLogo} alt={`${hotelDetails.cafeName} logo`} fallbackSrc={defaultLogo} />
                        </span>
                        <div><h3>{hotelDetails.cafeName}</h3><p>⭐ {getCleanText(hotelDetails.rating, 'Rating not available')} · Table {tableNumber ?? '-'}</p></div>
                    </div>
                    <div className="rc-restaurant-info-card rc-glass">
                        <p>📍 {getCleanText(hotelDetails.address, 'Address not available')}</p>
                        <p>📞 {getCleanText(hotelDetails.phone, 'Contact not available')}</p>
                        <p>🕒 {getCleanText(hotelDetails.timing, 'Timing not available')}</p>
                        <p>ℹ {getCleanText(hotelDetails.about, 'About cafe not available')}</p>
                    </div>
                    {features.rcSession && rcSession?.sessionCode && (
                        <>
                            <button className="rc-option rc-glass" type="button" onClick={copySessionCode}>🔢 Copy Session Code</button>
                            <button className="rc-option rc-glass" type="button" onClick={shareSessionCode}>📤 Share Session Code</button>
                            <button className="rc-option rc-glass" type="button" onClick={() => setOpenPanel('members')}>👥 Session Members</button>
                            {sessionDetails?.isHost && <button className="rc-option rc-glass rc-session-menu-row" type="button" onClick={() => setOpenPanel('pending')}><span>⏳ Pending Requests</span>{pendingRequests.length > 0 && <span className="rc-badge">{pendingRequests.length}</span>}</button>}
                            {sessionDetails?.isHost && <button className="rc-option rc-glass rc-session-danger" type="button" onClick={() => setOpenPanel('end-session')}>End Session</button>}
                        </>
                    )}
                    <button className="rc-option rc-glass" type="button" onClick={shareCafe}>📤 Share Restaurant</button>
                    <button className="rc-option rc-glass" type="button" onClick={callRestaurant}>📞 Call Restaurant</button>
                    <button className="rc-option rc-glass" type="button" onClick={() => showComingSoon('Table Info')}>🍽 Table Info</button>
                    <button className="rc-option rc-glass" type="button" onClick={() => setOpenPanel('report')}>🚩 Report Restaurant</button>
                    <button className="rc-option rc-glass" type="button" onClick={() => setOpenPanel('help')}>❓ Help & Support</button>
                    <button className="rc-option rc-glass" type="button" onClick={() => setOpenPanel('privacy')}>🔒 Privacy Policy</button>
                    <button className="rc-option rc-glass" type="button" onClick={() => setOpenPanel('terms')}>📄 Terms & Conditions</button>
                </SideDrawer>

                <BottomSheet open={features.rcSession && openPanel === 'session-details'} title="Session Details" onClose={() => setOpenPanel('')}>
                    <div className="rc-session-details-card rc-glass">
                        <small>RC Session Code</small>
                        <strong>RC: {rcSession?.sessionCode}</strong>
                        <p>{sessionDetails?.isHost ? 'You are the host' : 'You are a member'}</p>
                        <button type="button" className="rc-session-primary" onClick={copySessionCode}>Copy Session Code</button>
                        <button type="button" className="rc-session-secondary" onClick={shareSessionCode}>Share Session Code</button>
                    </div>
                </BottomSheet>

                <SideDrawer open={features.rcSession && openPanel === 'members'} title="Session Members" onClose={() => setOpenPanel('')}>
                    {(sessionDetails?.members || []).map((member) => (
                        <div key={member.id} className="rc-option rc-glass rc-session-member-row">
                            <span>
                                <b>{member.role === 'OWNER' ? '👑 Host' : '👤 Member'}</b>
                                <small>{String(member.mobileNumber).slice(0, 2)}xxxxxx{String(member.mobileNumber).slice(-2)}</small>
                            </span>
                            {sessionDetails?.isHost && member.role !== 'OWNER' && (
                                <button type="button" disabled={sessionBusy} onClick={() => removeMember(member.id)}>Remove Member</button>
                            )}
                        </div>
                    ))}
                    {!sessionDetails?.isHost && (
                        <button className="rc-session-danger-button" type="button" disabled={sessionBusy} onClick={leaveSession}>
                            Leave Session
                        </button>
                    )}
                </SideDrawer>

                <SideDrawer open={features.rcSession && openPanel === 'pending'} title="Pending Requests" onClose={() => setOpenPanel('')}>
                    {pendingRequests.length === 0 && <div className="rc-option rc-glass">No pending requests</div>}
                    {pendingRequests.map((request) => (
                        <div key={request.id} className="rc-option rc-glass rc-join-request-card">
                            <b>{request.requesterName || 'Friend'} wants to join your session.</b>
                            <p>Phone: {String(request.mobileNumber).slice(0, 2)}xxxxxx{String(request.mobileNumber).slice(-2)}</p>
                            <div>
                                <button type="button" disabled={sessionBusy} onClick={() => respondToJoinRequest(request, 'REJECT')}>Reject</button>
                                <button type="button" disabled={sessionBusy} onClick={() => respondToJoinRequest(request, 'ACCEPT')}>Accept</button>
                            </div>
                        </div>
                    ))}
                </SideDrawer>

                <BottomSheet open={features.rcSession && Boolean(joinRequestPopup)} title="Join Request" onClose={() => setJoinRequestPopup(null)}>
                    {joinRequestPopup && (
                        <div className="rc-join-request-card rc-glass">
                            <h3>{joinRequestPopup.requesterName || 'Friend'} wants to join your session.</h3>
                            <p>Phone: {String(joinRequestPopup.mobileNumber).slice(0, 2)}xxxxxx{String(joinRequestPopup.mobileNumber).slice(-2)}</p>
                            <div>
                                <button type="button" disabled={sessionBusy} onClick={() => respondToJoinRequest(joinRequestPopup, 'REJECT')}>Reject</button>
                                <button type="button" disabled={sessionBusy} onClick={() => respondToJoinRequest(joinRequestPopup, 'ACCEPT')}>Accept</button>
                            </div>
                        </div>
                    )}
                </BottomSheet>

                <BottomSheet open={features.rcSession && openPanel === 'end-session'} title="End Session?" onClose={() => setOpenPanel('')}>
                    <div className="rc-session-confirm">
                        <p>This removes all pending requests and returns every member to normal customer mode.</p>
                        <button type="button" className="rc-session-danger-button" disabled={sessionBusy} onClick={endSession}>
                            {sessionBusy ? 'Ending…' : 'End Session'}
                        </button>
                    </div>
                </BottomSheet>

                <BottomSheet open={openPanel === 'help'} title="Help & Support" onClose={() => setOpenPanel('')}>
                    <div className="rc-restaurant-info-card rc-glass">
                        <p>For order assistance, please contact the restaurant staff.</p>
                        <button className="rc-option rc-glass" type="button" onClick={callRestaurant}>📞 Call Restaurant</button>
                    </div>
                </BottomSheet>

                <BottomSheet open={openPanel === 'privacy'} title="Privacy Policy" onClose={() => setOpenPanel('')}>
                    <p className="rc-muted">RC Dine stores the minimum customer and order information required to provide ordering, payment and support services.</p>
                    <p className="rc-muted">Detailed production policy text can be connected here later.</p>
                </BottomSheet>

                <BottomSheet open={openPanel === 'report'} title="Report Restaurant" onClose={() => setOpenPanel('')}>
                    <div className="rc-restaurant-info-card rc-glass">
                        <p>Report incorrect menu, pricing, hygiene or service information.</p>
                        <button className="rc-session-danger-button" type="button" onClick={() => showComingSoon('Restaurant reporting')}>Continue</button>
                    </div>
                </BottomSheet>

                <BottomSheet open={openPanel === 'terms'} title="Terms & Conditions" onClose={() => setOpenPanel('')}>
                    <p className="rc-muted">Orders once placed will be prepared by the restaurant.</p>
                    <p className="rc-muted">Refund and cancellation policy depends on restaurant rules.</p>
                    <p className="rc-muted">For payment or order issues, please contact restaurant staff.</p>
                </BottomSheet>

                {showCartScreen &&
                    createPortal(
                        <div className="rc-cart-screen">
                            <div className="rc-cart-top">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowUpsellPopup(false);
                                        setShowCartScreen(false);
                                    }}
                                >
                                    ←
                                </button>
                                <h3>Your Cart</h3>
                                <span />
                            </div>

                            <div className="rc-cart-screen-body" data-preserve-scroll>
                                {cartItems.length ? (
                                    cartItems.map((item) => (
                                        <div key={item.id} className="rc-cart-screen-item rc-glass">
                                            <div>
                                                <b>{item.name}</b>
                                                <small>{item.quantity} × ₹{item.price}</small>
                                            </div>
                                            <b>₹{item.quantity * item.price}</b>
                                        </div>
                                    ))
                                ) : (
                                    <div className="rc-empty rc-glass">Cart is empty</div>
                                )}

                                <div className="rc-tip-row">
                                    {[0, 20, 50].map((amount) => (
                                        <button
                                            key={amount}
                                            type="button"
                                            className={`rc-tip ${selectedTip === amount ? 'active' : ''}`}
                                            onClick={() => setSelectedTip(amount)}
                                        >
                                            ₹{amount}
                                        </button>
                                    ))}
                                </div>

                                <div className="rc-summary rc-glass">
                                    <div>
                                        <span>Subtotal</span>
                                        <b>₹{subtotal.toFixed(0)}</b>
                                    </div>
                                    {discountAmount > 0 && (
                                        <div>
                                            <span>Discount {discountType === 'PERCENT' ? `(${discountValue}%)` : ''}</span>
                                            <b>-₹{discountAmount.toFixed(0)}</b>
                                        </div>
                                    )}
                                    <div>
                                        <span>GST ({gstPercent}%)</span>
                                        <b>₹{gstAmount.toFixed(2)}</b>
                                    </div>
                                    <div>
                                        <span>Tip</span>
                                        <b>₹{selectedTip}</b>
                                    </div>
                                    <div className="total">
                                        <span>Grand Total</span>
                                        <b key={grandTotal} className="rc-cart-value-pop">₹{grandTotal.toFixed(2)}</b>
                                    </div>
                                </div>
                            </div>

                            <div className="rc-cart-screen-footer">
                                <Button className="rc-pay-btn" onClick={handleProceedToPayment}>
                                    Proceed to Payment →
                                </Button>
                            </div>
                        </div>,
                        document.body
                    )}

                {showUpsellPopup &&
                    createPortal(
                        <div className="rc-upsell-layer">
                            <button
                                className="rc-upsell-backdrop"
                                type="button"
                                aria-label="Close suggestion popup"
                                onClick={() => setShowUpsellPopup(false)}
                            />
                            <div className="rc-upsell-modal">
                                <div className="rc-upsell-icon">🛒<span>✓</span></div>
                                <h2>Almost Done! 🎉</h2>
                                <p>Would you like to add something else to make your meal perfect?</p>

                                <div className="rc-upsell-list" data-preserve-scroll>
                                    {cartSuggestionItems.map((item) => {
                                        const quantity = getQuantity(item.id);

                                        return (
                                            <div key={item.id} className="rc-upsell-item">
                                                <FoodMedia item={item} />
                                                <div>
                                                    <b>{item.name}</b>
                                                    <small>{getItemDescription(item)}</small>
                                                </div>
                                                <strong>₹{item.price}</strong>
                                                <QtyButton item={item} quantity={quantity} setMenuQuantity={setMenuQuantity} />
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="rc-upsell-actions">
                                    <button type="button" className="rc-no-thanks" onClick={() => { setShowUpsellPopup(false); finishPayment(); }}>
                                        No Thanks
                                    </button>
                                    <button type="button" className="rc-add-continue" onClick={handleAddAndContinue}>
                                        Continue to Pay
                                    </button>
                                </div>
                            </div>
                        </div>,
                        document.body
                    )}

            </div>
        </div>
    );
}

const getComboItemIds = (combo = {}) => {
    if (Array.isArray(combo.comboItems)) return combo.comboItems.map((item) => (typeof item === 'object' ? String(item.id || item.menuId || '') : String(item))).filter(Boolean);
    if (Array.isArray(combo.items)) return combo.items.map((item) => (typeof item === 'object' ? String(item.id || item.menuId || '') : String(item))).filter(Boolean);
    if (Array.isArray(combo.foodItems)) return combo.foodItems.map((item) => (typeof item === 'object' ? String(item.id || item.menuId || '') : String(item))).filter(Boolean);

    try {
        return JSON.parse(combo.comboItems || '[]').map((item) => (typeof item === 'object' ? String(item.id || item.menuId || '') : String(item))).filter(Boolean);
    } catch (error) {
        return [];
    }
};

const getComboImages = (combo = {}, allItems = []) => {
    const directItems = []
        .concat(Array.isArray(combo.comboItems) ? combo.comboItems : [])
        .concat(Array.isArray(combo.items) ? combo.items : [])
        .concat(Array.isArray(combo.foodItems) ? combo.foodItems : []);

    const directImages = directItems
        .filter((item) => item && typeof item === 'object')
        .map(getItemImage)
        .filter(Boolean);

    if (directImages.length) return directImages.slice(0, 5);

    const ids = getComboItemIds(combo);
    return ids
        .map((id) => allItems.find((item) => String(item.id) === String(id)))
        .filter(Boolean)
        .map(getItemImage)
        .filter(Boolean)
        .slice(0, 5);
};

function ComboImageSlider({ combo, allItems }) {
    const images = useMemo(() => getComboImages(combo, allItems), [combo, allItems]);
    const itemCount = getComboItemIds(combo).length || images.length;
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        setActiveIndex(0);
    }, [images.length]);

    useEffect(() => {
        if (images.length <= 1) return undefined;
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % images.length);
        }, 2400);
        return () => clearInterval(timer);
    }, [images.length]);

    if (!images.length) {
        return (
            <div className="rc-combo-slider-placeholder">
                🍱
                <span>{itemCount || 2} Items Combo</span>
            </div>
        );
    }

    return (
        <div className="rc-combo-slider">
            <SmartImage src={images[activeIndex]} alt={combo.name || 'Combo'} />
            <div className="rc-combo-count-badge">{itemCount || images.length} Items Combo</div>
            {images.length > 1 && (
                <div className="rc-combo-dots">
                    {images.map((_, index) => (
                        <span key={index} className={index === activeIndex ? 'active' : ''} />
                    ))}
                </div>
            )}
        </div>
    );
}

function FoodMedia({ item }) {
    const image = getItemImage(item);
    if (image) return <SmartImage className="rc-food-img" src={image} alt={item.name || 'Food'} />;
    return <div className="rc-food-placeholder">{String(item.name || 'F').trim().charAt(0).toUpperCase()}</div>;
}

function FoodContent({ item, quantity, setMenuQuantity, isCombo = false }) {
    return (
        <div className="rc-food-info">
            <div className="rc-food-line">
                <span className={isCombo ? 'rc-combo-mini-badge' : getFoodType(item) === 'NON_VEG' ? 'rc-nonveg' : 'rc-veg'}>{isCombo ? 'COMBO' : getFoodType(item) === 'NON_VEG' ? 'NON VEG' : 'VEG'}</span>
                <span>⭐ {item.rating || '4.7'}</span>
            </div>
            <h4>{item.name}</h4>
            <p>{getItemDescription(item)}</p>
            <div className="rc-price-row">
                <b>₹{item.price}</b>
                <QtyButton item={item} quantity={quantity} setMenuQuantity={setMenuQuantity} />
            </div>
        </div>
    );
}

function QtyButton({ item, quantity, setMenuQuantity }) {
    if (!isItemAvailable(item)) return <button className="rc-add-btn" type="button" disabled>+</button>;
    if (quantity > 0) {
        return (
            <div className="rc-qty">
                <button type="button" onClick={() => setMenuQuantity(item, Math.max(0, quantity - 1))}>-</button>
                <b key={quantity} className="rc-quantity-pop">{quantity}</b>
                <button type="button" onClick={() => setMenuQuantity(item, quantity + 1)}>+</button>
            </div>
        );
    }
    return <button className="rc-add-btn" type="button" onClick={() => setMenuQuantity(item, 1)}>+</button>;
}

function BottomSheet({ open, title, children, onClose }) {
    return createPortal(
        <div className={`rc-sheet rc-glass ${open ? 'open' : ''}`} data-preserve-scroll>
            <div className="rc-panel-head">
                <h3>{title}</h3>
                <button type="button" onClick={onClose}>×</button>
            </div>
            {children}
        </div>,
        document.body
    );
}

function SideDrawer({ open, title, children, onClose }) {
    return createPortal(
        <div className={`rc-drawer rc-glass ${open ? 'open' : ''}`} data-preserve-scroll>
            <div className="rc-panel-head">
                <h3>{title}</h3>
                <button type="button" onClick={onClose}>×</button>
            </div>
            {children}
        </div>,
        document.body
    );
}

export default memo(MenuCard);
