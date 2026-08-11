import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as subscriptionService from '../../services/subscription.service';
import * as websiteService from '../../services/websiteSettings.service';
import { saveSelectedPlan, setPageSeo } from '../../utils/seo';

import './style.css';

const liveDemoItems = [
    { id: 'pizza', icon: '🍕', name: 'Farmhouse Pizza', detail: 'Cheese · Veggies', price: 249 },
    { id: 'burger', icon: '🍔', name: 'Classic Burger', detail: 'Crispy · Loaded', price: 179 },
    { id: 'coffee', icon: '🥤', name: 'Cold Coffee', detail: 'Creamy · Chilled', price: 129 }
];

const liveDemoTimeline = [
    { key: 'NEW', label: 'Sent' },
    { key: 'ACCEPTED', label: 'Accepted' },
    { key: 'PREPARING', label: 'Preparing' },
    { key: 'READY', label: 'Ready' }
];

const liveDemoStatus = {
    BROWSING: {
        label: 'Waiting for order',
        customerLabel: 'Build your order',
        helper: 'Customer phone se item add karke order place karein.'
    },
    NEW: {
        label: 'New order',
        customerLabel: 'Order sent',
        helper: 'Manager ko instant live notification mil gaya.',
        action: 'Accept order',
        next: 'ACCEPTED'
    },
    ACCEPTED: {
        label: 'Accepted',
        customerLabel: 'Restaurant accepted',
        helper: 'Customer screen par status turant update ho gaya.',
        action: 'Send to kitchen',
        next: 'PREPARING'
    },
    PREPARING: {
        label: 'Preparing',
        customerLabel: 'Preparing · 12 min',
        helper: 'Kitchen order prepare kar raha hai.',
        action: 'Mark ready',
        next: 'READY'
    },
    READY: {
        label: 'Ready to serve',
        customerLabel: 'Your order is ready',
        helper: 'Order complete—customer ko live update mil gaya.',
        action: 'Run demo again'
    }
};

const workflowSteps = [
    { icon: '📱', title: 'Customer scans QR', subtitle: 'Menu opens instantly' },
    { icon: '🧾', title: 'Order received', subtitle: 'Manager notified' },
    { icon: '👨‍🍳', title: 'Kitchen preparing', subtitle: 'Status updates live' },
    { icon: '💳', title: 'Payment complete', subtitle: 'Secure verification' },
    { icon: '📈', title: 'Analytics updated', subtitle: 'Revenue reflected instantly' }
];

const features = [
    {
        icon: '📲',
        title: 'QR Ordering',
        description: 'Customers scan, browse, customize and order directly from their table.'
    },
    {
        icon: '👨‍🍳',
        title: 'Kitchen Display',
        description: 'Real-time KOTs and clear preparation queues keep your kitchen organized.'
    },
    {
        icon: '⚡',
        title: 'Live Orders',
        description: 'Track every status across manager, kitchen and owner screens instantly.'
    },
    {
        icon: '💳',
        title: 'Smart Billing',
        description: 'Payments, taxes, discounts and printable receipts in one connected flow.'
    },
    {
        icon: '📊',
        title: 'Analytics',
        description: 'Understand revenue, popular dishes, order sources and business growth.'
    },
    {
        icon: '🔐',
        title: 'Subscription',
        description: 'Flexible plans with controlled access for every restaurant location.'
    }
];

const demoTabs = {
    customer: {
        tag: 'CUSTOMER',
        title: 'Scan, order and track',
        description: 'Fast menu browsing, group ordering, live tracking and secure payment.'
    },
    manager: {
        tag: 'MANAGER',
        title: 'Operate faster',
        description: 'Manage tables, walk-in orders, running bills, payments and daily operations.'
    },
    owner: {
        tag: 'OWNER',
        title: 'Grow with clarity',
        description: 'See performance, restaurants, managers and subscription access.'
    },
    kitchen: {
        tag: 'KITCHEN',
        title: 'Cook without chaos',
        description: 'Prioritized KOT cards, preparation timers and instant ready updates.'
    }
};

const fallbackPlans = [
    {
        code: 'MONTHLY',
        name: 'Monthly',
        amount: 999,
        days: 30,
        features: ['QR ordering', 'Manager POS', 'Live orders']
    },
    {
        code: 'HALF_YEARLY',
        name: 'Half Yearly',
        amount: 4999,
        days: 180,
        popular: true,
        features: ['Everything in Monthly', 'Priority support', 'Better savings']
    },
    {
        code: 'YEARLY',
        name: 'Yearly',
        amount: 8999,
        days: 365,
        features: ['Everything in Half Yearly', 'Best annual value', 'Full-year access']
    }
];

const reviews = [
    {
        quote: 'RC Dine reduced ordering delays and gave our staff one clear system.',
        name: 'Amit Kulkarni',
        restaurant: 'Urban Tadka'
    },
    {
        quote: 'The QR flow looks premium and customers understand it instantly.',
        name: 'Neha Shah',
        restaurant: 'Brew District'
    },
    {
        quote: 'Owner analytics made it easy to see what sells and when revenue peaks.',
        name: 'Rahul Patil',
        restaurant: 'Spice Route'
    },
    {
        quote: 'Manager POS and kitchen updates removed manual communication.',
        name: 'Sana Merchant',
        restaurant: 'The Green Fork'
    }
];

