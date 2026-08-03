import React from 'react';
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
import { resetOwnerPassword } from '../../services/auth.service';
import { ownerRecoveryResetSchema } from '../../validations/auth';

const ForgotPassword = () => {
    const navigate = useNavigate();
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

    return (
        <AuthContainer title={'Forgot Password'}>
            <Formik initialValues={initialValues} validationSchema={ownerRecoveryResetSchema} onSubmit={handleSubmit}>
                {({ isSubmitting, dirty, isValid }) => (
                    <Form className="d-flex flex-column">
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
                        <div className="text-center">
                            <p className="label-font m-0">
                                Remember your password? <CustomLink onClick={handleOnClickLogin} text="Owner Login" />
                            </p>
                        </div>
                    </Form>
                )}
            </Formik>
        </AuthContainer>
    );
};

export default ForgotPassword;
