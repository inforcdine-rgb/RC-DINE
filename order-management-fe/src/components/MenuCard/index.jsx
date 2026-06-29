import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import '../../assets/styles/menuCard.css';
import Loader from '../Loader';

const types = {
    cover: 'COVER',
    category: 'CATEGORY',
    item: 'MENU_ITEM'
};

const CATEGORY_ICON = {
    all: '▦',
    pizza: '🍕',
    burger: '🍔',
    drinks: '🥤',
    drink: '🥤',
    beverage: '🥤',
    beverages: '🥤',
    starter: '🍟',
    starters: '🍟',
    chinese: '🥢',
    rice: '🍚',
    dessert: '🍰',
    combo: '🍱',
    combos: '🍱'
};

const ORDER_NOTIFICATION_COPY = {
    PLACED: { icon: '✔', title: 'Order Placed', text: 'Your order has been placed successfully.' },
    PENDING: { icon: '✔', title: 'Order Placed', text: 'Your order has been received by the restaurant.' },
    PREPARING: { icon: '🍳', title: 'Preparing', text: 'Chef started preparing your food.' },
    READY: { icon: '✅', title: 'Ready', text: 'Your order is ready.' },
    COMPLETED: { icon: '✔', title: 'Completed', text: 'Your order has been completed.' }
};

