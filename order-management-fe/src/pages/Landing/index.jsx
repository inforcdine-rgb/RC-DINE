import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as subscriptionService from '../../services/subscription.service';

import './style.css';

const workflowSteps = [
    {
        icon: '📱',
        title: 'Customer scans QR',
        subtitle: 'Menu opens instantly',
        screen: 'customer'
    },
    {
        icon: '🧾',
        title: 'Order received',
        subtitle: 'Manager notified',
        screen: 'order'
    },
    {
        icon: '👨‍🍳',
        title: 'Kitchen preparing',
        subtitle: 'Status updates live',
        screen: 'kitchen'
    },
    {
        icon: '💳',
        title: 'Payment complete',
        subtitle: 'Secure verification',
        screen: 'payment'
    },
    {
        icon: '📈',
        title: 'Analytics updated',
        subtitle: 'Revenue reflected instantly',
        screen: 'analytics'
    }
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

const fallbackPlans = [];

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

    const activeDemo = demoTabs[activeTab];

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
            try {
                const response = await subscriptionService.getPlans();
                setPlans(response?.plans || []);
            } catch (error) {
                console.error('Unable to load landing subscription plans', error);
            }
        };

        loadPlans();
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

    const goToLogin = () => navigate('/login');
    const goToSignup = () => navigate('/signup');
    const choosePlan = (planCode) => {
        localStorage.setItem('rcdine_selected_plan', planCode);
        navigate(`/signup?plan=${encodeURIComponent(planCode)}`);
    };

    const handleFeatureTilt = (event) => {
        const card = event.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${
            -y * 8
        }deg) translateY(-4px)`;
    };

    const resetFeatureTilt = (event) => {
        event.currentTarget.style.transform = '';
    };

    return (
        <div className="rc-landing">
            <div className="pointer-glow" aria-hidden="true" />

            <nav className="landing-nav">
                <div className="landing-wrap landing-nav-inner">
                    <a className="landing-brand" href="#home" aria-label="RC Dine home">
                        <span className="landing-logo">R</span>
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
                    </div>

                    <div className="landing-nav-actions">
                        <button type="button" className="landing-btn ghost" onClick={goToLogin}>
                            Sign In
                        </button>
                        <button type="button" className="landing-btn primary" onClick={goToSignup}>
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
                            <span className="landing-tag">
                                ✦ Built for next-generation restaurants
                            </span>
                            <h1>
                                <span className="landing-gradient-text">
                                    Restaurant Management
                                </span>
                                <br />
                                Reimagined with AI
                            </h1>
                            <p>
                                Run orders, billing, kitchen operations, analytics and
                                subscriptions from one intelligent platform. Faster service.
                                Happier teams. Smarter growth.
                            </p>

                            <div className="hero-buttons">
                                <button
                                    type="button"
                                    className="landing-btn primary"
                                    onClick={goToSignup}
                                >
                                    Start Free Trial →
                                </button>
                                <a className="landing-btn ghost" href="#demo">
                                    ▶ Watch Demo
                                </a>
                            </div>

                            <div className="hero-notes">
                                <span>No credit card</span>
                                <span>Setup in minutes</span>
                                <span>Cancel anytime</span>
                            </div>

                            <div className="video-label">
                                Cinematic live restaurant atmosphere
                            </div>
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
                                                <i
                                                    key={height}
                                                    className="bar"
                                                    style={{ height: `${height}%` }}
                                                />
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

                            <div className="floating-notice notice-one">
                                🔔 New order from Table 4
                            </div>
                            <div className="floating-notice notice-two">
                                ✓ Payment verified successfully
                            </div>
                        </div>
                    </div>
                </section>

                <section id="demo">
                    <div className="landing-wrap">
                        <div className="section-heading reveal">
                            <span className="landing-tag">LIVE PRODUCT PREVIEW</span>
                            <h2>See every order move in real time</h2>
                            <p>
                                From QR scan to analytics update, RC Dine keeps your entire
                                restaurant synchronized.
                            </p>
                        </div>

                        <div className="workflow-demo reveal">
                            <div className="workflow-steps">
                                {workflowSteps.map((step, index) => (
                                    <button
                                        type="button"
                                        key={step.title}
                                        className={`workflow-step ${
                                            activeWorkflow === index ? 'active' : ''
                                        }`}
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
                                                <i
                                                    key={height}
                                                    className="bar"
                                                    style={{ height: `${height}%` }}
                                                />
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
                                <StatCounter
                                    value={stat.value}
                                    suffix={stat.suffix}
                                    decimals={stat.decimals}
                                />
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
                            <p>
                                Designed for modern cafés, cloud kitchens and multi-location
                                restaurants.
                            </p>
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
                            <p>
                                Switch views to see how each person experiences RC Dine.
                            </p>
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
                                                <i
                                                    key={height}
                                                    className="bar"
                                                    style={{ height: `${height}%` }}
                                                />
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

                        <div className="pricing-grid">
                            {plans.map((plan) => (
                                <article
                                    className={`price-card reveal ${
                                        plan.popular || plan.isPopular ? 'popular' : ''
                                    }`}
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
                                    onClick={() =>
                                        setReviewIndex(
                                            (reviewIndex - 1 + reviews.length) %
                                                reviews.length
                                        )
                                    }
                                    aria-label="Previous review"
                                >
                                    ←
                                </button>
                                <span>
                                    {reviewIndex + 1} / {reviews.length}
                                </span>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setReviewIndex(
                                            (reviewIndex + 1) % reviews.length
                                        )
                                    }
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
                                <article
                                    className={`faq-item ${
                                        openFaq === index ? 'open' : ''
                                    }`}
                                    key={faq.question}
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setOpenFaq(openFaq === index ? null : index)
                                        }
                                    >
                                        <span>{faq.question}</span>
                                        <span>{openFaq === index ? '−' : '+'}</span>
                                    </button>
                                    <div className="faq-answer">{faq.answer}</div>
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
                            <p>
                                Replace scattered tools with one connected restaurant
                                operating system.
                            </p>
                            <button
                                type="button"
                                className="landing-btn primary"
                                onClick={goToSignup}
                            >
                                Start Free Trial →
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="landing-footer">
                <div className="landing-wrap footer-inner">
                    <div className="landing-brand">
                        <span className="landing-logo">R</span>
                        <span>RC DINE</span>
                    </div>
                    <div className="footer-links">
                        <a href="#features">Features</a>
                        <a href="#pricing">Pricing</a>
                        <a href="mailto:info@rcdine.in">Contact</a>
                    </div>
                    <small>© 2026 RC Dine</small>
                </div>
            </footer>

            <div className={`landing-toast ${toast ? 'show' : ''}`}>{toast}</div>
        </div>
    );
}

export default Landing;
