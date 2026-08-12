import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import { FiCheckCircle, FiLock, FiMail, FiRefreshCw, FiShield } from 'react-icons/fi';
import { toast } from 'react-toastify';
import * as adminAuthService from '../../services/adminAuth.service';
import './style.css';

const EMPTY_EMAIL_FORM = { currentPassword: '', newEmail: '' };
const EMPTY_PASSWORD_FORM = { currentPassword: '', newPassword: '', confirmPassword: '' };

const AdminSecurityPanel = ({ currentEmail = '' }) => {
    const [mode, setMode] = useState('email');
    const [emailForm, setEmailForm] = useState(EMPTY_EMAIL_FORM);
    const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);
    const [challenge, setChallenge] = useState(null);
    const [otp, setOtp] = useState('');
    const [busy, setBusy] = useState(false);
    const [resending, setResending] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (cooldown <= 0) return undefined;
        const timer = setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    const clearSessionAndOpenLogin = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('data');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        window.location.replace('/admin/login');
    };

    const resetVerification = () => {
        setChallenge(null);
        setOtp('');
        setCooldown(0);
    };

    const startChallenge = (response, type) => {
        setChallenge({ ...response, type });
        setOtp('');
        setCooldown(response.resendAfterSeconds || 45);
        toast.success(`Verification code sent to ${response.maskedEmail}`);
    };

    const switchMode = (nextMode) => {
        if (busy || resending) return;
        resetVerification();
        setMode(nextMode);
    };

    const requestEmailChange = async (event) => {
        event.preventDefault();
        if (!emailForm.currentPassword || !emailForm.newEmail) {
            toast.warn('Current password and new email are required');
            return;
        }

        try {
            setBusy(true);
            const response = await adminAuthService.requestEmailChange({
                currentPassword: emailForm.currentPassword,
                newEmail: emailForm.newEmail.trim()
            });
            setEmailForm((value) => ({ ...value, currentPassword: '' }));
            startChallenge(response, 'email');
        } catch (error) {
            toast.error(error?.message || 'Could not start email change');
        } finally {
            setBusy(false);
        }
    };

    const requestPasswordChange = async (event) => {
        event.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.warn('New passwords do not match');
            return;
        }
        if (passwordForm.newPassword.length < 12) {
            toast.warn('New password must contain at least 12 characters');
            return;
        }

        try {
            setBusy(true);
            const response = await adminAuthService.requestPasswordChange({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
                confirmPassword: passwordForm.confirmPassword
            });
            setPasswordForm(EMPTY_PASSWORD_FORM);
            startChallenge(response, 'password');
        } catch (error) {
            toast.error(error?.message || 'Could not start password change');
        } finally {
            setBusy(false);
        }
    };

    const verifyOtp = async (event) => {
        event.preventDefault();
        if (!/^\d{6}$/.test(otp)) {
            toast.warn('Enter the complete 6-digit OTP');
            return;
        }

        try {
            setBusy(true);
            const payload = { challengeId: challenge.challengeId, otp };
            const response =
                challenge.type === 'email'
                    ? await adminAuthService.verifyEmailChange(payload)
                    : await adminAuthService.verifyPasswordChange(payload);

            if (response.logoutRequired) {
                toast.success(response.message);
                clearSessionAndOpenLogin();
                return;
            }

            setChallenge({ ...response, type: challenge.type });
            setOtp('');
            setCooldown(response.resendAfterSeconds || 45);
            toast.success(`First check complete. New code sent to ${response.maskedEmail}`);
        } catch (error) {
            toast.error(error?.message || 'OTP verification failed');
        } finally {
            setBusy(false);
        }
    };

    const resendOtp = async () => {
        try {
            setResending(true);
            const response = await adminAuthService.resendOtp(challenge.challengeId);
            setChallenge((value) => ({ ...value, ...response }));
            setOtp('');
            setCooldown(response.resendAfterSeconds || 45);
            toast.success(`New code sent to ${response.maskedEmail}`);
        } catch (error) {
            toast.error(error?.message || 'Could not resend OTP');
        } finally {
            setResending(false);
        }
    };

    const verificationTitle =
        challenge?.phase === 'NEW_EMAIL' ? 'Verify your new email' : 'Confirm this security change';

    return (
        <section className="admin-security-panel mt-4" aria-labelledby="admin-security-title">
            <div className="admin-security-header">
                <div className="admin-security-icon">
                    <FiShield aria-hidden="true" />
                </div>
                <div>
                    <span className="admin-security-eyebrow">Account protection</span>
                    <h5 id="admin-security-title">Admin Security Center</h5>
                    <p>Important account changes require your password and a one-time email code.</p>
                </div>
                <div className="admin-security-status">
                    <FiCheckCircle aria-hidden="true" /> Secure verification active
                </div>
            </div>

            <div className="admin-security-body">
                <div className="admin-security-tabs" role="tablist" aria-label="Admin security options">
                    <button
                        className={mode === 'email' ? 'active' : ''}
                        type="button"
                        role="tab"
                        aria-selected={mode === 'email'}
                        onClick={() => switchMode('email')}
                    >
                        <FiMail aria-hidden="true" /> Change Email
                    </button>
                    <button
                        className={mode === 'password' ? 'active' : ''}
                        type="button"
                        role="tab"
                        aria-selected={mode === 'password'}
                        onClick={() => switchMode('password')}
                    >
                        <FiLock aria-hidden="true" /> Change Password
                    </button>
                </div>

                {challenge ? (
                    <form className="admin-security-verification" onSubmit={verifyOtp}>
                        <div className="admin-security-step">Security check</div>
                        <h6>{verificationTitle}</h6>
                        <p>
                            Enter the code sent to <strong>{challenge.maskedEmail}</strong>. It expires shortly and can
                            be used only once.
                        </p>
                        <Form.Control
                            className="admin-security-otp"
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            aria-label="6-digit verification code"
                            maxLength={6}
                            value={otp}
                            onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                            autoFocus
                        />
                        <button className="admin-security-primary" type="submit" disabled={busy || otp.length !== 6}>
                            Verify securely
                        </button>
                        <div className="admin-security-actions">
                            <button type="button" disabled={resending || cooldown > 0 || busy} onClick={resendOtp}>
                                <FiRefreshCw aria-hidden="true" />
                                {cooldown > 0 ? ` Resend in ${cooldown}s` : ' Resend code'}
                            </button>
                            <button type="button" disabled={busy} onClick={resetVerification}>
                                Cancel verification
                            </button>
                        </div>
                    </form>
                ) : mode === 'email' ? (
                    <form className="admin-security-form" onSubmit={requestEmailChange}>
                        <div className="admin-security-copy">
                            <h6>Update admin login email</h6>
                            <p>
                                We first verify <strong>{currentEmail || 'your current email'}</strong>, then send a
                                second code to the new email. All old sessions are signed out after the change.
                            </p>
                        </div>
                        <div className="admin-security-fields">
                            <Form.Group controlId="admin-current-password-email">
                                <Form.Label>Current password</Form.Label>
                                <Form.Control
                                    type="password"
                                    autoComplete="current-password"
                                    value={emailForm.currentPassword}
                                    onChange={(event) =>
                                        setEmailForm((value) => ({ ...value, currentPassword: event.target.value }))
                                    }
                                    required
                                />
                            </Form.Group>
                            <Form.Group controlId="admin-new-email">
                                <Form.Label>New admin email</Form.Label>
                                <Form.Control
                                    type="email"
                                    autoComplete="email"
                                    placeholder="new-admin@example.com"
                                    value={emailForm.newEmail}
                                    onChange={(event) =>
                                        setEmailForm((value) => ({ ...value, newEmail: event.target.value }))
                                    }
                                    required
                                />
                            </Form.Group>
                            <button className="admin-security-primary" type="submit" disabled={busy}>
                                Send verification code
                            </button>
                        </div>
                    </form>
                ) : (
                    <form className="admin-security-form" onSubmit={requestPasswordChange}>
                        <div className="admin-security-copy">
                            <h6>Create a strong admin password</h6>
                            <p>
                                Use 12+ characters with uppercase, lowercase, a number and a special character. An OTP
                                will be sent to <strong>{currentEmail || 'your admin email'}</strong>.
                            </p>
                        </div>
                        <div className="admin-security-fields">
                            <Form.Group controlId="admin-current-password">
                                <Form.Label>Current password</Form.Label>
                                <Form.Control
                                    type="password"
                                    autoComplete="current-password"
                                    value={passwordForm.currentPassword}
                                    onChange={(event) =>
                                        setPasswordForm((value) => ({
                                            ...value,
                                            currentPassword: event.target.value
                                        }))
                                    }
                                    required
                                />
                            </Form.Group>
                            <div className="admin-security-password-grid">
                                <Form.Group controlId="admin-new-password">
                                    <Form.Label>New password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        autoComplete="new-password"
                                        minLength={12}
                                        value={passwordForm.newPassword}
                                        onChange={(event) =>
                                            setPasswordForm((value) => ({
                                                ...value,
                                                newPassword: event.target.value
                                            }))
                                        }
                                        required
                                    />
                                </Form.Group>
                                <Form.Group controlId="admin-confirm-password">
                                    <Form.Label>Confirm new password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        autoComplete="new-password"
                                        minLength={12}
                                        value={passwordForm.confirmPassword}
                                        onChange={(event) =>
                                            setPasswordForm((value) => ({
                                                ...value,
                                                confirmPassword: event.target.value
                                            }))
                                        }
                                        required
                                    />
                                </Form.Group>
                            </div>
                            <button className="admin-security-primary" type="submit" disabled={busy}>
                                Verify password change
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </section>
    );
};

export default AdminSecurityPanel;