const getCategoryIcon = (name = '') => CATEGORY_ICON[String(name).toLowerCase()] || '🍽';
const getItemImage = (item = {}) => item.image || item.imageUrl || item.photo || item.photoUrl || '';
const isItemAvailable = (item = {}) => item.available !== false && item.status !== 'UNAVAILABLE';
const isTodayDeal = (item = {}) => item.isTodayDeal === true || item.todayDeal === true;
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
    handleClick = () => {},
    handleOnChange = () => {},
    tipAmount = 0,
    onTipAmountChange = () => {}
}) {
    const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('rcdineSplashSeen'));
    const [searchText, setSearchText] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [openPanel, setOpenPanel] = useState('');
    const [toastText, setToastText] = useState('');
    const [selectedTip, setSelectedTip] = useState(Number(tipAmount) || 0);
    const [notifications, setNotifications] = useState(() => {
        try {
            return JSON.parse(sessionStorage.getItem('rcdineNotifications') || '[]');
        } catch (error) {
            return [];
        }
    });
    const [unreadCount, setUnreadCount] = useState(() => Number(sessionStorage.getItem('rcdineUnreadCount')) || 0);

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
        sessionStorage.setItem('rcdineNotifications', JSON.stringify(notifications));
    }, [notifications]);

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
            about: source?.about || source?.description || source?.bio || ''
        };
    }, [data, name, pagesList]);

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
        return allItems.filter((item) => {
            const categoryOk = activeCategory === 'all' || item.categoryName === activeCategory;
            const searchableText = `${item.name || ''} ${item.categoryName || ''} ${getItemDescription(item)}`.toLowerCase();
            const searchOk = !query || searchableText.includes(query);
            return categoryOk && searchOk;
        });
    }, [activeCategory, allItems, searchText]);

    const todayDealItems = useMemo(() => allItems.filter(isTodayDeal), [allItems]);

    const comboItems = useMemo(
        () =>
            allItems.filter((item) => {
                const category = String(item.categoryName || '').toLowerCase();
                return category === 'combo' || category === 'combos';
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

    const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);
    const gstPercent = Number(data?.hotel?.gstPercent || data?.gstPercent || 5);
    const gstAmount = subtotal * (gstPercent / 100);
    const discountAmount = 0;
    const grandTotal = subtotal + gstAmount + selectedTip - discountAmount;
    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const getQuantity = (menuId) => Number(currentOrder?.[menuId]?.quantity) || 0;

    const showToast = (message) => {
        setToastText(message);
        setTimeout(() => setToastText(''), 1600);
    };

    const addNotification = (status, customText = '') => {
        const key = String(status || 'PLACED').toUpperCase();
        const copy = ORDER_NOTIFICATION_COPY[key] || ORDER_NOTIFICATION_COPY.PLACED;
        const nextNotification = {
            id: `${key}-${Date.now()}`,
            icon: copy.icon,
            title: copy.title,
            text: customText || copy.text,
            status: key,
            read: false,
            createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setNotifications((prev) => [nextNotification, ...prev].slice(0, 20));
        setUnreadCount((count) => count + 1);
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
        setUnreadCount(0);
        setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
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

    const sendHelp = (type) => {
        setOpenPanel('');
        showToast(`${type} sent to Manager`);
    };

    const handleProceedToPayment = () => {
        if (!cartItems.length) {
            showToast('Cart is empty');
            return;
        }
        addNotification('PLACED', 'Your order has been sent to restaurant.');
        localStorage.setItem('activeOrder', JSON.stringify({ orderId: Date.now(), status: 'PLACED' }));
        handleClick({ action: 'place' });
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
                    <div className="rc-splash-logo">
                        <div>
                            <b>R&C</b>
                            <span>Dine</span>
                        </div>
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
                <div className="rc-topbar">
                    <button className="rc-icon-btn rc-glass" type="button" onClick={() => setOpenPanel('more')}>
                        ⋮
                    </button>
                    <div className="rc-brand">
                        <b>R&C</b> <span>Dine</span>
                    </div>
                    <button className="rc-icon-btn rc-glass" type="button" onClick={openNotificationDrawer}>
                        🔔
                        {unreadCount > 0 && <span className="rc-badge">{unreadCount}</span>}
                    </button>
                </div>

                {localStorage.getItem('activeOrder') && (
                    <button
                        className="rc-mini-track rc-glass"
                        type="button"
                        onClick={() => window.location.assign(`/track-order/${JSON.parse(localStorage.getItem('activeOrder')).orderId}`)}
                    >
                        <span>
                            <b>🍳 Active Order</b>
                            <small>Preparing · ETA 15 min</small>
                        </span>
                        <b>View →</b>
                    </button>
                )}

                <button className="rc-restaurant-card rc-glass" type="button" onClick={() => setOpenPanel('info')}>
                    <div className="rc-restaurant-avatar">🍽</div>
                    <div>
                        <h3>{hotelDetails.cafeName}</h3>
                        <p>Table {tableNumber ?? '-'} · Tap for Restaurant Info</p>
                    </div>
                </button>

                <div className="rc-search rc-glass">
                    <span>🔍</span>
                    <input
                        value={searchText}
                        type="search"
                        placeholder="Search Pizza, Cheese, Burger..."
                        onChange={(event) => setSearchText(event.target.value)}
                    />
                </div>

                <div className="rc-categories">
                    <button
                        className={`rc-cat rc-glass ${activeCategory === 'all' ? 'active' : ''}`}
                        type="button"
                        onClick={() => setActiveCategory('all')}
                    >
                        <span>▦</span>All
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            className={`rc-cat rc-glass ${activeCategory === category.name ? 'active' : ''}`}
                            type="button"
                            onClick={() => setActiveCategory(category.name)}
                        >
                            <span>{getCategoryIcon(category.name)}</span>
                            {category.name}
                        </button>
                    ))}
                </div>

                {todayDealItems.length > 0 && (
                    <section className="rc-section">
                        <div className="rc-section-title">
                            <h3>🔥 Today&apos;s Deal</h3>
                            <small>Manager ON karega tabhi dikhega</small>
                        </div>
                        <div className="rc-deal-row">
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

                {comboItems.length > 0 && (
                    <section className="rc-section">
                        <div className="rc-section-title">
                            <h3>🍱 Combos</h3>
                            <small>See All ›</small>
                        </div>

                        <div className="rc-deal-row">
                            {comboItems.map((item) => {
                                const quantity = getQuantity(item.id);

                                return (
                                    <div key={item.id} className="rc-food-card rc-glass">
                                        <FoodMedia item={item} />
                                        <FoodContent item={item} quantity={quantity} setMenuQuantity={setMenuQuantity} />
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                <section className="rc-section">
                    <div className="rc-section-title">
                        <h3>Menu</h3>
                        <small>Food name, category, description search</small>
                    </div>
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
                        <div className="rc-empty rc-glass">No food found</div>
                    )}
                </section>

                {cartItems.length > 0 && (
                    <button className="rc-floating-cart rc-glass" type="button" onClick={() => setOpenPanel('cart')}>
                        <span className="rc-cart-icon">
                            🛒<span className="rc-badge">{cartCount}</span>
                        </span>
                        <span>
                            <b>{cartCount} Items | ₹{subtotal.toFixed(0)}</b>
                            <small>Tap to view cart</small>
                        </span>
                        <b>View Cart →</b>
                    </button>
                )}

                {toastText && <div className="rc-toast">{toastText}</div>}

                {openPanel && <button aria-label="Close" className="rc-overlay" type="button" onClick={() => setOpenPanel('')} />}

                <SideDrawer open={openPanel === 'notifications'} title="🔔 Notifications" onClose={() => setOpenPanel('')}>
                    {notifications.length ? (
                        notifications.map((item) => (
                            <div key={item.id} className={`rc-option rc-glass ${item.read ? 'is-read' : 'is-unread'}`}>
                                <b>
                                    {item.icon} {item.title}
                                </b>
                                <p>{item.text}</p>
                                <small>{item.createdAt}</small>
                            </div>
                        ))
                    ) : (
                        <div className="rc-option rc-glass rc-empty-option">No notifications yet</div>
                    )}
                    {notifications.length > 0 && (
                        <button className="rc-clear-btn" type="button" onClick={() => setNotifications([])}>
                            Clear All
                        </button>
                    )}
                    <div className="rc-status-preview">
                        <small>Status flow</small>
                        <div>✔ Order Placed</div>
                        <div>🍳 Preparing</div>
                        <div>✅ Ready</div>
                        <div>✔ Completed</div>
                    </div>
                </SideDrawer>

                <BottomSheet open={openPanel === 'info'} title="Restaurant Info" onClose={() => setOpenPanel('')}>
                    <div className="rc-restaurant-info-card rc-glass">
                        <h3>{hotelDetails.cafeName}</h3>
                        <p>⭐ {getCleanText(hotelDetails.rating, 'Rating not available')}</p>
                        <p>🍽 Table {tableNumber ?? '-'}</p>
                        <p>📍 {getCleanText(hotelDetails.address, 'Address not available')}</p>
                        <p>📞 {getCleanText(hotelDetails.phone, 'Contact not available')}</p>
                        <p>🕒 {getCleanText(hotelDetails.timing, 'Timing not available')}</p>
                        <p>ℹ {getCleanText(hotelDetails.about, 'About cafe not available')}</p>
                    </div>
                </BottomSheet>

                <BottomSheet open={openPanel === 'more'} title="Menu" onClose={() => setOpenPanel('')}>
                    <button className="rc-option rc-glass" type="button" onClick={() => setOpenPanel('info')}>
                        🏪 Restaurant Info
                    </button>
                    <button className="rc-option rc-glass" type="button" onClick={shareCafe}>
                        📤 Share Cafe
                    </button>
                    <button className="rc-option rc-glass" type="button" onClick={callRestaurant}>
                        📞 Call Restaurant
                    </button>
                    <button className="rc-option rc-glass" type="button" onClick={() => setOpenPanel('terms')}>
                        📄 Terms & Conditions
                    </button>
                </BottomSheet>

                <BottomSheet open={openPanel === 'terms'} title="Terms & Conditions" onClose={() => setOpenPanel('')}>
                    <p className="rc-muted">Orders once placed will be prepared by the restaurant.</p>
                    <p className="rc-muted">Refund and cancellation policy depends on restaurant rules.</p>
                    <p className="rc-muted">For payment or order issues, please contact restaurant staff.</p>
                </BottomSheet>

                <BottomSheet open={openPanel === 'cart'} title="Your Cart" onClose={() => setOpenPanel('')}>
                    {cartItems.map((item) => (
                        <div key={item.id} className="rc-cart-row">
                            <span>{item.name}</span>
                            <b>{item.quantity} × ₹{item.price}</b>
                        </div>
                    ))}
                    <div className="rc-tip-row">
                        {[0, 20, 50].map((amount) => (
                            <button key={amount} type="button" className={`rc-tip ${selectedTip === amount ? 'active' : ''}`} onClick={() => setSelectedTip(amount)}>
                                ₹{amount}
                            </button>
                        ))}
                    </div>
                    <div className="rc-summary rc-glass">
                        <div>
                            <span>Subtotal</span>
                            <b>₹{subtotal.toFixed(0)}</b>
                        </div>
                        <div>
                            <span>GST ({gstPercent}%)</span>
                            <b>₹{gstAmount.toFixed(2)}</b>
                        </div>
                        <div>
                            <span>Tip</span>
                            <b>₹{selectedTip}</b>
                        </div>
                        <div>
                            <span>Discount</span>
                            <b>-₹{discountAmount}</b>
                        </div>
                        <div className="total">
                            <span>Grand Total</span>
                            <b>₹{grandTotal.toFixed(2)}</b>
                        </div>
                    </div>
                    <Button className="rc-pay-btn" onClick={handleProceedToPayment}>
                        Proceed to Razorpay →
                    </Button>
                </BottomSheet>

                <BottomSheet open={openPanel === 'help'} title="Need Help" onClose={() => setOpenPanel('')}>
                    {['Wrong Order', 'Food Cold', 'Need Water', 'Need Spoon', 'Other'].map((item) => (
                        <button key={item} className="rc-option rc-glass" type="button" onClick={() => sendHelp(item)}>
                            {item}
                        </button>
                    ))}
                </BottomSheet>
            </div>
        </div>
    );
}

function FoodMedia({ item }) {
    const image = getItemImage(item);
    if (image) return <img className="rc-food-img" src={image} alt={item.name || 'Food'} />;
    return <div className="rc-food-placeholder">{String(item.name || 'F').trim().charAt(0).toUpperCase()}</div>;
}

function FoodContent({ item, quantity, setMenuQuantity }) {
    return (
        <div className="rc-food-info">
            <div className="rc-food-line">
                <span className={getFoodType(item) === 'NON_VEG' ? 'rc-nonveg' : 'rc-veg'}>{getFoodType(item) === 'NON_VEG' ? 'NON VEG' : 'VEG'}</span>
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
                <b>{quantity}</b>
                <button type="button" onClick={() => setMenuQuantity(item, quantity + 1)}>+</button>
            </div>
        );
    }
    return <button className="rc-add-btn" type="button" onClick={() => setMenuQuantity(item, 1)}>+</button>;
}

function BottomSheet({ open, title, children, onClose }) {
    return (
        <div className={`rc-sheet rc-glass ${open ? 'open' : ''}`}>
            <div className="rc-panel-head">
                <h3>{title}</h3>
                <button type="button" onClick={onClose}>×</button>
            </div>
            {children}
        </div>
    );
}

function SideDrawer({ open, title, children, onClose }) {
    return (
        <div className={`rc-drawer rc-glass ${open ? 'open' : ''}`}>
            <div className="rc-panel-head">
                <h3>{title}</h3>
                <button type="button" onClick={onClose}>×</button>
            </div>
            {children}
        </div>
    );
}

export default MenuCard;
