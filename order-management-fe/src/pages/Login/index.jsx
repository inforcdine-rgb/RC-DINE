import React from 'react';
import CryptoJS from 'crypto-js';
import { Form, Formik, Field, ErrorMessage } from 'formik';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AuthContainer from '../../components/AuthContainer';
import CustomButton from '../../components/CustomButton';
import CustomFormGroup from '../../components/CustomFormGroup';
import CustomLink from '../../components/CustomLink';
import env from '../../config/env';
import { loginRequest } from '../../store/slice';
import { loginSchema } from '../../validations/auth';

function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleOnClickSignup = (e) => {
        e.preventDefault();
        navigate('/signup');
    };

    const handleOnClickForgotPassword = (e) => {
        e.preventDefault();
        navigate('/forgot-password');
    };

    const initialValues = {
        email: '',
        password: '',
        role: ''
    };

    const handleSubmit = (values, { setSubmitting }) => {
        setSubmitting(true);
        const enpass = CryptoJS.AES.encrypt(values.password, env.cryptoSecret).toString();
        const data = { ...values, password: enpass };
        dispatch(loginRequest({ data, navigate }));
        setSubmitting(false);
    };

    return (
        <AuthContainer title={'Login'}>
            <Formik initialValues={initialValues} validationSchema={loginSchema} onSubmit={handleSubmit}>
                {({ isSubmitting, isValid, dirty, values }) => (
                    <Form className="rc-form">
                        <div className="rc-roles">
                            <label className="rc-role">
                                <Field type="radio" name="role" value="OWNER" />
                                <div className="rc-role-card">
                                    <span className="role-label">🏨 Owner</span>
                                    <span className="role-desc">Manage hotels & revenue</span>
                                </div>
                            </label>
                            <label className="rc-role">
                                <Field type="radio" name="role" value="MANAGER" />
                                <div className="rc-role-card">
                                    <span className="role-label">👨‍💼 Manager</span>
                                    <span className="role-desc">Manage orders & menu</span>
                                </div>
                            </label>
                        </div>
                        <div className="d-none">
                            <Field as="select" name="role" id="role" className="form-select">
                                <option value="">-- Select Role --</option>
                                <option value="OWNER">Owner</option>
                                <option value="MANAGER">Manager</option>
                                <option value="ADMIN">Admin</option>
                            </Field>
                        </div>
                        {!values.role && (
                            <ErrorMessage name="role">
                                {(msg) => <div className="text-danger small">{msg}</div>}
                            </ErrorMessage>
                        )}

                        <CustomFormGroup name="email" type="email" label="Email" />
                        <CustomFormGroup name="password" type="password" label="Password" />

                        <div className="rc-forgot text-end mt-2">
                            <CustomLink text="Forgot password?" onClick={handleOnClickForgotPassword} />
                        </div>

                        <CustomButton
                            label="Sign In →"
                            disabled={isSubmitting || !isValid || !dirty}
                            type="submit"
                            className="mx-auto"
                        />

                        <div className="text-center mt-3">
                            <p className="label-font m-0">
                                {`Don't have an account? `}
                                <CustomLink onClick={handleOnClickSignup} text="Create one" />
                            </p>
                        </div>
                    </Form>
                )}
            </Formik>
        </AuthContainer>
    );
}

export default Login;