import React, { useState } from 'react';
import CryptoJS from 'crypto-js';
import { Form, Formik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContainer from '../../components/AuthContainer';
import CustomButton from '../../components/CustomButton';
import CustomFormGroup from '../../components/CustomFormGroup';
import CustomLink from '../../components/CustomLink';
import RecoveryCodeField from '../../components/RecoveryCodeField';
import env from '../../config/env';
import { forgotPasswordUser, resetOwnerPassword } from '../../services/auth.service';
import { emailSchema, ownerRecoveryResetSchema } from '../../validations/auth';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [recoveryMethod, setRecoveryMethod] = useState('code');
    const initialValues = {
        email: '',
        recoveryCode: '',
        newPassword: '',
        confirmNewPassword: ''
    };
    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const response = await resetOwnerPassword({
                email: values.email.trim().toLowerCase(),
                recoveryCode: values.recoveryCode,
                newPassword: CryptoJS.AES.encrypt(values.newPassword, env.cryptoSecret).toString(),
                confirmNewPassword: CryptoJS.AES.encrypt(values.confirmNewPassword, env.cryptoSecret).toString()
            });
            toast.success(response.message);
            navigate('/login', { replace: true });
        } catch (error) {
            toast.error(error?.message || 'Email or recovery code is incorrect.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleOnClickLogin = (e) => {
        e.preventDefault();
        navigate('/login');
    };

    const handleSendResetLink = async (values, { setSubmitting }) => {
        try {
            const response = await forgotPasswordUser({ email: values.email.trim().toLowerCase() });
            toast.success(response.message || 'Reset password link sent successfully.');
            navigate('/login');
        } catch (error) {
            toast.error(error?.message || 'Unable to send password reset link.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthContainer title={'Forgot Password'}>
            <div className="btn-group w-100 mb-4" role="group" aria-label="Choose password recovery method">
                <button
                    type="button"
                    className={`btn ${recoveryMethod === 'code' ? 'btn-success' : 'btn-outline-success'}`}
                    onClick={() => setRecoveryMethod('code')}
                >
                    Use Recovery Code
                </button>
                <button
                    type="button"
                    className={`btn ${recoveryMethod === 'email' ? 'btn-success' : 'btn-outline-success'}`}
                    onClick={() => setRecoveryMethod('email')}
                >
                    Send Reset Link
                </button>
            </div>

            {recoveryMethod === 'code' ? (
                <Formik
                    initialValues={initialValues}
                    validationSchema={ownerRecoveryResetSchema}
                    onSubmit={handleSubmit}
                >
                    {({ isSubmitting, dirty, isValid }) => (
                        <Form className="d-flex flex-column">
                            <p className="text-muted small">Reset immediately using your private 6-digit code.</p>
                            <CustomFormGroup name="email" type="email" label="Registered Email" />
                            <RecoveryCodeField name="recoveryCode" label="Recovery Code" />
                            <CustomFormGroup name="newPassword" type="password" label="New Password" />
                            <CustomFormGroup name="confirmNewPassword" type="password" label="Confirm New Password" />
                            <CustomButton
                                label={isSubmitting ? 'Resetting...' : 'Reset Password'}
                                type="submit"
                                disabled={isSubmitting || !isValid || !dirty}
                                className="mx-auto my-4"
                            />
                        </Form>
                    )}
                </Formik>
            ) : (
                <Formik initialValues={{ email: '' }} validationSchema={emailSchema} onSubmit={handleSendResetLink}>
                    {({ isSubmitting, dirty, isValid }) => (
                        <Form className="d-flex flex-column">
                            <p className="text-muted small">
                                We will email a secure link that remains valid for one hour.
                            </p>
                            <CustomFormGroup name="email" type="email" label="Registered Email" />
                            <CustomButton
                                label={isSubmitting ? 'Sending...' : 'Send Reset Link'}
                                type="submit"
                                disabled={isSubmitting || !isValid || !dirty}
                                className="mx-auto my-4"
                            />
                        </Form>
                    )}
                </Formik>
            )}

            <div className="text-center">
                <p className="label-font m-0">
                    Remember your password? <CustomLink onClick={handleOnClickLogin} text="Owner Login" />
                </p>
            </div>
        </AuthContainer>
    );
};

export default ForgotPassword;
