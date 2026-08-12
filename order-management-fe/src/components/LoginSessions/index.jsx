import React from 'react';
import { Modal } from 'react-bootstrap';
import {
    FiAlertTriangle,
    FiClock,
    FiLogOut,
    FiMapPin,
    FiMonitor,
    FiRefreshCw,
    FiShield,
    FiSmartphone,
    FiTablet
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getLoginSessions, revokeLoginSession, revokeOtherLoginSessions } from '../../services/auth.service';
import './style.css';

const deviceIcons = {
    PHONE: FiSmartphone,
    TABLET: FiTablet,
    DESKTOP: FiMonitor
};

const relativeTime = (value) => {
    const time = new Date(value).getTime();
    if (!Number.isFinite(time)) return 'Recently';

    const seconds = Math.max(0, Math.round((Date.now() - time) / 1000));
    if (seconds < 60) return 'Active now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} day ago`;
    return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const loginTime = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Recently';
    return date.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
};

const readableTimezone = (value) => String(value || 'Location unavailable').replace(/_/g, ' ');

const LoginSessions = () => {
    const [sessions, setSessions] = React.useState([]);
    const [trackingReady, setTrackingReady] = React.useState(true);
    const [loading, setLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);
    const [error, setError] = React.useState('');
    const [pendingAction, setPendingAction] = React.useState(null);
    const [submitting, setSubmitting] = React.useState(false);

    const loadSessions = React.useCallback(async (silent = false) => {
        if (silent) setRefreshing(true);
        else setLoading(true);
        setError('');

        try {
            const response = await getLoginSessions();
            setSessions(response.sessions || []);
            setTrackingReady(response.trackingReady !== false);
        } catch (requestError) {
            setError(requestError?.message || 'Logged-in devices load nahi hue.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    React.useEffect(() => {
        loadSessions();
    }, [loadSessions]);

    const confirmAction = async () => {
        if (!pendingAction) return;
        setSubmitting(true);

        try {
            const response =
                pendingAction.type === 'OTHERS'
                    ? await revokeOtherLoginSessions()
                    : await revokeLoginSession(pendingAction.session.id);
            toast.success(response?.message || 'Device signed out successfully.');
            setPendingAction(null);
            await loadSessions(true);
        } catch (requestError) {
            toast.error(requestError?.message || 'Device sign out nahi hua.');
        } finally {
            setSubmitting(false);
        }
    };

    const otherSessionCount = sessions.filter((session) => !session.isCurrent).length;

    return (
        <>
            <section className="login-sessions-card" aria-labelledby="login-sessions-title">
                <header className="login-sessions-header">
                    <div className="login-sessions-title-wrap">
                        <span className="login-sessions-shield">
                            <FiShield aria-hidden="true" />
                        </span>
                        <div>
                            <span className="login-sessions-eyebrow">LOGIN SECURITY</span>
                            <h5 id="login-sessions-title">Where you&apos;re logged in</h5>
                            <p>Owner ya manager account use karne wale active devices dekhein aur control karein.</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="login-sessions-refresh"
                        onClick={() => loadSessions(true)}
                        disabled={refreshing}
                        aria-label="Refresh logged-in devices"
                    >
                        <FiRefreshCw aria-hidden="true" />
                        Refresh
                    </button>
                </header>

                {!trackingReady && (
                    <div className="login-sessions-upgrade" role="status">
                        <FiAlertTriangle aria-hidden="true" />
                        <div>
                            <strong>Device security activate karne ke liye ek baar re-login karein.</strong>
                            <span>
                                Current purana login automatically expire hoga; next login se device list live hogi.
                            </span>
                        </div>
                    </div>
                )}

                {loading ? null : error ? (
                    <div className="login-sessions-error" role="alert">
                        <FiAlertTriangle aria-hidden="true" />
                        <span>{error}</span>
                        <button type="button" onClick={() => loadSessions()}>
                            Try again
                        </button>
                    </div>
                ) : sessions.length ? (
                    <div className="login-sessions-list">
                        {sessions.map((session) => {
                            const DeviceIcon = deviceIcons[session.deviceType] || FiMonitor;

                            return (
                                <article
                                    className={`login-session-item ${session.isCurrent ? 'current' : ''}`}
                                    key={session.id}
                                >
                                    <span className="login-session-device-icon">
                                        <DeviceIcon aria-hidden="true" />
                                    </span>
                                    <div className="login-session-copy">
                                        <div className="login-session-name-row">
                                            <strong>{session.deviceName}</strong>
                                            {session.isCurrent && (
                                                <span className="current-device-pill">This device</span>
                                            )}
                                        </div>
                                        <div className="login-session-meta">
                                            <span>
                                                <FiMapPin aria-hidden="true" />
                                                {readableTimezone(session.timezone)} Â· IP {session.ipAddress}
                                            </span>
                                            <span>
                                                <FiClock aria-hidden="true" />
                                                {relativeTime(session.lastActiveAt)}
                                            </span>
                                        </div>
                                        <small>Signed in {loginTime(session.createdAt)}</small>
                                    </div>
                                    {!session.isCurrent && (
                                        <button
                                            type="button"
                                            className="login-session-signout"
                                            onClick={() => setPendingAction({ type: 'ONE', session })}
                                        >
                                            <FiLogOut aria-hidden="true" />
                                            Sign out
                                        </button>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="login-sessions-empty">
                        <FiShield aria-hidden="true" />
                        <strong>No tracked device yet</strong>
                        <span>Next sign-in ke baad yahan device details dikhengi.</span>
                    </div>
                )}

                {trackingReady && otherSessionCount > 0 && (
                    <footer className="login-sessions-footer">
                        <div>
                            <strong>
                                {otherSessionCount} other active {otherSessionCount === 1 ? 'device' : 'devices'}
                            </strong>
                            <span>Unknown device dikhe to turant sabko sign out karein.</span>
                        </div>
                        <button
                            type="button"
                            className="logout-other-devices"
                            onClick={() => setPendingAction({ type: 'OTHERS' })}
                        >
                            <FiLogOut aria-hidden="true" />
                            Log out all other devices
                        </button>
                    </footer>
                )}
            </section>

            <Modal
                show={Boolean(pendingAction)}
                onHide={() => !submitting && setPendingAction(null)}
                centered
                contentClassName="login-session-modal"
            >
                <Modal.Body>
                    <span className="login-session-modal-icon">
                        <FiLogOut aria-hidden="true" />
                    </span>
                    <h5>{pendingAction?.type === 'OTHERS' ? 'Log out all other devices?' : 'Log out this device?'}</h5>
                    <p>
                        {pendingAction?.type === 'OTHERS'
                            ? 'Aapka current device active rahega. Baaki sab owner/manager sessions turant band ho jayenge.'
                            : `${pendingAction?.session?.deviceName || 'Selected device'} ko RC Dine se sign out kiya jayega.`}
                    </p>
                    <div className="login-session-modal-actions">
                        <button type="button" onClick={() => setPendingAction(null)} disabled={submitting}>
                            Cancel
                        </button>
                        <button type="button" className="danger" onClick={confirmAction} disabled={submitting}>
                            Yes, sign out
                        </button>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default LoginSessions;
