import React, { useEffect, useState } from 'react';
import { Form, Formik } from 'formik';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContainer from '../../components/AuthContainer';
import CustomButton from '../../components/CustomButton';
import CustomFormGroup from '../../components/CustomFormGroup';
import * as adminAuthService from '../../services/adminAuth.service';
import { getUserRequest } from '../../store/slice';
import { loginSchema } from '../../validations/auth';

function AdminLogin() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [challenge, setChallenge] = useState(null);
    const [otp, setOtp] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [resending, setResending] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (cooldown <= 0) return undefined;
        const timer = setInterval(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    const handleCredentials = async (values, { setSubmitting }) => {
        try {
            const response = await adminAuthService.startLogin({ email: values.email, password: values.password });
            setChallenge(response);
            setCooldown(response.resendAfterSeconds || 45);
            setOtp('');
            toast.success(`Verification code sent to ${response.maskedEmail}`);
        } catch (error) {
            toast.error(error?.message || 'Admin login failed');
        } finally {
            setSubmitting(false);
        }
    };

    const handleVerify = async (event) => {
        event.preventDefault();
        if (!/^\d{6}$/.test(otp)) {
            toast.warn('Enter the 6-digit verification code');
            return;
        }

        try {
            setVerifying(true);
            const response = await adminAuthService.verifyLogin({ challengeId: challenge.challengeId, otp });
            localStorage.setItem('token', response.token);
            localStorage.setItem('data', response.data);
            dispatch(getUserRequest({ navigate }));
            navigate('/admin/dashboard');
            toast.success('Admin verified successfully');
        } catch (error) {
            toast.error(error?.message || 'OTP verification failed');
        } finally {
            setVerifying(false);
        }
    };

    const handleResend = async () => {
        try {
            setResending(true);
            const response = await adminAuthService.resendOtp(challenge.challengeId);
            setChallenge(response);
            setCooldown(response.resendAfterSeconds || 45);
            setOtp('');
            toast.success(`New code sent to ${response.maskedEmail}`);
        } catch (error) {
            toast.error(error?.message || 'Could not resend OTP');
        } finally {
            setResending(false);
        }
    };

    if (challenge) {
        return (
            <AuthContainer title="Verify Admin Login">
                <form className="d-flex flex-column" onSubmit={handleVerify}>
                    <div className="alert alert-success small">
                        Verification code sent to <strong>{challenge.maskedEmail}</strong>
                    </div>
                    <label className="small fw-semibold text-secondary mb-2" htmlFor="admin-login-otp">
                        6-digit verification code
                    </label>
                    <input
                        id="admin-login-otp"
                        className="form-control text-center fs-4 fw-bold"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={otp}
                        onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                        autoFocus
                    />
                    <CustomButton
                        label={verifying ? 'Verifying...' : 'Verify & Login →'}
                        disabled={verifying || otp.length !== 6}
                        type="submit"
                        className="mx-auto mt-4"
                    />
                    <button
                        className="btn btn-link text-success mt-2"
                        type="button"
                        disabled={resending || cooldown > 0}
                        onClick={handleResend}
                    >
                        {cooldown > 0 ? `Resend code in ${cooldown}s` : resending ? 'Sending...' : 'Resend code'}
                    </button>
                    <button
                        className="btn btn-link text-secondary"
                        type="button"
                        disabled={verifying}
                        onClick={() => {
                            setChallenge(null);
                            setOtp('');
                        }}
                    >
                        ← Use different login
                    </button>
                </form>
            </AuthContainer>
        );
    }

    return (
        <AuthContainer title="Secure Admin Login">
            <Formik
                initialValues={{ email: '', password: '', role: 'ADMIN' }}
                validationSchema={loginSchema}
                onSubmit={handleCredentials}
            >
                {({ isSubmitting, isValid, dirty }) => (
                    <Form className="d-flex flex-column">
                        <div className="alert alert-light border small text-secondary">
                            Password ke baad registered Gmail par verification code aayega.
                        </div>
                        <CustomFormGroup name="email" type="email" label="Admin Email" />
                        <CustomFormGroup name="password" type="password" label="Password" />
                        <CustomButton
                            label={isSubmitting ? 'Checking...' : 'Continue Securely →'}
                            disabled={isSubmitting || !isValid || !dirty}
                            type="submit"
                            className="mx-auto my-4"
                        />
                    </Form>
                )}
            </Formik>
        </AuthContainer>
    );
}

export default AdminLogin;
