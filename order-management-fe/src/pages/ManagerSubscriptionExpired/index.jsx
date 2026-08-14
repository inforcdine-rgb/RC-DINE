import React from 'react';
import { FiCheckCircle, FiLogOut, FiRefreshCw, FiShield } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import logo from '../../assets/images/R-C DINE.png';
import { logoutRequest } from '../../store/slice';
import './style.css';

const MANAGER_SUBSCRIPTION_EXPIRED_KEY = 'rcManagerSubscriptionExpired';

function ManagerSubscriptionExpired() {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user.data);

    const checkAgain = () => {
        localStorage.removeItem(MANAGER_SUBSCRIPTION_EXPIRED_KEY);
        window.location.replace('/walkin-pos');
    };

    const signOut = () => {
        dispatch(logoutRequest({ redirectTo: '/login' }));
    };

    return (
        <main className="manager-expired-page">
            <section className="manager-expired-card">
                <header className="manager-expired-brand">
                    <img src={logo} alt="R&C Dine" />
                    <div>
                        <strong>R&C Dine</strong>
                        <span>Manager Portal</span>
                    </div>
                </header>

                <div className="manager-expired-icon" aria-hidden="true">
                    <FiShield />
                </div>
                <span className="manager-expired-badge">MANAGER LOGIN SUCCESSFUL</span>
                <h1>Cafe subscription has ended</h1>
                <p className="manager-expired-intro">
                    Aapka manager account aur cafe ka data safe hai. Owner subscription renew hone tak billing, orders,
                    menu aur table operations temporarily paused hain.
                </p>

                <div className="manager-expired-owner">
                    <span>Subscription owner</span>
                    <strong>{user.ownerName || 'Cafe Owner'}</strong>
                    {user.ownerEmail ? <a href={`mailto:${user.ownerEmail}`}>{user.ownerEmail}</a> : null}
                </div>

                <div className="manager-expired-steps">
                    <div>
                        <FiCheckCircle />
                        <span>Owner ko subscription renew karne ke liye contact karein.</span>
                    </div>
                    <div>
                        <FiCheckCircle />
                        <span>Renewal ke baad “Check again” dabayein; manager access turant resume hoga.</span>
                    </div>
                </div>

                <div className="manager-expired-actions">
                    <button type="button" className="manager-expired-primary" onClick={checkAgain}>
                        <FiRefreshCw /> Check again
                    </button>
                    <button type="button" className="manager-expired-secondary" onClick={signOut}>
                        <FiLogOut /> Sign out
                    </button>
                </div>

                <small>No orders or account data will be deleted during this pause.</small>
            </section>
        </main>
    );
}

export default ManagerSubscriptionExpired;
