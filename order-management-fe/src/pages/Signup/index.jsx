import React, { useEffect, useState } from 'react';
import CryptoJS from 'crypto-js';
import { Formik, Form } from 'formik';
import { Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthContainer from '../../components/AuthContainer';
import CustomButton from '../../components/CustomButton';
import CustomFormGroup from '../../components/CustomFormGroup';
import CustomLink from '../../components/CustomLink';
import RecoveryCodeField from '../../components/RecoveryCodeField';
import env from '../../config/env';
import { registerUser } from '../../services/auth.service';
import { getSelectedPlan, saveSelectedPlan, setPageSeo } from '../../utils/seo';
import { managerRegistrationSchema, userRegistrationSchema } from '../../validations/auth';

function Signup() {
    const [initialValues, setInitialValues] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        email: '',
        password: '',
        confirmPassword: '',
        recoveryCode: '',
        confirmRecoveryCode: ''
    });

    const navigate = useNavigate();
    const [invite, setInvite] = useState({ status: false, email: '', id: '' });

    useEffect(() => {
        setPageSeo({
            title: 'Create Account – RC Dine',
            description: 'Create your RC Dine owner account and start managing restaurant orders.'
        });
        const params = new URLSearchParams(window.location.search);
        const requestedPlan = params.get('plan');
        if (requestedPlan) saveSelectedPlan(requestedPlan);

        (async () => {
            try {
                const url = new URL(window.location.href);
                const token = decodeURIComponent(url.searchParams.get('token'));
                if (!token || token === 'null') return;

                const data = JSON.parse(CryptoJS.AES.decrypt(token, env.cryptoSecret).toString(CryptoJS.enc.Utf8));
                const keys = Object.keys(data);

                if (
                    keys.length === 3 &&
                    keys.includes('email') &&
                    keys.includes('inviteId') &&
                    keys.includes('expires')
                ) {
                    setInitialValues((prevValues) => ({
                        ...prevValues,
                        email: data.email
                    }));
                    setInvite({ status: true, email: data.email, id: data.inviteId });
                }

                const selectedPlan = getSelectedPlan();
                localStorage.clear();
                if (selectedPlan) saveSelectedPlan(selectedPlan);
            } catch (err) {
                toast.error(`Failed to validate invite: ${err.message}`);
            }
        })();
    }, []);

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const data = {
                ...values,
                password: values.password
            };
            delete data.confirmPassword;

            if (invite.status) {
                data.invite = invite.id;
                delete data.recoveryCode;
                delete data.confirmRecoveryCode;
            }

            await registerUser(data);
            toast.success('User registered successfully. You can now log in.');
            navigate('/login');
        } catch (error) {
            toast.error(`Failed to register user: ${error?.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleOnClickLogin = (e) => {
        e.preventDefault();
        navigate('/login');
    };

    return (
        <AuthContainer title={'Registration'}>
            <Formik
                initialValues={initialValues}
                validationSchema={invite.status ? managerRegistrationSchema : userRegistrationSchema}
                onSubmit={handleSubmit}
                enableReinitialize={true}
            >
                {({ isSubmitting, isValid, dirty }) => (
                    <Form className="rc-form">
                        <Row className="mt-2">
                            <Col className="col-12 col-md-6">
                                <CustomFormGroup name="firstName" type="text" label="First Name" />
                            </Col>
                            <Col className="col-12 col-md-6">
                                <CustomFormGroup name="lastName" type="text" label="Last Name" />
                            </Col>
                        </Row>

                        {!invite.status && (
                            <Row className="mt-2">
                                <Col className="col-12 col-md-6">
                                    <RecoveryCodeField name="recoveryCode" label="Recovery Code" />
                                </Col>
                                <Col className="col-12 col-md-6">
                                    <RecoveryCodeField name="confirmRecoveryCode" label="Confirm Recovery Code" />
                                </Col>
                            </Row>
                        )}

                        <Row className="mt-2">
                            <Col className="col-12 col-md-6">
                                <CustomFormGroup name="email" type="email" label="Email" disabled={invite.status} />
                            </Col>
                            <Col className="col-12 col-md-6">
                                <CustomFormGroup name="phoneNumber" type="number" label="Phone Number" />
                            </Col>
                        </Row>

                        <Row className="mt-2">
                            <Col className="col-12 col-md-6">
                                <CustomFormGroup name="password" type="password" label="Password" />
                            </Col>
                            <Col className="col-12 col-md-6">
                                <CustomFormGroup name="confirmPassword" type="password" label="Confirm Password" />
                            </Col>
                        </Row>

                        <CustomButton
                            type="submit"
                            disabled={isSubmitting || !isValid || !dirty}
                            label="Create Account →"
                            className="mx-auto"
                        />

                        <div className="text-center mx-3 mt-3">
                            <p className="label-font m-0">
                                Already have an account? <CustomLink text="Sign in" onClick={handleOnClickLogin} />
                            </p>
                        </div>
                    </Form>
                )}
            </Formik>
        </AuthContainer>
    );
}

export default Signup;