const faqs = [
    {
        question: 'Can customers order without installing an app?',
        answer: 'Yes. Customers scan the table QR and order directly from their mobile browser.'
    },
    {
        question: 'Does RC Dine support manager POS orders?',
        answer: 'Yes. Managers can create walk-in orders, add items later, accept payments and print KOT or receipts.'
    },
    {
        question: 'Can owners manage multiple restaurants?',
        answer: 'The enterprise setup can support multiple locations with separate managers, menus and analytics.'
    },
    {
        question: 'Is payment verification secure?',
        answer: 'RC Dine verifies customer payment on the backend before creating a paid order.'
    }
];

function StatCounter({ value, suffix = '', decimals = 0 }) {
    const [displayValue, setDisplayValue] = useState(0);
    const ref = useRef(null);

    useEffect(() => {
        const node = ref.current;
        if (!node) return undefined;

        let frameId;
        let started = false;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting || started) return;
                started = true;

                const duration = 1200;
                const start = performance.now();

                const animate = (now) => {
                    const progress = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    setDisplayValue(value * eased);

                    if (progress < 1) {
                        frameId = requestAnimationFrame(animate);
                    }
                };

                frameId = requestAnimationFrame(animate);
            },
            { threshold: 0.45 }
        );

        observer.observe(node);

        return () => {
            observer.disconnect();
            if (frameId) cancelAnimationFrame(frameId);
        };
    }, [value]);

    return (
        <strong ref={ref}>
            {displayValue.toFixed(decimals)}
            {suffix}
        </strong>
    );
}

