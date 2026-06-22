import React from 'react';
import '../../assets/styles/settings.css';
import CryptoJS from 'crypto-js';
import { Card, Col, Form, Row } from 'react-bootstrap';
import { FaUserEdit } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import CustomButton from '../../components/CustomButton';
import OMTModal from '../../components/Modal';
import env from '../../config/env';
import { getPaymentSettings, updatePaymentSettings, testPaymentSettings } from '../../services/hotel.service';
import {
    setCurrentStep,
    setPaymentActivate,
    setSettingsFormData,
    setUpdateModalOptions,
    updateUserRequest
} from '../../store/slice';
import { NOTIFICATION_PREFERENCE, PAYMENT_PREFERENCE, USER_ROLES } from '../../utils/constants';
import { settingsSchema } from '../../validations/auth';
import PaymentActivation from '../PaymentActivation';

const Settings = () => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user);
    const paymentActivate = useSelector((state) => state.paymentActivation.activate);

    const { data, updateOptions, formData } = user;

    const hotelId = useSelector((state) => state.hotel?.globalHotelId);

    const [razorpayKeyId, setRazorpayKeyId] = React.useState('');
    const [razorpayKeySecret, setRazorpayKeySecret] = React.useState('');
    const [razorpayMerchantName, setRazorpayMerchantName] = React.useState('');
    const [razorpayMerchantEmail, setRazorpayMerchantEmail] = React.useState('');
    const [razorpayMerchantPhone, setRazorpayMerchantPhone] = React.useState('');
    const [paymentEnabled, setPaymentEnabled] = React.useState(false);

    const [loading, setLoading] = React.useState(false);
    const [testing, setTesting] = React.useState(false);
    const [saving, setSaving] = React.useState(false);
    const [testResult, setTestResult] = React.useState({ show: false, success: false, message: '' });
    const [saveResult, setSaveResult] = React.useState({ show: false, success: false, message: '' });

    React.useEffect(() => {
        if (hotelId) {
            const loadSettings = async () => {
                try {
                    setLoading(true);
                    setTestResult({ show: false, success: false, message: '' });
                    setSaveResult({ show: false, success: false, message: '' });
                    const res = await getPaymentSettings(hotelId);
                    if (res) {
                        setRazorpayKeyId(res.razorpayKeyId || '');
                        setRazorpayKeySecret(res.razorpayKeySecret || '');
                        setRazorpayMerchantName(res.razorpayMerchantName || '');
                        setRazorpayMerchantEmail(res.razorpayMerchantEmail || '');
                        setRazorpayMerchantPhone(res.razorpayMerchantPhone || '');
                        setPaymentEnabled(!!res.paymentEnabled);
                    }
                } catch (err) {
                    console.error('Error fetching hotel payment settings:', err);
                } finally {
                    setLoading(false);
                }
            };
            loadSettings();
        }
    }, [hotelId]);

    const handleTestConnection = async () => {
        try {
            setTesting(true);
            setTestResult({ show: false, success: false, message: '' });
            const payload = {
                razorpayKeyId,
                razorpayKeySecret
            };
            const res = await testPaymentSettings(hotelId, payload);
            if (res && res.success) {
                setTestResult({ show: true, success: true, message: res.message || 'Connection test successful!' });
            } else {
                setTestResult({ show: true, success: false, message: res?.message || 'Connection test failed' });
            }
        } catch (err) {
            setTestResult({
                show: true,
                success: false,
                message: err?.response?.data?.message || err?.message || 'Connection test failed'
            });
        } finally {
            setTesting(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setSaveResult({ show: false, success: false, message: '' });
            const payload = {
                razorpayKeyId,
                razorpayKeySecret,
                razorpayMerchantName,
                razorpayMerchantEmail,
                razorpayMerchantPhone,
                paymentEnabled
            };
            const res = await updatePaymentSettings(hotelId, payload);
            setSaveResult({
                show: true,
                success: true,
                message: res.message || 'Payment settings saved successfully!'
            });
        } catch (err) {
            setSaveResult({
                show: true,
                success: false,
                message: err?.response?.data?.message || err?.message || 'Failed to save settings'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        setSubmitting(true);
        const { notification, payment, ...rest } = values;
        const preferences = {
            notification: notification ? NOTIFICATION_PREFERENCE.on : NOTIFICATION_PREFERENCE.off,
            payment: payment ? PAYMENT_PREFERENCE.on : PAYMENT_PREFERENCE.off
        };
        const payload = { ...rest, preferences };

        if (payload.newPassword) {
            const enpass = CryptoJS.AES.encrypt(payload.newPassword, env.cryptoSecret).toString();
            payload.password = enpass;
        }
        delete payload.newPassword;
        delete payload.confirmPassword;

        dispatch(updateUserRequest(payload));
        setSubmitting(false);
    };

    const setUpdateOptions = () => {
        const { firstName, lastName, preference } = data;
        if (data.role === USER_ROLES[0]) {
            const options = {
                notification: {
                    name: 'notification',
                    type: 'switch',
                    label: 'Notification Preference',
                    className: 'col-6 my-2'
                }
            };
            if ([PAYMENT_PREFERENCE.on, PAYMENT_PREFERENCE.off].includes(preference?.payment)) {
                options.payment = {
                    name: 'payment',
                    type: 'switch',
                    label: 'Payment Preference',
                    className: 'col-6 my-2'
                };
            }
            dispatch(setUpdateModalOptions({ ...updateOptions, ...options }));
        }

        return {
            title: 'Update User',
            initialValues: {
                firstName,
                lastName,
                newPassword: '',
                confirmPassword: '',
                notification: NOTIFICATION_PREFERENCE.on === preference?.notification,
                payment: PAYMENT_PREFERENCE.on === preference?.payment
            },
            submitText: 'Update',
            closeText: 'Close'
        };
    };

    return (
        <>
            <div className="heading-container">
                <h4 className="text-center text-white pt-5">Settings</h4>
            </div>
            <Card className="user-details mx-auto my-5 p-0 p-sm-4 shadow custom-shadow">
                <Card.Body>
                    <Row className="mb-3">
                        <Col xs={12} className="d-flex">
                            <FaUserEdit
                                color="#49ac60"
                                className="ms-auto cursor-pointer"
                                role="button"
                                size={25}
                                onClick={() => {
                                    dispatch(setSettingsFormData(setUpdateOptions()));
                                }}
                            />
                        </Col>
                    </Row>
                    {[
                        { label: 'R-C DINE ID', value: data?.id },
                        { label: 'First Name', value: data?.firstName },
                        { label: 'Last Name', value: data?.lastName },
                        { label: 'E-mail', value: data.email },
                        { label: 'Phone Number', value: data.phoneNumber },
                        { label: 'Role', value: data.role }
                    ].map(({ label, value }, index) => (
                        <Row className="mb-3" key={`${label}-${index}`}>
                            <Col className="col-12 col-sm-3">
                                <strong className="setting-title">{label} : </strong>
                            </Col>
                            <Col className="col-12 col-sm-9">{value}</Col>
                        </Row>
                    ))}
                    <Row className="mb-3">
                        {[PAYMENT_PREFERENCE.on, PAYMENT_PREFERENCE.off].includes(data.preference?.payment) ? (
                            <>
                                <Col className="col-12 col-sm-3">
                                    <strong className="setting-title">Payment Gateway Preference:</strong>
                                </Col>
                                <Col className="col-12 col-sm-9">
                                    <Form.Check
                                        type="switch"
                                        checked={data.preference?.payment === PAYMENT_PREFERENCE.on}
                                        disabled={true}
                                    />
                                </Col>
                            </>
                        ) : (
                            <>
                                <Col className="col-12 col-sm-3">
                                    <strong className="setting-title">Activate Payment Gateway:</strong>
                                </Col>
                                <Col className="col-12 col-sm-9">
                                    <CustomButton
                                        label="Activate"
                                        disabled={data.role !== USER_ROLES[0]}
                                        onClick={() => {
                                            switch (data.preference?.payment) {
                                                case PAYMENT_PREFERENCE.stakeholder:
                                                    dispatch(setCurrentStep(2));
                                                    break;
                                                case PAYMENT_PREFERENCE.bank:
                                                    dispatch(setCurrentStep(3));
                                                    break;
                                                case PAYMENT_PREFERENCE.business:
                                                default:
                                                    dispatch(setCurrentStep(1));
                                                    break;
                                            }
                                            dispatch(setPaymentActivate(true));
                                        }}
                                    />
                                </Col>
                            </>
                        )}
                    </Row>
                </Card.Body>
            </Card>
            {hotelId && (
                <Card className="user-details mx-auto my-5 p-0 p-sm-4 shadow custom-shadow">
                    <Card.Header className="bg-transparent border-0 pb-0">
                        <h5 style={{ color: '#49ac60' }} className="fw-bold mb-3">
                            Cafe Payment Settings
                        </h5>
                        <p className="text-muted small">
                            Configure custom Razorpay credentials for food ordering. Customers will pay directly to this
                            account.
                        </p>
                    </Card.Header>
                    <Card.Body>
                        {loading ? (
                            <div className="text-center py-4 text-white">Loading payment settings...</div>
                        ) : (
                            <Form onSubmit={handleSave}>
                                <Row className="mb-3">
                                    <Col xs={12} md={6} className="mb-3 mb-md-0">
                                        <Form.Group controlId="razorpayKeyId">
                                            <Form.Label className="text-white small fw-semibold">
                                                Razorpay Key ID
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="rzp_live_..."
                                                value={razorpayKeyId}
                                                onChange={(e) => setRazorpayKeyId(e.target.value)}
                                                className="bg-transparent text-white border-secondary"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12} md={6}>
                                        <Form.Group controlId="razorpayKeySecret">
                                            <Form.Label className="text-white small fw-semibold">
                                                Razorpay Secret Key
                                            </Form.Label>
                                            <Form.Control
                                                type="password"
                                                placeholder="Enter secret key"
                                                value={razorpayKeySecret}
                                                onChange={(e) => setRazorpayKeySecret(e.target.value)}
                                                className="bg-transparent text-white border-secondary"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-3">
                                    <Col xs={12} md={4} className="mb-3 mb-md-0">
                                        <Form.Group controlId="razorpayMerchantName">
                                            <Form.Label className="text-white small fw-semibold">
                                                Merchant Name
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Cafe Name"
                                                value={razorpayMerchantName}
                                                onChange={(e) => setRazorpayMerchantName(e.target.value)}
                                                className="bg-transparent text-white border-secondary"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12} md={4} className="mb-3 mb-md-0">
                                        <Form.Group controlId="razorpayMerchantEmail">
                                            <Form.Label className="text-white small fw-semibold">
                                                Merchant Email
                                            </Form.Label>
                                            <Form.Control
                                                type="email"
                                                placeholder="contact@cafe.com"
                                                value={razorpayMerchantEmail}
                                                onChange={(e) => setRazorpayMerchantEmail(e.target.value)}
                                                className="bg-transparent text-white border-secondary"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12} md={4}>
                                        <Form.Group controlId="razorpayMerchantPhone">
                                            <Form.Label className="text-white small fw-semibold">
                                                Merchant Phone
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="9876543210"
                                                value={razorpayMerchantPhone}
                                                onChange={(e) => setRazorpayMerchantPhone(e.target.value)}
                                                className="bg-transparent text-white border-secondary"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row className="mb-4 align-items-center">
                                    <Col xs={12}>
                                        <Form.Group controlId="paymentEnabled" className="d-flex align-items-center">
                                            <Form.Check
                                                type="switch"
                                                id="paymentEnabledSwitch"
                                                label="Enable Online Payments for Food Orders"
                                                checked={paymentEnabled}
                                                onChange={(e) => setPaymentEnabled(e.target.checked)}
                                                className="text-white fs-6 fw-semibold"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {testResult.show && (
                                    <div
                                        className={`alert ${testResult.success ? 'alert-success' : 'alert-danger'} py-2 small mb-3`}
                                    >
                                        {testResult.message}
                                    </div>
                                )}

                                {saveResult.show && (
                                    <div
                                        className={`alert ${saveResult.success ? 'alert-success' : 'alert-danger'} py-2 small mb-3`}
                                    >
                                        {saveResult.message}
                                    </div>
                                )}

                                <div className="d-flex justify-content-between flex-wrap gap-2">
                                    <CustomButton
                                        label={testing ? 'Testing...' : 'Test Connection'}
                                        disabled={testing || !razorpayKeyId || !razorpayKeySecret}
                                        type="button"
                                        onClick={handleTestConnection}
                                        className="btn-outline-secondary"
                                    />
                                    <CustomButton
                                        label={saving ? 'Saving...' : 'Save Settings'}
                                        disabled={saving}
                                        type="submit"
                                    />
                                </div>
                            </Form>
                        )}
                    </Card.Body>
                </Card>
            )}
            <OMTModal
                show={formData}
                type="form"
                title={formData?.title}
                initialValues={formData.initialValues}
                validationSchema={settingsSchema}
                handleSubmit={handleSubmit}
                description={updateOptions}
                handleClose={() => {
                    dispatch(setSettingsFormData(false));
                }}
                isFooter={false}
                size={'lg'}
                submitText={formData.submitText}
                closeText={formData.closeText}
            />
            <OMTModal
                show={paymentActivate}
                title={'Payment Activation'}
                description={<PaymentActivation />}
                isFooter={false}
                size={'lg'}
                handleClose={() => {
                    dispatch(setPaymentActivate(false));
                }}
            />
        </>
    );
};

export default Settings;
