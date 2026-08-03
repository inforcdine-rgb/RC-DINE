import React, { useEffect, useState } from 'react';
import CryptoJS from 'crypto-js';
import { Form, Formik } from 'formik';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AuthContainer from '../../components/AuthContainer';
import CustomButton from '../../components/CustomButton';
import CustomFormGroup from '../../components/CustomFormGroup';
import env from '../../config/env';
import { resetPasswordRequest } from '../../store/slice';
import { passwordSchema } from '../../validations/auth';

const ResetPassword = () => {
    const [token, setToken] = useState('');
    const navigate = useNavigate();
    const initialValues = {
        password: '',
        confirmPassword: ''
    };
    const dispatch = useDispatch();

    useEffect(() => {
        const resetToken = new URL(window.location.href).searchParams.get('token');
        if (!resetToken) {
            navigate('/404');
            return;
        }

        setToken(resetToken);
        localStorage.removeItem('token');
        localStorage.removeItem('data');
    }, [navigate]);

    const handleSubmit = (values, { setSubmitting }) => {
        setSubmitting(true);
        const enpass = CryptoJS.AES.encrypt(values.password, env.cryptoSecret).toString();
        dispatch(resetPasswordRequest({ data: { newPassword: enpass, token }, navigate }));
        setSubmitting(false);
    };

    return (
        token && (
            <AuthContainer title="Reset Password">
                <Formik initialValues={initialValues} validationSchema={passwordSchema} onSubmit={handleSubmit}>
                    {({ isSubmitting, dirty, isValid }) => (
                        <Form className="d-flex flex-column">
                            <CustomFormGroup name="password" type="password" label="New Password" />
                            <CustomFormGroup name="confirmPassword" type="password" label="Confirm Password" />
                            <CustomButton
                                label="Reset"
                                disabled={isSubmitting || !isValid || !dirty}
                                type="submit"
                                className="mx-auto my-4"
                            />
                        </Form>
                    )}
                </Formik>
            </AuthContainer>
        )
    );
};

export default ResetPassword;