function Landing() {
    const navigate = useNavigate();
    const [activeWorkflow, setActiveWorkflow] = useState(0);
    const [activeTab, setActiveTab] = useState('customer');
    const [openFaq, setOpenFaq] = useState(null);
    const [reviewIndex, setReviewIndex] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [toast, setToast] = useState('');
    const [plans, setPlans] = useState(fallbackPlans);
    const [website, setWebsite] = useState({});
    const [plansLoading, setPlansLoading] = useState(true);
    const [plansError, setPlansError] = useState('');
    const [demoCart, setDemoCart] = useState({});
    const [demoOrder, setDemoOrder] = useState(null);
    const [demoOrderStatus, setDemoOrderStatus] = useState('BROWSING');

    const activeDemo = demoTabs[activeTab];
    const demoCartCount = useMemo(
        () => liveDemoItems.reduce((total, item) => total + (demoCart[item.id] || 0), 0),
        [demoCart]
    );
    const demoCartTotal = useMemo(
        () => liveDemoItems.reduce((total, item) => total + item.price * (demoCart[item.id] || 0), 0),
        [demoCart]
    );
    const demoStatusMeta = liveDemoStatus[demoOrderStatus];
    const demoTimelineIndex = Math.max(
        0,
        liveDemoTimeline.findIndex((step) => step.key === demoOrderStatus)
    );

    const stats = useMemo(
        () => [
            { value: 500, suffix: '+', label: 'Restaurants' },
            { value: 50, suffix: 'K+', label: 'Orders' },
            { value: 99.9, suffix: '%', label: 'Uptime', decimals: 1 }
        ],
        []
    );

    useEffect(() => {
        const loadPlans = async () => {
            setPlansLoading(true);
            setPlansError('');
            try {
                const response = await subscriptionService.getPlans();
                const loadedPlans = Array.isArray(response)
                    ? response
                    : response?.plans || response?.data?.plans || response?.data || [];

                if (Array.isArray(loadedPlans) && loadedPlans.length > 0) {
                    setPlans(loadedPlans);
                }
            } catch (error) {
                setPlansError('Live prices are temporarily unavailable. Showing standard plans.');
                setPlans(fallbackPlans);
            } finally {
                setPlansLoading(false);
            }
        };

        loadPlans();
    }, []);

    useEffect(() => {
        const loadWebsite = async () => {
            try {
                setWebsite(await websiteService.getPublic());
            } catch (error) {
                setWebsite({});
            }
        };
        loadWebsite();
    }, []);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setActiveWorkflow((current) => (current + 1) % workflowSteps.length);
        }, 2000);

        return () => window.clearInterval(timer);
    }, []);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setReviewIndex((current) => (current + 1) % reviews.length);
        }, 4500);

        return () => window.clearInterval(timer);
    }, []);

    useEffect(() => {
        const revealElements = document.querySelectorAll('.rc-landing .reveal');

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('show');
                    }
                });
            },
            { threshold: 0.12 }
        );

        revealElements.forEach((element) => observer.observe(element));

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const handlePointerMove = (event) => {
            document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`);
            document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`);
        };

        window.addEventListener('pointermove', handlePointerMove);
        return () => window.removeEventListener('pointermove', handlePointerMove);
    }, []);

    const showToast = (message) => {
        setToast(message);
        window.clearTimeout(window.__rcDineLandingToastTimer);
        window.__rcDineLandingToastTimer = window.setTimeout(() => setToast(''), 2200);
    };

    useEffect(() => {
        setPageSeo({
            title: 'RC Dine – QR Restaurant Ordering & Management',
            description:
                'RC Dine connects QR ordering, manager POS, live kitchen updates, billing and restaurant analytics.'
        });
    }, []);

    const goToLogin = () => navigate('/login');
    const goToSignup = () => navigate('/signup');
    const choosePlan = (planCode) => {
        saveSelectedPlan(planCode);
        navigate(`/signup?plan=${encodeURIComponent(planCode)}`);
    };
    const handleFeatureTilt = (event) => {
        const card = event.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
    };

    const resetFeatureTilt = (event) => {
        event.currentTarget.style.transform = '';
    };

    const updateDemoQuantity = (itemId, change) => {
        if (demoOrder) return;

        setDemoCart((current) => {
            const nextQuantity = Math.min(5, Math.max(0, (current[itemId] || 0) + change));
            const nextCart = { ...current };

            if (nextQuantity === 0) delete nextCart[itemId];
            else nextCart[itemId] = nextQuantity;

            return nextCart;
        });
    };

    const placeDemoOrder = () => {
        if (!demoCartCount || demoOrder) return;

        setDemoOrder({
            number: '#RC-DEMO-24',
            itemCount: demoCartCount,
            total: demoCartTotal,
            items: liveDemoItems
                .filter((item) => demoCart[item.id])
                .map((item) => ({ ...item, quantity: demoCart[item.id] }))
        });
        setDemoOrderStatus('NEW');
        showToast('🔔 Demo order manager screen par receive ho gaya');
    };

    const resetLiveDemo = () => {
        setDemoCart({});
        setDemoOrder(null);
        setDemoOrderStatus('BROWSING');
    };

    const advanceDemoOrder = () => {
        if (demoOrderStatus === 'READY') {
            resetLiveDemo();
            return;
        }

        if (!demoStatusMeta.next) return;

        setDemoOrderStatus(demoStatusMeta.next);
        showToast(
            demoStatusMeta.next === 'READY'
                ? '✅ Customer ko “Order ready” update mil gaya'
                : '⚡ Status customer screen par live update ho gaya'
        );
    };

    return (
        <div className="rc-landing">
            <div className="pointer-glow" aria-hidden="true" />

            <nav className="landing-nav">
                <div className="landing-wrap landing-nav-inner">
                    <a className="landing-brand" href="#home" aria-label="RC Dine home">
                        {website.logoUrl ? (
                            <img className="landing-logo-image" src={website.logoUrl} alt="RC Dine" />
                        ) : (
                            <span className="landing-logo">R</span>
                        )}
                        <span>RC DINE</span>
                    </a>

                    <div className={`landing-links ${mobileMenuOpen ? 'open' : ''}`}>
                        <a href="#features" onClick={() => setMobileMenuOpen(false)}>
                            Features
                        </a>
                        <a href="#demo" onClick={() => setMobileMenuOpen(false)}>
                            Demo
                        </a>
                        <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>
                            Pricing
                        </a>
                        <a href="#faq" onClick={() => setMobileMenuOpen(false)}>
                            FAQ
                        </a>
                        <button
                            type="button"
                            className="landing-link-button"
                            onClick={() => {
                                setMobileMenuOpen(false);
                                navigate('/contact');
                            }}
                        >
                            Contact
                        </button>
                    </div>

                    <div className="landing-nav-actions">
                        <button type="button" className="landing-btn ghost" onClick={goToLogin}>
                            Sign In
                        </button>
                        <button type="button" className="landing-btn primary mobile-hide" onClick={goToSignup}>
                            Start Free
                        </button>
                        <button
                            type="button"
                            className="landing-menu-button"
                            onClick={() => setMobileMenuOpen((current) => !current)}
                            aria-label="Open navigation menu"
                        >
                            {mobileMenuOpen ? '✕' : '☰'}
                        </button>
                    </div>
                </div>
            </nav>

            <main>
                <section className="landing-hero" id="home">
                    <div className="cinema-bg" aria-hidden="true">
                        {website.videoEnabled && website.heroVideoUrl && (
                            <video
                                className="cinema-video"
                                src={website.heroVideoUrl}
                                autoPlay
                                muted
                                loop
                                playsInline
                            />
                        )}
                        <div className="cinema-scene" />
                        <div className="cinema-grain" />
                        <div className="light-streak" />
                        <i className="bokeh b1" />
                        <i className="bokeh b2" />
                        <i className="bokeh b3" />
                        <i className="bokeh b4" />
                    </div>

                    <div className="landing-wrap hero-grid">
                        <div className="hero-copy">
                            <span className="landing-tag">✦ Built for next-generation restaurants</span>
                            <h1>
                                <span className="landing-gradient-text">
                                    {website.heroTitle || 'Restaurant Management Reimagined with AI'}
                                </span>
                            </h1>
                            <p>
                                {website.heroDescription ||
                                    'Run orders, billing, kitchen operations, analytics and subscriptions from one intelligent platform. Faster service. Happier teams. Smarter growth.'}
                            </p>

                            <div className="hero-buttons">
                                <button type="button" className="landing-btn primary" onClick={goToSignup}>
                                    {website.primaryButtonText || 'Start Free Trial →'}
                                </button>
                                <a className="landing-btn ghost" href="#demo">
                                    {website.secondaryButtonText || '▶ Watch Demo'}
                                </a>
                            </div>

                            <div className="hero-notes">
                                <span>No credit card</span>
                                <span>Setup in minutes</span>
                                <span>Cancel anytime</span>
                            </div>

                            <div className="video-label">Cinematic live restaurant atmosphere</div>
                        </div>

                        <div className="hero-visual">
                            <div className="dashboard-preview">
                                <div className="preview-top">
                                    <div className="window-dots">
                                        <i />
                                        <i />
                                        <i />
                                    </div>
                                    <small>RC Dine — Live Dashboard</small>
                                    <span className="status-pill">LIVE</span>
                                </div>

                                <div className="metrics-grid">
                                    <div className="glass-panel metric-card">
                                        <small>Revenue</small>
                                        <strong>₹48.6K</strong>
                                        <span className="status-pill">+18.4%</span>
                                    </div>
                                    <div className="glass-panel metric-card">
                                        <small>Orders</small>
                                        <strong>286</strong>
                                        <span className="status-pill">+12.1%</span>
                                    </div>
                                    <div className="glass-panel metric-card">
                                        <small>Tables</small>
                                        <strong>18/24</strong>
                                        <span className="status-pill">Active</span>
                                    </div>
                                </div>

                                <div className="dashboard-body">
                                    <div className="glass-panel">
                                        <strong>Live Orders</strong>
                                        <div className="order-row">
                                            <span>#1042 · Table 4</span>
                                            <span className="status-pill">Preparing</span>
                                        </div>
                                        <div className="order-row">
                                            <span>#1041 · Table 8</span>
                                            <span className="status-pill">Ready</span>
                                        </div>
                                        <div className="order-row">
                                            <span>#1040 · Walk-in</span>
                                            <span className="status-pill">Paid</span>
                                        </div>
                                    </div>

                                    <div className="glass-panel">
                                        <strong>Sales Pulse</strong>
                                        <div className="bar-chart" aria-hidden="true">
                                            {[38, 55, 45, 78, 65, 95].map((height) => (
                                                <i key={height} className="bar" style={{ height: `${height}%` }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="phone-preview">
                                <div className="phone-screen">
                                    <div className="preview-top">
                                        <strong>RC Dine</strong>
                                        <small>Table 04</small>
                                    </div>
                                    <div className="qr-preview" />
                                    <p>Scan. Order. Enjoy.</p>
                                    <div className="food-row">
                                        <span>🍕 Margherita</span>
                                        <strong>₹249</strong>
                                    </div>
                                    <div className="food-row">
                                        <span>🥤 Cold Coffee</span>
                                        <strong>₹129</strong>
                                    </div>
                                    <button type="button" className="phone-cart-button">
                                        View Cart · ₹378
                                    </button>
                                </div>
                            </div>

                            <div className="floating-notice notice-one">🔔 New order from Table 4</div>
                            <div className="floating-notice notice-two">✓ Payment verified successfully</div>
                        </div>
                    </div>
                </section>

                <section id="demo" className="live-demo-section">
                    <div className="landing-wrap">
                        <div className="section-heading reveal">
                            <span className="landing-tag">TRY IT—NO LOGIN NEEDED</span>
                            <h2>Place an order. Watch RC Dine work.</h2>
                            <p>
                                Customer phone se item add karein, order place karein aur manager dashboard par live
                                status update khud try karein.
                            </p>
                        </div>

                        <div className="live-demo-guide reveal" aria-label="Interactive demo steps">
                            <span>
                                <b>1</b> Add an item
                            </span>
                            <i aria-hidden="true">→</i>
                            <span>
                                <b>2</b> Place demo order
                            </span>
                            <i aria-hidden="true">→</i>
                            <span>
                                <b>3</b> Update it as manager
                            </span>
                        </div>

                        <div className="live-demo-shell reveal">
                            <section className="live-demo-customer" aria-label="Customer ordering demo">
                                <div className="live-demo-panel-title">
                                    <div>
                                        <span className="live-demo-panel-icon">📱</span>
                                        <span>
                                            <small>CUSTOMER VIEW</small>
                                            <strong>QR Menu · Table 4</strong>
                                        </span>
                                    </div>
                                    <span className="live-demo-online">Online</span>
                                </div>

                                <div className="live-demo-phone">
                                    <div className="live-demo-phone-notch" />
                                    <div className="live-demo-phone-screen" aria-live="polite">
                                        <div className="live-demo-restaurant-row">
                                            <div className="live-demo-restaurant-mark">R</div>
                                            <div>
                                                <strong>RC Bistro</strong>
                                                <small>Premium café experience</small>
                                            </div>
                                            <span>Table 4</span>
                                        </div>

                                        {!demoOrder ? (
                                            <>
                                                <div className="live-demo-offer">
                                                    <span>CHEF’S PICK</span>
                                                    <strong>Freshly made. Ready in 15 min.</strong>
                                                </div>

                                                <div className="live-demo-menu-heading">
                                                    <div>
                                                        <strong>Popular right now</strong>
                                                        <small>Tap + to build your demo order</small>
                                                    </div>
                                                    <span>🔥</span>
                                                </div>

                                                <div className="live-demo-menu-list">
                                                    {liveDemoItems.map((item) => {
                                                        const quantity = demoCart[item.id] || 0;

                                                        return (
                                                            <article className="live-demo-food" key={item.id}>
                                                                <span className="live-demo-food-icon">{item.icon}</span>
                                                                <div>
                                                                    <strong>{item.name}</strong>
                                                                    <small>{item.detail}</small>
                                                                    <b>₹{item.price}</b>
                                                                </div>
                                                                {quantity > 0 ? (
                                                                    <div className="live-demo-quantity">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                updateDemoQuantity(item.id, -1)
                                                                            }
                                                                            aria-label={`Remove one ${item.name}`}
                                                                        >
                                                                            −
                                                                        </button>
                                                                        <span>{quantity}</span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                updateDemoQuantity(item.id, 1)
                                                                            }
                                                                            aria-label={`Add one more ${item.name}`}
                                                                        >
                                                                            +
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        className="live-demo-add"
                                                                        onClick={() => updateDemoQuantity(item.id, 1)}
                                                                        aria-label={`Add ${item.name}`}
                                                                    >
                                                                        ADD
                                                                    </button>
                                                                )}
                                                            </article>
                                                        );
                                                    })}
                                                </div>

                                                <button
                                                    type="button"
                                                    className="live-demo-cart-button"
                                                    onClick={placeDemoOrder}
                                                    disabled={!demoCartCount}
                                                >
                                                    <span>
                                                        {demoCartCount
                                                            ? `${demoCartCount} item${demoCartCount > 1 ? 's' : ''}`
                                                            : 'Add an item'}
                                                    </span>
                                                    <strong>
                                                        {demoCartCount
                                                            ? `Place demo order · ₹${demoCartTotal}`
                                                            : 'Start ordering'}
                                                    </strong>
                                                </button>
                                            </>
                                        ) : (
                                            <div className="live-demo-customer-tracking">
                                                <div
                                                    className={`live-demo-success status-${demoOrderStatus.toLowerCase()}`}
                                                >
                                                    <span>{demoOrderStatus === 'READY' ? '✓' : '⌁'}</span>
                                                </div>
                                                <small>{demoOrder.number}</small>
                                                <h3>{demoStatusMeta.customerLabel}</h3>
                                                <p>
                                                    {demoOrder.itemCount} items · ₹{demoOrder.total} · Table 4
                                                </p>

                                                <div className="live-demo-timeline">
                                                    {liveDemoTimeline.map((step, index) => (
                                                        <div
                                                            className={`${index <= demoTimelineIndex ? 'complete' : ''} ${
                                                                step.key === demoOrderStatus ? 'current' : ''
                                                            }`}
                                                            key={step.key}
                                                        >
                                                            <i>{index < demoTimelineIndex ? '✓' : index + 1}</i>
                                                            <span>{step.label}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="live-demo-customer-note">
                                                    <span className="live-demo-pulse" />
                                                    Status manager dashboard se live sync ho raha hai
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                            <section className="live-demo-manager" aria-label="Manager dashboard demo">
                                <div className="live-demo-manager-bar">
                                    <div>
                                        <span className="live-demo-brand-mark">R</span>
                                        <span>
                                            <small>RC DINE</small>
                                            <strong>Manager Dashboard</strong>
                                        </span>
                                    </div>
                                    <span className="live-demo-connected">
                                        <i /> Live connected
                                    </span>
                                </div>

                                <div className="live-demo-kpis">
                                    <article>
                                        <small>Today’s orders</small>
                                        <strong>{24 + (demoOrder ? 1 : 0)}</strong>
                                        <span>↗ 12%</span>
                                    </article>
                                    <article>
                                        <small>Revenue</small>
                                        <strong>₹{(12840 + (demoOrder?.total || 0)).toLocaleString('en-IN')}</strong>
                                        <span>Live</span>
                                    </article>
                                    <article>
                                        <small>Active tables</small>
                                        <strong>{demoOrder ? '9 / 12' : '8 / 12'}</strong>
                                        <span>Normal</span>
                                    </article>
                                </div>

                                <div className="live-demo-manager-workspace" aria-live="polite">
                                    <div className="live-demo-manager-heading">
                                        <div>
                                            <small>LIVE ORDER QUEUE</small>
                                            <h3>{demoOrder ? 'Table 4 order' : 'Waiting for your demo order'}</h3>
                                        </div>
                                        {demoOrder && (
                                            <span
                                                className={`live-demo-order-status status-${demoOrderStatus.toLowerCase()}`}
                                            >
                                                {demoStatusMeta.label}
                                            </span>
                                        )}
                                    </div>

                                    {!demoOrder ? (
                                        <div className="live-demo-empty-state">
                                            <div className="live-demo-radar">
                                                <i />
                                                <span>🧾</span>
                                            </div>
                                            <h4>No demo order yet</h4>
                                            <p>
                                                Left side ke customer phone par item add karke “Place demo order”
                                                dabayein.
                                            </p>
                                            <span className="live-demo-empty-hint">← Start from customer view</span>
                                        </div>
                                    ) : (
                                        <div className="live-demo-order-wrap">
                                            <div className={`live-demo-event status-${demoOrderStatus.toLowerCase()}`}>
                                                <span className="live-demo-pulse" />
                                                <div>
                                                    <small>LIVE EVENT</small>
                                                    <strong>{demoStatusMeta.helper}</strong>
                                                </div>
                                            </div>

                                            <article className="live-demo-order-card">
                                                <header>
                                                    <div>
                                                        <span>TABLE 4</span>
                                                        <h3>{demoOrder.number}</h3>
                                                        <small>Dine-in · Just now</small>
                                                    </div>
                                                    <strong>₹{demoOrder.total}</strong>
                                                </header>

                                                <div className="live-demo-order-items">
                                                    {demoOrder.items.map((item) => (
                                                        <div key={item.id}>
                                                            <span>
                                                                <b>{item.quantity}×</b> {item.name}
                                                            </span>
                                                            <strong>₹{item.price * item.quantity}</strong>
                                                        </div>
                                                    ))}
                                                </div>

                                                <footer>
                                                    <span>{demoOrder.itemCount} items</span>
                                                    <strong>Total ₹{demoOrder.total}</strong>
                                                </footer>
                                            </article>

                                            <div className="live-demo-manager-actions">
                                                <button type="button" onClick={advanceDemoOrder}>
                                                    {demoStatusMeta.action}
                                                    <span>{demoOrderStatus === 'READY' ? '↻' : '→'}</span>
                                                </button>
                                                {demoOrderStatus !== 'READY' && (
                                                    <button
                                                        type="button"
                                                        className="live-demo-reset"
                                                        onClick={resetLiveDemo}
                                                    >
                                                        Reset demo
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <div className="live-demo-conversion">
                                <div>
                                    <span>✨ That’s the real RC Dine flow</span>
                                    <strong>Ready to try it with your own menu?</strong>
                                </div>
                                <button type="button" onClick={goToSignup}>
                                    Build my QR menu <span>→</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="workflow">
                    <div className="landing-wrap">
                        <div className="section-heading reveal">
                            <span className="landing-tag">BEHIND THE LIVE DEMO</span>
                            <h2>One order. Every screen synchronized.</h2>
                            <p>See how RC Dine connects the customer, manager, kitchen, payment and analytics flow.</p>
                        </div>

                        <div className="workflow-demo reveal">
                            <div className="workflow-steps">
                                {workflowSteps.map((step, index) => (
                                    <button
                                        type="button"
                                        key={step.title}
                                        className={`workflow-step ${activeWorkflow === index ? 'active' : ''}`}
                                        onClick={() => setActiveWorkflow(index)}
                                    >
                                        <span className="workflow-icon">{step.icon}</span>
                                        <span>
                                            <strong>{step.title}</strong>
                                            <small>{step.subtitle}</small>
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="glass-panel workflow-preview">
                                {activeWorkflow === 0 && (
                                    <div className="workflow-screen active">
                                        <div className="preview-top">
                                            <strong>Customer Menu</strong>
                                            <span className="status-pill">Table 4</span>
                                        </div>
                                        <div className="mini-grid">
                                            <div className="mini-card">
                                                🍕 Pizza
                                                <small>12 items</small>
                                            </div>
                                            <div className="mini-card">
                                                🍔 Burgers
                                                <small>8 items</small>
                                            </div>
                                            <div className="mini-card">
                                                🍜 Chinese
                                                <small>14 items</small>
                                            </div>
                                            <div className="mini-card">
                                                🥤 Drinks
                                                <small>10 items</small>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeWorkflow === 1 && (
                                    <div className="workflow-screen active">
                                        <div className="preview-top">
                                            <strong>Incoming Order</strong>
                                            <span className="status-pill">NEW</span>
                                        </div>
                                        <div className="mini-card">
                                            <h3>#RC-1042 · Table 4</h3>
                                            <p>
                                                2× Pizza
                                                <br />
                                                1× Cold Coffee
                                                <br />
                                                1× Fries
                                            </p>
                                            <strong>₹876</strong>
                                        </div>
                                    </div>
                                )}

                                {activeWorkflow === 2 && (
                                    <div className="workflow-screen active">
                                        <div className="preview-top">
                                            <strong>Kitchen Display</strong>
                                            <span className="status-pill">Preparing</span>
                                        </div>
                                        <div className="mini-card">
                                            <h3>Order progress</h3>
                                            <div className="progress-track">
                                                <i />
                                            </div>
                                            <p>Chef assigned · Estimated 12 minutes</p>
                                        </div>
                                    </div>
                                )}

                                {activeWorkflow === 3 && (
                                    <div className="workflow-screen active payment-screen">
                                        <div className="preview-top">
                                            <strong>Payment</strong>
                                            <span className="status-pill">Verified</span>
                                        </div>
                                        <div className="mini-card payment-card">
                                            <div>✅</div>
                                            <h2>₹876 received</h2>
                                            <p>Payment verified securely</p>
                                        </div>
                                    </div>
                                )}

                                {activeWorkflow === 4 && (
                                    <div className="workflow-screen active">
                                        <div className="preview-top">
                                            <strong>Analytics</strong>
                                            <span className="status-pill">Updated</span>
                                        </div>
                                        <div className="mini-grid">
                                            <div className="mini-card">
                                                <small>Revenue</small>
                                                <h2>₹48,632</h2>
                                            </div>
                                            <div className="mini-card">
                                                <small>Orders</small>
                                                <h2>286</h2>
                                            </div>
                                        </div>
                                        <div className="bar-chart analytics-chart">
                                            {[30, 50, 43, 83, 70, 100].map((height) => (
                                                <i key={height} className="bar" style={{ height: `${height}%` }} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="stats-section">
                    <div className="landing-wrap stats-grid reveal">
                        {stats.map((stat) => (
                            <div className="stat-card" key={stat.label}>
                                <StatCounter value={stat.value} suffix={stat.suffix} decimals={stat.decimals} />
                                <span>{stat.label}</span>
                            </div>
                        ))}
                        <div className="stat-card">
                            <strong>24×7</strong>
                            <span>Support</span>
                        </div>
                    </div>
                </section>

                <section id="features">
                    <div className="landing-wrap">
                        <div className="section-heading reveal">
                            <span className="landing-tag">EVERYTHING CONNECTED</span>
                            <h2>One platform. Every operation.</h2>
                            <p>Designed for modern cafés, cloud kitchens and multi-location restaurants.</p>
                        </div>

                        <div className="features-grid">
                            {features.map((feature) => (
                                <article
                                    className="feature-card reveal"
                                    key={feature.title}
                                    onPointerMove={handleFeatureTilt}
                                    onPointerLeave={resetFeatureTilt}
                                >
                                    <div className="feature-icon">{feature.icon}</div>
                                    <h3>{feature.title}</h3>
                                    <p>{feature.description}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section>
                    <div className="landing-wrap">
                        <div className="section-heading reveal">
                            <span className="landing-tag">INTERACTIVE DEMO</span>
                            <h2>Built for every role</h2>
                            <p>Switch views to see how each person experiences RC Dine.</p>
                        </div>

                        <div className="demo-tabs reveal">
                            {Object.keys(demoTabs).map((tab) => (
                                <button
                                    type="button"
                                    className={`demo-tab ${activeTab === tab ? 'active' : ''}`}
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>

                        <div className="role-panel reveal">
                            <div>
                                <span className="landing-tag">{activeDemo.tag}</span>
                                <h2>{activeDemo.title}</h2>
                                <p>{activeDemo.description}</p>
                            </div>

                            <div className="role-ui">
                                {activeTab === 'customer' && (
                                    <>
                                        <div className="preview-top">
                                            <strong>Flying Dhor Café</strong>
                                            <span>🔔</span>
                                        </div>
                                        <div className="mini-grid">
                                            <div className="mini-card">
                                                🍕 Pizza
                                                <small>From ₹199</small>
                                            </div>
                                            <div className="mini-card">
                                                🍔 Burgers
                                                <small>From ₹149</small>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="landing-btn primary full-width"
                                            onClick={() => showToast('Customer cart preview')}
                                        >
                                            View Cart
                                        </button>
                                    </>
                                )}

                                {activeTab === 'manager' && (
                                    <>
                                        <div className="mini-grid">
                                            <div className="mini-card">
                                                <small>Running</small>
                                                <h2>12</h2>
                                            </div>
                                            <div className="mini-card">
                                                <small>Completed</small>
                                                <h2>64</h2>
                                            </div>
                                        </div>
                                        <div className="order-row">
                                            <span>Table 7 · ₹642</span>
                                            <span className="status-pill">Preparing</span>
                                        </div>
                                    </>
                                )}

                                {activeTab === 'owner' && (
                                    <>
                                        <div className="preview-top">
                                            <strong>Monthly Revenue</strong>
                                            <strong>₹8.42L</strong>
                                        </div>
                                        <div className="bar-chart role-chart">
                                            {[35, 48, 63, 56, 82, 100].map((height) => (
                                                <i key={height} className="bar" style={{ height: `${height}%` }} />
                                            ))}
                                        </div>
                                    </>
                                )}

                                {activeTab === 'kitchen' && (
                                    <>
                                        <div className="order-row">
                                            <span>#1042 · 4 items</span>
                                            <span className="status-pill">12 min</span>
                                        </div>
                                        <div className="order-row">
                                            <span>#1041 · 2 items</span>
                                            <span className="status-pill">Ready</span>
                                        </div>
                                        <div className="order-row">
                                            <span>#1040 · 6 items</span>
                                            <span className="status-pill">New</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section id="pricing">
                    <div className="landing-wrap">
                        <div className="section-heading reveal">
                            <span className="landing-tag">SIMPLE PRICING</span>
                            <h2>Start small. Scale confidently.</h2>
                            <p>Choose a plan and upgrade as your restaurant grows.</p>
                        </div>

                        {plansLoading && <p className="pricing-state">Loading latest plans...</p>}
                        {plansError && <p className="pricing-state pricing-warning">{plansError}</p>}
                        <div className="pricing-grid">
                            {plans.map((plan) => (
                                <article
                                    className={`price-card show ${plan.popular || plan.isPopular ? 'popular' : ''}`}
                                    key={plan.code}
                                >
                                    {(plan.popular || plan.isPopular) && (
                                        <span className="popular-pill">MOST POPULAR</span>
                                    )}
                                    <h3>{plan.name || plan.title}</h3>
                                    <div className="price-amount">
                                        ₹{Number(plan.amount).toLocaleString('en-IN')}{' '}
                                        <small>/{plan.subtitle || `${plan.days} days`}</small>
                                    </div>
                                    <ul>
                                        {(plan.features || []).map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                    <button
                                        type="button"
                                        className={`landing-btn ${
                                            plan.popular || plan.isPopular ? 'primary' : 'ghost'
                                        } full-width`}
                                        onClick={() => choosePlan(plan.code)}
                                    >
                                        {plan.buttonText || `Choose ${plan.name || plan.title}`}
                                    </button>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section>
                    <div className="landing-wrap">
                        <div className="section-heading reveal">
                            <span className="landing-tag">CUSTOMER STORIES</span>
                            <h2>Restaurants love the clarity</h2>
                        </div>

                        <div className="review-stage reveal">
                            <article className="review-card">
                                <p>“{reviews[reviewIndex].quote}”</p>
                                <strong>{reviews[reviewIndex].name}</strong>
                                <small>{reviews[reviewIndex].restaurant}</small>
                            </article>

                            <div className="review-controls">
                                <button
                                    type="button"
                                    onClick={() => setReviewIndex((reviewIndex - 1 + reviews.length) % reviews.length)}
                                    aria-label="Previous review"
                                >
                                    ←
                                </button>
                                <span>
                                    {reviewIndex + 1} / {reviews.length}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setReviewIndex((reviewIndex + 1) % reviews.length)}
                                    aria-label="Next review"
                                >
                                    →
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="faq">
                    <div className="landing-wrap">
                        <div className="section-heading reveal">
                            <span className="landing-tag">FAQ</span>
                            <h2>Everything you need to know</h2>
                        </div>

                        <div className="faq-list reveal">
                            {faqs.map((faq, index) => (
                                <article className={`faq-item ${openFaq === index ? 'open' : ''}`} key={faq.question}>
                                    <button
                                        type="button"
                                        aria-expanded={openFaq === index}
                                        aria-controls={`faq-answer-${index}`}
                                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    >
                                        <span>{faq.question}</span>
                                        <span>{openFaq === index ? '−' : '+'}</span>
                                    </button>
                                    <div id={`faq-answer-${index}`} className="faq-answer">
                                        {faq.answer}
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section>
                    <div className="landing-wrap">
                        <div className="final-cta reveal">
                            <span className="landing-tag">READY TO UPGRADE?</span>
                            <h2>Run your restaurant smarter.</h2>
                            <p>Replace scattered tools with one connected restaurant operating system.</p>
                            <button type="button" className="landing-btn primary" onClick={goToSignup}>
                                Start Free Trial →
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="landing-footer">
                <div className="landing-wrap footer-inner">
                    <div className="landing-brand">
                        {website.logoUrl ? (
                            <img className="landing-logo-image" src={website.logoUrl} alt="RC Dine" />
                        ) : (
                            <span className="landing-logo">R</span>
                        )}
                        <span>RC DINE</span>
                    </div>
                    <div className="footer-links">
                        <a href="#features">Features</a>
                        <a href="#pricing">Pricing</a>
                        <button type="button" className="footer-link-button" onClick={() => navigate('/contact')}>
                            Contact
                        </button>
                        <a href="/portfolio/">Portfolio</a>
                        <button type="button" className="footer-link-button" onClick={() => navigate('/privacy')}>
                            Privacy
                        </button>
                        <button type="button" className="footer-link-button" onClick={() => navigate('/terms')}>
                            Terms
                        </button>
                        <button type="button" className="footer-link-button" onClick={() => navigate('/refund-policy')}>
                            Cancellation & Refunds
                        </button>
                        <button
                            type="button"
                            className="footer-link-button"
                            onClick={() => navigate('/shipping-policy')}
                        >
                            Shipping & Delivery
                        </button>
                    </div>
                    <small>© 2026 RC Dine</small>
                </div>
            </footer>

            <div className={`landing-toast ${toast ? 'show' : ''}`}>{toast}</div>
        </div>
    );
}

export default Landing;
