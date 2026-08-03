import React from 'react';
import { Form, Formik } from 'formik';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AuthContainer from '../../components/AuthContainer';
import CustomButton from '../../components/CustomButton';
import CustomFormGroup from '../../components/CustomFormGroup';
import CustomLink from '../../components/CustomLink';
import { forgotPasswordRequest } from '../../store/slice';
import { emailSchema } from '../../validations/auth';

const EmailForgotPassword = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    return (
        <AuthContainer title="Manager Password Recovery">
            <Formik
                initialValues={{ email: '' }}
                validationSchema={emailSchema}
                onSubmit={(values, { setSubmitting }) => {
                    dispatch(forgotPasswordRequest({ data: values, navigate }));
                    setSubmitting(false);
                }}
            >
                {({ isSubmitting, dirty, isValid }) => (
                    <Form className="d-flex flex-column">
                        <CustomFormGroup name="email" type="email" label="Registered Email" />
                        <CustomButton
                            label="Send Recovery Email"
                            type="submit"
                            disabled={isSubmitting || !isValid || !dirty}
                            className="mx-auto my-4"
                        />
                        <div className="text-center">
                            <p className="label-font m-0">
                                Back to <CustomLink onClick={() => navigate('/login')} text="Login" />
                            </p>
                        </div>
                    </Form>
                )}
            </Formik>
        </AuthContainer>
    );
};

export default EmailForgotPassword;
