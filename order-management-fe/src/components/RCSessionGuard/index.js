import React, { useCallback, useEffect, useMemo, useState } from 'react';
import CryptoJS from 'crypto-js';
import { Button, Form, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import env from '../../config/env';
import {
    enableWebPush,
    getPushCapability,
    initializeWebPush,
    unregisterCurrentDevice
} from '../../services/notification.service';
import {
    getRcSessionAvailability,
    getRcSessionJoinRequestStatus,
    joinRcSession,
    sendRcSessionOtp,
    startRcSession,
    verifyRcSessionOtp
} from '../../services/rcSession.service';
import { joinRcRequestRoom, leaveRcRequestRoom } from '../../services/socket.service';
import './style.css';

const TOKEN_KEY = 'rcCustomerToken';
const MOBILE_KEY = 'rcCustomerMobile';
const SESSION_KEY = 'rcSession';

const resolveTableId = (token) => {
    try {
        const decrypted = CryptoJS.AES.decrypt(token, env.cryptoSecret).toString(CryptoJS.enc.Utf8);
        if (decrypted) return JSON.parse(decrypted)?.tableId || token;
    } catch (error) {
        // Old/plain table tokens are still supported.
    }
    return token;
};

const readStoredSession = () => {
    try {
        return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    } catch (error) {
        localStorage.removeItem(SESSION_KEY);
        return null;
    }
};

const maskMobile = (mobile) => `${String(mobile).slice(0, 2)}******${String(mobile).slice(-2)}`;

function RCSessionGuard({ children }) {
    const { token } = useParams();
    const tableId = useMemo(() => resolveTableId(token), [token]);
    const [availability, setAvailability] = useState(null);
    const [screen, setScreen] = useState('LOADING');
    const [mobileNumber, setMobileNumber] = useState(localStorage.getItem(MOBILE_KEY) || '');
    const [otp, setOtp] = useState('');
    const [verificationId, setVerificationId] = useState('');
    const [sessionCode, setSessionCode] = useState('');
    const [activeSession, setActiveSession] = useState(readStoredSession);
    const [joinRequest, setJoinRequest] = useState(null);
    const [resendAfter, setResendAfter] = useState(0);
    const [busy, setBusy] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [pushCapability, setPushCapability] = useState(getPushCapability);

    const chooseAuthenticatedScreen = useCallback((result) => {
        const storedSession = readStoredSession();
        const sameActiveSession =
            storedSession &&
            String(storedSession.tableId) === String(tableId) &&
            result?.hasActiveSession;

        if (sameActiveSession) {
            setActiveSession(storedSession);
            setScreen('READY');
            return;
        }

        setScreen(result?.hasActiveSession ? 'JOIN_CODE' : 'START_SESSION');
    }, [tableId]);

    const loadAvailability = useCallback(async () => {
        setErrorMessage('');
        try {
            const result = await getRcSessionAvailability(tableId);
            setAvailability(result);
            if (!result?.table?.qrEnabled || !result?.canOrder) {
                setScreen('UNAVAILABLE');
                return result;
            }

            if (localStorage.getItem(TOKEN_KEY)) chooseAuthenticatedScreen(result);
            else setScreen('MOBILE');
            return result;
        } catch (error) {
            setErrorMessage(error.message);
            setScreen('ERROR');
            return null;
        }
    }, [chooseAuthenticatedScreen, tableId]);

    useEffect(() => {
        loadAvailability();
    }, [loadAvailability]);

    useEffect(() => {
        const sessionCleared = () => loadAvailability();
        window.addEventListener('rcdine:session-cleared', sessionCleared);
        return () => {
            window.removeEventListener('rcdine:session-cleared', sessionCleared);
        };
    }, [loadAvailability]);

    useEffect(() => {
        if (resendAfter <= 0) return undefined;
        const timer = window.setInterval(() => setResendAfter((value) => Math.max(0, value - 1)), 1000);
        return () => window.clearInterval(timer);
    }, [resendAfter]);

    useEffect(() => {
        if (!joinRequest?.id) return undefined;
        const socket = joinRcRequestRoom(joinRequest.id);
        const approve = (payload) => {
            if (!payload?.session) return;
            localStorage.setItem(SESSION_KEY, JSON.stringify(payload.session));
            setActiveSession(payload.session);
            setJoinRequest(null);
            setScreen('READY');
            toast.success('RC Session joined successfully');
        };
        const reject = () => {
            setJoinRequest(null);
            setScreen('JOIN_CODE');
            setErrorMessage('Host rejected your request.');
        };
        const expire = () => {
            setJoinRequest(null);
            setScreen('JOIN_CODE');
            setErrorMessage('Request expired.');
        };
        const checkStatus = async () => {
            try {
                const result = await getRcSessionJoinRequestStatus({
                    requestId: joinRequest.id,
                    token: localStorage.getItem(TOKEN_KEY)
                });
                if (result.request?.status === 'ACCEPTED') approve(result);
                else if (result.request?.status === 'REJECTED') reject();
                else if (result.request?.status === 'EXPIRED') {
                    expire();
                }
            } catch (error) {
                setErrorMessage(error.message);
            }
        };
        socket.on('session:join-approved', approve);
        socket.on('session:join-rejected', reject);
        socket.on('session:join-expired', expire);
        const interval = window.setInterval(checkStatus, 5000);
        const expiresIn = Math.max(0, new Date(joinRequest.expiresAt).getTime() - Date.now());
        const timeout = window.setTimeout(checkStatus, expiresIn + 250);
        return () => {
            window.clearInterval(interval);
            window.clearTimeout(timeout);
            socket.off('session:join-approved', approve);
            socket.off('session:join-rejected', reject);
            socket.off('session:join-expired', expire);
            leaveRcRequestRoom(joinRequest.id);
        };
    }, [joinRequest]);

    const handleSendOtp = async (event) => {
        event.preventDefault();
        const normalized = String(mobileNumber).replace(/\D/g, '').slice(-10);
        if (normalized.length !== 10) {
            setErrorMessage('Valid 10-digit mobile number enter karo.');
            return;
        }

        setBusy(true);
        setErrorMessage('');
        try {
            const result = await sendRcSessionOtp(normalized);
            setMobileNumber(normalized);
            setVerificationId(result.verificationId);
            setResendAfter(result.resendAfterSeconds || 45);
            setScreen('OTP');
            toast.success('OTP sent successfully');
        } catch (error) {
            setErrorMessage(error.message);
            if (error.retryAfter) setResendAfter(error.retryAfter);
        } finally {
            setBusy(false);
        }
    };

    const handleVerifyOtp = async (event) => {
        event.preventDefault();
        if (!/^\d{6}$/.test(otp)) {
            setErrorMessage('6-digit OTP enter karo.');
            return;
        }

        setBusy(true);
        setErrorMessage('');
        try {
            const result = await verifyRcSessionOtp({ mobileNumber, otp, verificationId });
            localStorage.setItem(TOKEN_KEY, result.token);
            localStorage.setItem(MOBILE_KEY, mobileNumber);
            if ('Notification' in window && Notification.permission === 'granted') {
                initializeWebPush({ audience: 'customer', token: result.token }).catch(() => {});
            }
            chooseAuthenticatedScreen(availability);
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setBusy(false);
        }
    };

    const handleStartSession = async () => {
        setBusy(true);
        setErrorMessage('');
        try {
            const result = await startRcSession({
                tableId,
                token: localStorage.getItem(TOKEN_KEY)
            });
            localStorage.setItem(SESSION_KEY, JSON.stringify(result.session));
            setActiveSession(result.session);
            setScreen('HOST_SUCCESS');
            toast.success('RC Session started successfully');
        } catch (error) {
            if (error.status === 409) {
                const latest = await getRcSessionAvailability(tableId);
                setAvailability(latest);
                setScreen('JOIN_CODE');
                setErrorMessage('Is table par active session already hai. Session code enter karo.');
            } else {
                setErrorMessage(error.message);
            }
        } finally {
            setBusy(false);
        }
    };

    const handleJoinSession = async (event) => {
        event.preventDefault();
        const normalizedCode = sessionCode.trim().toUpperCase();
        if (normalizedCode.length < 6) {
            setErrorMessage('Valid session code enter karo.');
            return;
        }

        setBusy(true);
        setErrorMessage('');
        try {
            const result = await joinRcSession({
                tableId,
                sessionCode: normalizedCode,
                token: localStorage.getItem(TOKEN_KEY)
            });
            if (result.joined) {
                localStorage.setItem(SESSION_KEY, JSON.stringify(result.session));
                setActiveSession(result.session);
                setScreen('JOIN_SUCCESS');
                toast.success('RC Session joined successfully');
            } else {
                setJoinRequest(result.request);
                setScreen('JOIN_PENDING');
                toast.info('Join request sent');
            }
        } catch (error) {
            setErrorMessage(error.status === 404 ? 'Invalid session code' : error.message);
        } finally {
            setBusy(false);
        }
    };

    const handleShareCode = async () => {
        const code = activeSession?.sessionCode;
        if (!code) return;
        const tableLabel = availability?.table?.tableNumber || availability?.table?.tableName || '';
        const text = `RC Dine Table ${tableLabel} session code: ${code}`;

        try {
            if (navigator.share) {
                await navigator.share({ title: 'RC Dine Session', text });
            } else if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
                toast.success('Session code copied');
            }
        } catch (error) {
            if (error?.name !== 'AbortError') toast.error('Session code share nahi ho paya');
        }
    };

    const handleEnableNotifications = async () => {
        setBusy(true);
        try {
            const result = await enableWebPush({
                audience: 'customer',
                token: localStorage.getItem(TOKEN_KEY),
                requestPermission: true
            });
            setPushCapability(getPushCapability());
            if (result.status === 'enabled') toast.success('Notifications enabled');
            else if (result.status === 'ios-install-required') {
                setErrorMessage('iPhone par pehle Share → Add to Home Screen karein, phir notifications enable karein.');
            } else if (result.status === 'denied') {
                setErrorMessage('Notifications browser settings mein blocked hain.');
            }
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setBusy(false);
        }
    };

    const handleLogoutNumber = async () => {
        const notificationToken = localStorage.getItem(TOKEN_KEY);
        if (notificationToken) {
            try {
                await unregisterCurrentDevice({ audience: 'customer', token: notificationToken });
            } catch (_error) {
                // Browser subscription is invalidated locally even if the network is unavailable.
            }
        }
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(MOBILE_KEY);
        localStorage.removeItem(SESSION_KEY);
        setOtp('');
        setSessionCode('');
        setActiveSession(null);
        setScreen('MOBILE');
    };

    if (screen === 'READY') return children;

    return (
        <main className="rc-session-page">
            <section className="rc-session-card">
                <div className="rc-session-brand">RC Dine</div>
                <h1>RC Session</h1>
                {availability?.table && (
                    <p className="rc-session-table">
                        Table {availability.table.tableNumber || availability.table.tableName || ''}
                    </p>
                )}

                {screen === 'LOADING' ? (
                    <div className="rc-session-center">
                        <Spinner animation="border" />
                        <p>Table check ho rahi hai…</p>
                    </div>
                ) : null}

                {screen === 'MOBILE' ? (
                    <Form onSubmit={handleSendOtp}>
                        <Form.Group className="mb-3">
                            <Form.Label>Mobile Number</Form.Label>
                            <div className="rc-session-mobile-row">
                                <span>+91</span>
                                <Form.Control
                                    autoFocus
                                    inputMode="numeric"
                                    maxLength={10}
                                    placeholder="10-digit number"
                                    value={mobileNumber}
                                    onChange={(event) => setMobileNumber(event.target.value.replace(/\D/g, ''))}
                                />
                            </div>
                        </Form.Group>
                        <Button type="submit" className="w-100" disabled={busy}>
                            {busy ? 'OTP bhej rahe hain…' : 'Send OTP'}
                        </Button>
                    </Form>
                ) : null}

                {screen === 'OTP' ? (
                    <Form onSubmit={handleVerifyOtp}>
                        <p className="rc-session-help">OTP {maskMobile(mobileNumber)} par bheja gaya hai.</p>
                        <Form.Control
                            autoFocus
                            className="rc-session-otp"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="• • • • • •"
                            value={otp}
                            onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
                        />
                        <Button type="submit" className="w-100 mt-3" disabled={busy}>
                            {busy ? 'Verify ho raha hai…' : 'Verify & Continue'}
                        </Button>
                        <button
                            type="button"
                            className="rc-session-link"
                            disabled={busy || resendAfter > 0}
                            onClick={handleSendOtp}
                        >
                            {resendAfter > 0 ? `Resend OTP in ${resendAfter}s` : 'Resend OTP'}
                        </button>
                    </Form>
                ) : null}

                {screen === 'START_SESSION' ? (
                    <div className="rc-session-state">
                        <div className="rc-session-state-icon">🍽️</div>
                        <h2>Start new RC Session</h2>
                        <p>Is table par abhi koi active session nahi hai.</p>
                        <Button className="w-100" disabled={busy} onClick={handleStartSession}>
                            {busy ? 'Session start ho raha hai…' : 'Start RC Session'}
                        </Button>
                        <button type="button" className="rc-session-link" onClick={handleLogoutNumber}>
                            Change mobile number
                        </button>
                    </div>
                ) : null}

                {screen === 'JOIN_CODE' ? (
                    <Form onSubmit={handleJoinSession}>
                        <div className="rc-session-active-badge">Active session available</div>
                        <h2 className="rc-session-subtitle">Join Existing Session</h2>
                        <p className="rc-session-help">Host se 8-character session code lekar yahan enter karo.</p>
                        <Form.Control
                            autoFocus
                            className="rc-session-code-input"
                            maxLength={12}
                            placeholder="A7C91F2B"
                            value={sessionCode}
                            onChange={(event) =>
                                setSessionCode(event.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())
                            }
                        />
                        <Button type="submit" className="w-100 mt-3" disabled={busy}>
                            {busy ? 'Request bhej rahe hain…' : 'Request Join'}
                        </Button>
                        <button type="button" className="rc-session-link" onClick={handleLogoutNumber}>
                            Change mobile number
                        </button>
                    </Form>
                ) : null}

                {screen === 'JOIN_PENDING' ? (
                    <div className="rc-session-state">
                        <Spinner animation="border" />
                        <h2>Waiting for host approval</h2>
                        <p>Your request will expire automatically after 60 seconds.</p>
                        {pushCapability.permission !== 'granted' && (
                            <Button variant="outline-primary" disabled={busy} onClick={handleEnableNotifications}>
                                Enable background updates
                            </Button>
                        )}
                    </div>
                ) : null}

                {screen === 'HOST_SUCCESS' ? (
                    <div className="rc-session-state rc-session-success">
                        <div className="rc-session-state-icon">✅</div>
                        <h2>RC Session started</h2>
                        <p>Ye code friends ke saath share karo.</p>
                        <div className="rc-session-code-box">{activeSession?.sessionCode}</div>
                        <Button className="w-100" onClick={handleShareCode}>Share Code</Button>
                        <Button variant="outline-primary" className="w-100 mt-2" onClick={() => setScreen('READY')}>
                            Continue to Menu
                        </Button>
                    </div>
                ) : null}

                {screen === 'JOIN_SUCCESS' ? (
                    <div className="rc-session-state rc-session-success">
                        <div className="rc-session-state-icon">🎉</div>
                        <h2>RC Session joined successfully</h2>
                        <p>Ab aap same table session me order kar sakte ho.</p>
                        <Button className="w-100" onClick={() => setScreen('READY')}>Continue to Menu</Button>
                    </div>
                ) : null}

                {screen === 'UNAVAILABLE' ? (
                    <div className="rc-session-state">
                        <div className="rc-session-state-icon">🔒</div>
                        <h2>Table unavailable</h2>
                        <p>Is table ka QR abhi manager ne activate nahi kiya hai. Staff se contact karo.</p>
                        <Button variant="outline-primary" onClick={loadAvailability}>Check Again</Button>
                    </div>
                ) : null}

                {screen === 'ERROR' ? (
                    <div className="rc-session-state">
                        <h2>Connection problem</h2>
                        <p>Table details load nahi ho paayi.</p>
                        <Button variant="outline-primary" onClick={loadAvailability}>Retry</Button>
                    </div>
                ) : null}

                {errorMessage ? <div className="rc-session-error">{errorMessage}</div> : null}
                <p className="rc-session-privacy">OTP verification ke baad hi ordering open hogi.</p>
            </section>
        </main>
    );
}

export default RCSessionGuard;
