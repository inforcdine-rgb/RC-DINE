import React from 'react';
import moment from 'moment';
import '../../assets/styles/auth.css';

const foodItems = ['🍛', '🍜', '🥘', '🍕', '🍲', '☕', '🍣', '🥗', '🍰', '🌮', '🍗', '🍱', '🍦', '🍩', '🌶️', '🍋'];

function AuthContainer({ children, title = '' }) {
    const isSignup = title.toLowerCase().includes('registration') || title.toLowerCase().includes('sign');
    const isAdmin = title === 'Admin';

    return (
        <div className="rc-auth-view">
            <section className="rc-auth-left">
                <div className="rc-grid" />
                <div className="rc-streaks">
                    <span className="streak streak-1" />
                    <span className="streak streak-2" />
                    <span className="streak streak-3" />
                    <span className="streak streak-4" />
                </div>

                <div className="food-canvas">
                    {foodItems.map((item, index) => (
                        <span key={`${item}-${index}`} className={`fi fi-${index + 1}`}>
                            {item}
                        </span>
                    ))}
                    <span className="fi-spark spark-1">✨</span>
                    <span className="fi-spark spark-2">⭐</span>
                    <span className="fi-spark spark-3">💫</span>
                    <span className="fi-orbit orbit-1">🍴</span>
                    <span className="fi-orbit orbit-2">🥄</span>
                    <span className="fi-steam steam-1" />
                    <span className="fi-steam steam-2" />
                </div>

                <div className="rc-left-inner">
                    <div className="rc-brand">
                        <span className="rc-brand-icon">🍽️</span>
                        <span className="rc-brand-name">R&amp;C Dine</span>
                    </div>

                    {isAdmin && (
                        <div
                            style={{
                                color: '#49ac60',
                                fontWeight: '700',
                                marginBottom: '20px',
                                fontSize: '14px'
                            }}
                        >
                            🛡️ Super Admin Panel
                        </div>
                    )}

                    <div className="rc-hero">
                        <h1>
                            {isSignup ? (
                                <>
                                    Start your<br /> restaurant<br /> <em>journey.</em>
                                </>
                            ) : (
                                <>
                                    Restaurant<br /> Management,<br /> <em>Simplified.</em>
                                </>
                            )}
                        </h1>
                        <p>
                            {isSignup
                                ? 'QR menu ready in minutes · Razorpay built-in'
                                : 'QR ordering · Live dashboard · Razorpay payments'}
                        </p>
                    </div>

                    <ul className="rc-features">
                        <li><span className="dot" />Real-time order tracking</li>
                        <li><span className="dot" />Multi-hotel management</li>
                        <li><span className="dot" />GST-ready invoices</li>
                        <li><span className="dot" />Push notifications</li>
                    </ul>
                </div>
            </section>

            <section className="rc-auth-right">
                <div className="rc-card">
                    <h2 data-testid={`${title}-${moment().valueOf()}`} className="rc-card-title">
                        {isSignup ? 'Create account' : isAdmin ? 'Admin Portal' : 'Welcome back'}
                    </h2>
                    <p className="rc-card-sub">
                        {isSignup
                            ? 'Set up your R&C Dine workspace'
                            : isAdmin
                                ? 'Manage restaurants, revenue & platform'
                                : 'Sign in to your dashboard'}
                    </p>
                    {children}
                </div>
            </section>
        </div>
    );
}

export default AuthContainer;
