import React, { useMemo, useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import '../../assets/styles/menuCard.css';
import Loader from '../Loader';

const types = { cover: 'COVER', category: 'CATEGORY', item: 'MENU_ITEM' };

const categoryIcons = {
    all: '▦', bestseller: '🔥', pizza: '🍕', burger: '🍔', drinks: '🥤', beverages: '🥤', desserts: '🍰', biryani: '🍛', starters: '🍟'
};

const foodEmoji = (name = '') => {
    const lower = String(name).toLowerCase();
    if (lower.includes('pizza')) return '🍕';
    if (lower.includes('burger')) return '🍔';
    if (lower.includes('pasta')) return '🍝';
    if (lower.includes('biryani')) return '🍛';
    if (lower.includes('cola') || lower.includes('drink') || lower.includes('juice')) return '🥤';
    if (lower.includes('cake') || lower.includes('dessert')) return '🍰';
    return '🍽️';
};

function MenuCard({ data = {}, currentOrder = {}, name = '', tableNumber, handleClick = () => {}, handleOnChange = () => {}, tipAmount = 0, onTipAmountChange = () => {} }) {
    const [isPlacing, setIsPlacing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [customTip, setCustomTip] = useState('');

    const pagesList = useMemo(() => {
        if (!data || typeof data !== 'object') return [];
        return Object.keys(data).sort((a, b) => Number(a) - Number(b)).map((key) => data[key]);
    }, [data]);

    const { categories, itemsByCategoryName, allItems } = useMemo(() => {
        const extractedCategories = [];
        const itemsMap = {};
        const mergedItems = [];

        pagesList.forEach((page) => {
            if (!page?.type) return;
            if (page.type === types.category && Array.isArray(page.data)) {
                page.data.forEach((cat) => {
                    if (cat?.id && cat?.name) extractedCategories.push({ id: cat.id, name: cat.name });
                });
            }
            if (page.type === types.item && Array.isArray(page.data)) {
                const categoryName = page.title;
                if (!categoryName) return;
                if (!itemsMap[categoryName]) itemsMap[categoryName] = [];
                const items = page.data.map((item) => ({ ...item, categoryName }));
                itemsMap[categoryName].push(...items);
                mergedItems.push(...items);
            }
        });

        return { categories: extractedCategories, itemsByCategoryName: itemsMap, allItems: mergedItems };
    }, [pagesList]);

    const hasLocalOverrides = useMemo(() => !!Object.keys(currentOrder || {}).find((key) => key !== 'lastUpdated'), [currentOrder]);
    const getQuantityForMenuItem = (menuId) => Number(currentOrder?.[menuId]?.quantity) || 0;

    const cartItems = useMemo(() => {
        const local = currentOrder || {};
        return Object.keys(local).filter((id) => id !== 'lastUpdated' && Number(local[id]?.quantity) > 0).map((id) => ({
            id,
            name: local[id]?.menuName || local[id]?.name,
            price: Number(local[id]?.price) || 0,
            quantity: Number(local[id]?.quantity) || 0,
            image: allItems.find((item) => String(item.id) === String(id))?.image,
            description: allItems.find((item) => String(item.id) === String(id))?.description
        }));
    }, [currentOrder, allItems]);

    const cartTotal = useMemo(() => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartItems]);
    const gst = useMemo(() => Math.round(cartTotal * 0.05 * 100) / 100, [cartTotal]);
    const normalizedTipAmount = useMemo(() => Math.max(0, Number(tipAmount) || 0), [tipAmount]);
    const finalAmount = useMemo(() => (!cartItems.length ? 0 : cartTotal + gst + normalizedTipAmount), [cartItems.length, cartTotal, gst, normalizedTipAmount]);
    const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);

    const filteredCategories = useMemo(() => {
        const query = searchText.trim().toLowerCase();
        const selected = activeCategory.toLowerCase();

        return categories.map((category) => {
            const items = itemsByCategoryName[category.name] || [];
            let filteredItems = selected === 'all' ? items : (category.name.toLowerCase() === selected ? items : []);
            if (query) {
                filteredItems = filteredItems.filter((item) =>
                    String(item.name || '').toLowerCase().includes(query) ||
                    String(item.description || '').toLowerCase().includes(query) ||
                    String(category.name || '').toLowerCase().includes(query)
                );
            }
            return { ...category, items: filteredItems };
        }).filter((category) => category.items.length);
    }, [categories, itemsByCategoryName, searchText, activeCategory]);

    const bestsellerItems = useMemo(() => allItems.slice(0, 3), [allItems]);

    const setMenuQuantity = (item, nextQuantity) => handleOnChange({ target: { value: nextQuantity } }, item);

    const handleProceedToPayment = () => {
        if (isPlacing || cartTotal <= 0 || !hasLocalOverrides) return;
        setIsPlacing(true);
        handleClick({ action: 'place' });
        setTimeout(() => setIsPlacing(false), 700);
    };

    const selectTip = (amount) => {
        setCustomTip('');
        onTipAmountChange(amount);
    };

    const renderImage = (item, className = '') => (
        <div className={`rc-food-image ${className}`}>
            {item.image ? <img src={item.image} alt={item.name} loading="lazy" /> : <span>{foodEmoji(item.name)}</span>}
        </div>
    );

    if (!pagesList.length) {
        return (
            <div className="d-flex justify-content-center w-100 h-100">
                <Card className="m-auto d-flex menu-container customer-order-loading">
                    <Card.Body className="d-flex align-items-center justify-content-center"><Loader /></Card.Body>
                </Card>
            </div>
        );
    }

    return (
        <div className="rc-customer-shell">
            {!isCartOpen ? (
                <div className="rc-mobile-page">
                    <div className="rc-status-row"><span>12:30</span><span>▮▮▮  WiFi  82</span></div>

                    <div className="rc-topbar">
                        <button type="button" className="rc-icon-btn">☰</button>
                        <div className="rc-brand"><span className="rc-chef">♨</span><span>R&amp;C</span> Dine</div>
                        <button type="button" className="rc-icon-btn rc-bell">🔔</button>
                    </div>

                    <div className="rc-cafe-card">
                        <div className="rc-cafe-photo">🍽️</div>
                        <div className="rc-cafe-info">
                            <h2>{name || 'R&C Dine Cafe'}</h2>
                            <p>Table {tableNumber ?? '-'} <span>•</span> <b>4.8 ★</b> (320)</p>
                        </div>
                    </div>

                    <div className="rc-search-row">
                        <span>⌕</span>
                        <input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search your favourite food..." />
                        <button type="button">☷</button>
                    </div>

                    <div className="rc-categories-row">
                        {[{ id: 'all', name: 'All' }, ...categories].map((category) => {
                            const key = category.name.toLowerCase();
                            const isActive = activeCategory.toLowerCase() === key;
                            return (
                                <button key={category.id} type="button" className={`rc-category-pill ${isActive ? 'active' : ''}`} onClick={() => setActiveCategory(category.name)}>
                                    <span>{categoryIcons[key] || foodEmoji(category.name)}</span>
                                    <b>{category.name}</b>
                                </button>
                            );
                        })}
                    </div>

                    <div className="rc-deal-banner">
                        <div><h3>🔥 Today’s Best Deals</h3><p>Up to <b>20% OFF</b> on Combos</p></div>
                        <div className="rc-deal-food">🍔🍟🥤</div>
                        <button type="button">→</button>
                    </div>

                    {bestsellerItems.length > 0 && activeCategory === 'All' && !searchText && (
                        <section className="rc-section">
                            <div className="rc-section-head"><h3>🔥 Bestseller</h3><button type="button">See All ›</button></div>
                            <div className="rc-bestseller-scroll">
                                {bestsellerItems.map((item) => (
                                    <div key={item.id} className="rc-best-card">
                                        {renderImage(item, 'rc-best-img')}
                                        <span className="rc-tag">Bestseller</span>
                                        <button type="button" className="rc-heart">♡</button>
                                        <div className="rc-best-body">
                                            <h4>{item.name}</h4>
                                            <p>★ 4.{Math.min(9, Number(item.price) % 10)} ({Math.max(54, Number(item.price) || 76)})</p>
                                            <div><b>₹{item.price}</b><button type="button" onClick={() => setMenuQuantity(item, getQuantityForMenuItem(item.id) + 1)}>+</button></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {filteredCategories.length === 0 ? (
                        <div className="rc-empty">No food items found</div>
                    ) : filteredCategories.map((category) => (
                        <section key={category.id} className="rc-section">
                            <div className="rc-section-head"><h3>{categoryIcons[category.name.toLowerCase()] || '🍽️'} {category.name}</h3><button type="button">View all ›</button></div>
                            <div className="rc-list">
                                {category.items.map((item, index) => {
                                    const quantity = getQuantityForMenuItem(item.id);
                                    return (
                                        <div key={item.id} className="rc-list-card">
                                            {renderImage(item, 'rc-list-img')}
                                            <button type="button" className="rc-card-heart">♡</button>
                                            <div className="rc-list-info">
                                                <h4>{item.name}</h4>
                                                {item.description && <p>{item.description}</p>}
                                                <div className="rc-meta"><b>₹{item.price}</b><span>★ 4.{index + 5} ({54 + index * 14})</span></div>
                                            </div>
                                            <div className="rc-list-action">
                                                {quantity > 0 ? (
                                                    <div className="rc-qty-red">
                                                        <button type="button" onClick={() => setMenuQuantity(item, Math.max(0, quantity - 1))}>−</button>
                                                        <span>{quantity}</span>
                                                        <button type="button" onClick={() => setMenuQuantity(item, quantity + 1)}>+</button>
                                                    </div>
                                                ) : (
                                                    <button type="button" className="rc-plus-btn" onClick={() => setMenuQuantity(item, 1)}>+</button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    ))}

                    <div className="rc-bottom-space" />
                    <div className="rc-cart-float">
                        <div className="rc-bag"><span>{cartCount}</span>🛍</div>
                        <div className="rc-cart-mid"><b>{cartCount || 0} Items</b><strong>₹{cartTotal}</strong><small>◇ You save ₹30</small></div>
                        <button type="button" onClick={() => setIsCartOpen(true)}>View Cart →</button>
                    </div>
                </div>
            ) : (
                <div className="rc-mobile-page rc-cart-page">
                    <div className="rc-cart-header">
                        <button type="button" onClick={() => setIsCartOpen(false)}>←</button>
                        <h2>Your Cart ✨</h2>
                        <span>{cartCount} Items · ₹{cartTotal}</span>
                    </div>

                    <div className="rc-cart-content">
                        <h5>ORDER ITEMS</h5>
                        {cartItems.length ? cartItems.map((item) => (
                            <div key={item.id} className="rc-cart-item">
                                {renderImage(item, 'rc-cart-img')}
                                <div><h4>{item.name}</h4><p>{item.quantity} × ₹{item.price}</p></div>
                                <b>₹{item.quantity * item.price}</b>
                                <button type="button" onClick={() => setMenuQuantity(item, 0)}>🗑</button>
                            </div>
                        )) : <div className="rc-empty">Cart is empty. Add food items first.</div>}

                        <div className="rc-tip-box">
                            <div>Add Tip ⓘ</div>
                            <button type="button" className={normalizedTipAmount === 10 ? 'active' : ''} onClick={() => selectTip(10)}>₹10</button>
                            <button type="button" className={normalizedTipAmount === 20 ? 'active' : ''} onClick={() => selectTip(20)}>₹20</button>
                            <button type="button" className={normalizedTipAmount === 50 ? 'active' : ''} onClick={() => selectTip(50)}>₹50</button>
                            <input type="number" min="0" value={customTip} placeholder="Other" onChange={(e) => { setCustomTip(e.target.value); onTipAmountChange(Math.max(0, Number(e.target.value) || 0)); }} />
                        </div>

                        <div className="rc-summary-box">
                            <h4>Order Summary</h4>
                            <p><span>Subtotal</span><b>₹ {cartTotal}</b></p>
                            <p><span>GST (5%)</span><b>₹ {gst}</b></p>
                            <p><span>Tip</span><b>₹ {normalizedTipAmount}</b></p>
                            <p className="total"><span>Total</span><b>₹ {finalAmount}</b></p>
                        </div>
                    </div>

                    <div className="rc-payment-footer">
                        <Button disabled={cartTotal <= 0 || isPlacing} onClick={handleProceedToPayment}>{isPlacing ? 'Processing...' : 'Proceed to Payment'} <span>→</span></Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MenuCard;
