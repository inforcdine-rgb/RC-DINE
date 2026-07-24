import React from 'react';

import CryptoJS from 'crypto-js';
import { Card, Col, Form, Row } from 'react-bootstrap';
import { FaUserEdit } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

import '../../assets/styles/settings.css';
import CustomButton from '../../components/CustomButton';
import OMTModal from '../../components/Modal';
import env from '../../config/env';
import {
    getPaymentSettings,
    testPaymentSettings,
    updatePaymentSettings
} from '../../services/hotel.service';
import {
    loadPrinterSettings,
    readPrinterSettings,
    savePrinterSettings as saveSecurePrinterSettings
} from '../../services/printerSettings.service';
import {
    setPaymentActivate,
    setSettingsFormData,
    setUpdateModalOptions,
    updateUserRequest
} from '../../store/slice';
import {
    NOTIFICATION_PREFERENCE,
    PAYMENT_PREFERENCE,
    USER_ROLES
} from '../../utils/constants';
import { settingsSchema } from '../../validations/auth';
import PaymentActivation from '../PaymentActivation';

const Settings = () => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user);
    const paymentActivate = useSelector((state) => state.paymentActivation.activate);

    const { data, updateOptions, formData } = user;

    const hotelId = useSelector((state) => state.hotel?.globalHotelId);
    const hotels = useSelector((state) => state.hotel?.data?.rows || []);
    const selectedHotel = hotels.find((hotel) => String(hotel.id) === String(hotelId)) || {};

    const [razorpayKeyId, setRazorpayKeyId] = React.useState('');
    const [razorpayKeySecret, setRazorpayKeySecret] = React.useState('');
    const [razorpayMerchantName, setRazorpayMerchantName] = React.useState('');
    const [razorpayMerchantEmail, setRazorpayMerchantEmail] = React.useState('');
    const [razorpayMerchantPhone, setRazorpayMerchantPhone] = React.useState('');
    const [paymentEnabled, setPaymentEnabled] = React.useState(false);
    const [gstEnabled, setGstEnabled] = React.useState(false);
    const [gstPercent, setGstPercent] = React.useState(0);
    const [gstModal, setGstModal] = React.useState(false);
    const [draftGstPercent, setDraftGstPercent] = React.useState(0);
    const [discountEnabled, setDiscountEnabled] = React.useState(false);
    const [discountType, setDiscountType] = React.useState('PERCENT');
    const [discountValue, setDiscountValue] = React.useState(0);
    const [discountModal, setDiscountModal] = React.useState(false);
    const [draftDiscountType, setDraftDiscountType] = React.useState('PERCENT');
    const [draftDiscountValue, setDraftDiscountValue] = React.useState(0);
    const [paymentSettingsUnlocked, setPaymentSettingsUnlocked] = React.useState(false);
    const [paymentPin, setPaymentPin] = React.useState('');
    const [paymentPinError, setPaymentPinError] = React.useState('');
    const [printerWidth, setPrinterWidth] = React.useState('58');
    const [receiptShowLogo, setReceiptShowLogo] = React.useState(true);
    const [printerSaved, setPrinterSaved] = React.useState(false);

    const [loading, setLoading] = React.useState(false);
    const [testing, setTesting] = React.useState(false);
    const [saving, setSaving] = React.useState(false);
    const [testResult, setTestResult] = React.useState({ show: false, success: false, message: '' });
    const [saveResult, setSaveResult] = React.useState({ show: false, success: false, message: '' });

    React.useEffect(() => {
        let active = true;
        const hydrate = async () => {
            if (!hotelId) {
                setPrinterWidth('58');
                return;
            }
            const cached = readPrinterSettings(hotelId);
            setPrinterWidth(cached.printerWidth || '58');
            setReceiptShowLogo(cached.showLogo !== false);
            const saved = await loadPrinterSettings(hotelId);
            if (!active) return;
            setPrinterWidth(saved.printerWidth || '58');
            setReceiptShowLogo(saved.showLogo !== false);
        };
        hydrate().catch(() => {
            setSaveResult({ show: true, success: false, message: 'Server settings load nahi hui; cached settings use ho rahi hain.' });
        });
        return () => { active = false; };
    }, [hotelId]);

    const handleSavePrinterSettings = async () => {
        if (!hotelId) {
            setSaveResult({ show: true, success: false, message: 'Hotel select karo.' });
            return;
        }

        const current = readPrinterSettings(hotelId);
        const nextPrinterWidth = ['58', '80', 'auto'].includes(printerWidth)
            ? printerWidth
            : '58';

        if (current.printerWidth === nextPrinterWidth) {
            setSaveResult({ show: true, success: false, message: 'No changes detected.' });
            return;
        }

        try {
            const saved = await saveSecurePrinterSettings(hotelId, {
                ...current,
                printerWidth: nextPrinterWidth,
                showLogo: receiptShowLogo
            });
            setPrinterWidth(saved.printerWidth || '58');
            setReceiptShowLogo(saved.showLogo !== false);
            setPrinterSaved(true);
            setSaveResult({
                show: true,
                success: true,
                message: 'Printer width hotel account me save ho gayi.'
            });
            window.setTimeout(() => setPrinterSaved(false), 2000);
        } catch (error) {
            setPrinterSaved(false);
            setSaveResult({
                show: true,
                success: false,
                message: error?.message || 'Printer width save nahi hui.'
            });
        }
    };

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
                        setGstEnabled(!!res.gstEnabled);
                        setGstPercent(Number(res.gstPercent ?? 0));
                        setDraftGstPercent(Number(res.gstPercent ?? 0));
                        setDiscountEnabled(!!res.discountEnabled);
                        setDiscountType(res.discountType || 'PERCENT');
                        setDiscountValue(Number(res.discountValue ?? 0));
                        setDraftDiscountType(res.discountType || 'PERCENT');
                        setDraftDiscountValue(Number(res.discountValue ?? 0));
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

    const handleUnlockPaymentSettings = () => {
        const correctPin = process.env.REACT_APP_PAYMENT_SETTINGS_PIN || '1622';

        if (paymentPin === correctPin) {
            setPaymentSettingsUnlocked(true);
            setPaymentPinError('');
            return;
        }

        setPaymentPinError('Invalid PIN');
    };

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
                paymentEnabled,
                gstEnabled,
                gstPercent: gstEnabled ? Number(gstPercent) || 0 : 0,
                discountEnabled,
                discountType: discountEnabled ? discountType : null,
                discountValue: discountEnabled ? Number(discountValue) || 0 : 0
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

    const handleOpenGstModal = () => {
        setDraftGstPercent(gstEnabled ? Number(gstPercent || 0) : 5);
        setGstModal(true);
    };

    const savePaymentPayload = async (nextGstEnabled, nextGstPercent, nextDiscountEnabled = discountEnabled, nextDiscountType = discountType, nextDiscountValue = discountValue) => {
        const payload = {
            razorpayKeyId,
            razorpayKeySecret,
            razorpayMerchantName,
            razorpayMerchantEmail,
            razorpayMerchantPhone,
            paymentEnabled,
            gstEnabled: !!nextGstEnabled,
            gstPercent: nextGstEnabled ? Number(nextGstPercent || 0) : 0,
            discountEnabled: !!nextDiscountEnabled,
            discountType: nextDiscountEnabled ? nextDiscountType : null,
            discountValue: nextDiscountEnabled ? Number(nextDiscountValue || 0) : 0
        };
        return updatePaymentSettings(hotelId, payload);
    };

    const handleOpenDiscountModal = () => {
        setDraftDiscountType(discountType || 'PERCENT');
        setDraftDiscountValue(discountEnabled ? Number(discountValue || 0) : 10);
        setDiscountModal(true);
    };

    const handleSaveDiscount = async () => {
        try {
            const nextValue = Number(draftDiscountValue);
            if (Number.isNaN(nextValue) || nextValue <= 0) {
                setSaveResult({ show: true, success: false, message: 'Discount value 0 se zyada hona chahiye.' });
                return;
            }
            if (draftDiscountType === 'PERCENT' && nextValue > 100) {
                setSaveResult({ show: true, success: false, message: 'Percentage discount 100% se zyada nahi hona chahiye.' });
                return;
            }

            setSaving(true);
            setSaveResult({ show: false, success: false, message: '' });
            const res = await savePaymentPayload(gstEnabled, gstPercent, true, draftDiscountType, nextValue);
            setDiscountEnabled(true);
            setDiscountType(draftDiscountType);
            setDiscountValue(nextValue);
            setDiscountModal(false);
            setSaveResult({ show: true, success: true, message: res?.message || 'Discount activated successfully!' });
        } catch (err) {
            setSaveResult({ show: true, success: false, message: err?.response?.data?.message || err?.message || 'Failed to save discount settings' });
        } finally {
            setSaving(false);
        }
    };

    const handleDeactivateDiscount = async () => {
        try {
            setSaving(true);
            setSaveResult({ show: false, success: false, message: '' });
            const res = await savePaymentPayload(gstEnabled, gstPercent, false, null, 0);
            setDiscountEnabled(false);
            setDiscountType('PERCENT');
            setDiscountValue(0);
            setDraftDiscountValue(0);
            setSaveResult({ show: true, success: true, message: res?.message || 'Discount deactivated successfully!' });
        } catch (err) {
            setSaveResult({ show: true, success: false, message: err?.response?.data?.message || err?.message || 'Failed to deactivate discount' });
        } finally {
            setSaving(false);
        }
    };

    const handleSaveGst = async () => {
        try {
            const nextPercent = Number(draftGstPercent);
            if (Number.isNaN(nextPercent) || nextPercent < 1 || nextPercent > 100) {
                setSaveResult({ show: true, success: false, message: 'GST percent 1 se 100 ke beech hona chahiye.' });
                return;
            }

            setSaving(true);
            setSaveResult({ show: false, success: false, message: '' });
            const res = await savePaymentPayload(true, nextPercent);
            setGstEnabled(true);
            setGstPercent(nextPercent);
            setGstModal(false);
            setSaveResult({
                show: true,
                success: true,
                message: res?.message || 'GST activated successfully!'
            });
        } catch (err) {
            setSaveResult({
                show: true,
                success: false,
                message: err?.response?.data?.message || err?.message || 'Failed to save GST settings'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleDeactivateGst = async () => {
        try {
            setSaving(true);
            setSaveResult({ show: false, success: false, message: '' });
            const res = await savePaymentPayload(false, 0);
            setGstEnabled(false);
            setGstPercent(0);
            setDraftGstPercent(0);
            setSaveResult({
                show: true,
                success: true,
                message: res?.message || 'GST deactivated successfully!'
            });
        } catch (err) {
            setSaveResult({
                show: true,
                success: false,
                message: err?.response?.data?.message || err?.message || 'Failed to deactivate GST'
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
            {hotelId && (
                <section className="settings-section-card settings-hotel-card">
                    <div className="settings-section-heading">
                        <div>
                            <span>OWNER SETTINGS</span>
                            <h5>Hotel Information</h5>
                        </div>
                    </div>
                    <div className="settings-info-grid">
                        {[
                            { label: 'Name', value: selectedHotel.name || 'Not available' },
                            { label: 'Address', value: selectedHotel.address || 'Not available' },
                            { label: 'Phone', value: selectedHotel.careNumber || 'Not available' },
                            { label: 'GSTIN', value: selectedHotel.gstNumber || 'Not registered' }
                        ].map((item) => (
                            <div className="settings-info-item" key={item.label}>
                                <small>{item.label}</small>
                                <strong>{item.value}</strong>
                            </div>
                        ))}
                    </div>
                </section>
            )}
            <div className="settings-section-label">Account &amp; Business Settings</div>
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
                    <Row className="mb-3 align-items-center">
                        <Col className="col-12 col-sm-3">
                            <strong className="setting-title">Activate GST:</strong>
                        </Col>
                        <Col className="col-12 col-sm-9">
                            <div className="gst-control-box">
                                <div>
                                    <div className={gstEnabled ? 'gst-status-pill' : 'gst-status-pill gst-off'}>
                                        {gstEnabled ? `GST ON (${gstPercent}%)` : 'GST OFF'}
                                    </div>
                                    <small className="text-muted d-block mt-2">
                                        OFF hoga to new orders me SGST ₹0 aur CGST ₹0 dikhega. ON hoga to selected GST percent bill me apply hoga.
                                    </small>
                                </div>
                                <div className="d-flex align-items-center flex-wrap gap-2">
                                    <button
                                        type="button"
                                        className="btn gst-activate-btn"
                                        disabled={saving || !hotelId}
                                        onClick={handleOpenGstModal}
                                    >
                                        {gstEnabled ? 'Change GST %' : 'Activate GST'}
                                    </button>
                                    {gstEnabled && (
                                        <button
                                            type="button"
                                            className="btn gst-deactivate-btn"
                                            disabled={saving || !hotelId}
                                            onClick={handleDeactivateGst}
                                        >
                                            {saving ? 'Saving...' : 'Deactivate GST'}
                                        </button>
                                    )}
                                </div>
                            </div>
                            {saveResult.show && (
                                <small className={saveResult.success ? 'text-success fw-bold d-block mt-2' : 'text-danger fw-bold d-block mt-2'}>
                                    {saveResult.message}
                                </small>
                            )}
                        </Col>
                        <Row className="mb-3 align-items-center">
                            <Col className="col-12 col-sm-3">
                                <strong className="setting-title">Activate Discount:</strong>
                            </Col>
                            <Col className="col-12 col-sm-9">
                                <div className="gst-control-box">
                                    <div>
                                        <div className={discountEnabled ? 'gst-status-pill' : 'gst-status-pill gst-off'}>
                                            {discountEnabled ? `Discount ON (${discountType === 'PERCENT' ? `${discountValue}%` : `₹${discountValue}`})` : 'Discount OFF'}
                                        </div>
                                        <small className="text-muted d-block mt-2">
                                            ON hoga to QR orders aur POS orders dono me discount automatic apply hoga.
                                        </small>
                                    </div>
                                    <div className="d-flex align-items-center flex-wrap gap-2">
                                        <button type="button" className="btn gst-activate-btn" disabled={saving || !hotelId} onClick={handleOpenDiscountModal}>
                                            {discountEnabled ? 'Change Discount' : 'Activate Discount'}
                                        </button>
                                        {discountEnabled && (
                                            <button type="button" className="btn gst-deactivate-btn" disabled={saving || !hotelId} onClick={handleDeactivateDiscount}>
                                                {saving ? 'Saving...' : 'Deactivate Discount'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Row>
                </Card.Body>
            </Card>

            {hotelId && (
                <>
                    <div className="settings-section-label">
                    Printer Settings
                    </div>

                    <Card className="user-details mx-auto my-3 p-0 p-sm-4 shadow custom-shadow printer-settings-card">
                        <Card.Header className="bg-transparent border-0 pb-0">
                            <div className="printer-settings-heading">
                                <div>
                                    <h5 style={{ color: '#49ac60' }} className="fw-bold mb-1">Thermal Printer</h5>
                                    <small>Only paper width setting</small>
                                </div>
                                <span className="printer-security-chip">Hotel Sync</span>
                            </div>
                            <p className="text-muted small">Address, mobile number aur GSTIN Owner ke Hotel setup se receipt me automatically aayenge.</p>
                        </Card.Header>
                        <Card.Body>
                            <Form.Label className="payment-label">Printer Width</Form.Label>
                            <div className="printer-width-options mb-4">
                                {['58', '80', 'auto'].map((width) => (
                                    <button
                                        type="button"
                                        key={width}
                                        className={`printer-width-option ${printerWidth === width ? 'active' : ''}`}
                                        onClick={() => setPrinterWidth(width)}
                                    >
                                        {width === 'auto'
                                            ? 'Browser Default'
                                            : `${width} mm`}
                                    </button>
                                ))}
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                <button
                                    type="button"
                                    className="btn gst-activate-btn"
                                    disabled={!hotelId}
                                    onClick={handleSavePrinterSettings}
                                >
                                Save Printer Settings
                                </button>
                                {printerSaved ? <span className="text-success fw-bold">Saved ✓</span> : null}
                            </div>
                        </Card.Body>
                    </Card>
                </>
            )}
            {hotelId && (
                <>
                    <div
                        className="settings-section-label">
                            Payment Settings
                    </div>
                    <Card className="user-details mx-auto my-3 p-0 p-sm-4 shadow custom-shadow payment-settings-card">
                        <Card.Header className="bg-transparent border-0 pb-0">
                            <h5 style={{ color: '#49ac60' }} className="fw-bold mb-3">
                                Cafe Payment Settings
                            </h5>
                            <div className="payment-method-chips"><span>Cash</span><span>UPI</span><span>Card</span><span className={paymentEnabled ? 'active' : ''}>Razorpay</span></div>
                            <p className="text-muted small">
                                Configure custom Razorpay credentials for food ordering. Customers will pay directly to this
                                account.
                            </p>
                        </Card.Header>
                        <Card.Body>
                            {!paymentSettingsUnlocked ? (
                                <div className="payment-lock-box">
                                    <div className="payment-lock-icon">🔒</div>
                                    <h5>Cafe Payment Settings Locked</h5>
                                    <p>Enter 4 digit PIN to view Razorpay payment settings.</p>

                                    <Form.Control
                                        type="password"
                                        inputMode="numeric"
                                        maxLength={4}
                                        value={paymentPin}
                                        placeholder="Enter PIN"
                                        className="payment-pin-input"
                                        onChange={(e) => {
                                            setPaymentPin(e.target.value.replace(/\D/g, ''));
                                            setPaymentPinError('');
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && paymentPin.length === 4) {
                                                handleUnlockPaymentSettings();
                                            }
                                        }}
                                    />

                                    {paymentPinError && <small className="text-danger fw-bold d-block mb-2">{paymentPinError}</small>}

                                    <CustomButton
                                        label="Unlock Settings"
                                        type="button"
                                        disabled={paymentPin.length !== 4}
                                        onClick={handleUnlockPaymentSettings}
                                    />
                                </div>
                            ) : loading ? (
                                <div className="text-center py-4 text-dark fw-bold">Loading payment settings...</div>
                            ) : (
                                <Form onSubmit={handleSave}>
                                    <Row className="mb-3">
                                        <Col xs={12} md={6} className="mb-3 mb-md-0">
                                            <Form.Group controlId="razorpayKeyId">
                                                <Form.Label className="payment-label">
                                                    Razorpay Key ID
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="rzp_live_..."
                                                    value={razorpayKeyId}
                                                    onChange={(e) => setRazorpayKeyId(e.target.value)}
                                                    className="payment-input"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col xs={12} md={6}>
                                            <Form.Group controlId="razorpayKeySecret">
                                                <Form.Label className="payment-label">
                                                    Razorpay Secret Key
                                                </Form.Label>
                                                <Form.Control
                                                    type="password"
                                                    placeholder="Enter secret key"
                                                    value={razorpayKeySecret}
                                                    onChange={(e) => setRazorpayKeySecret(e.target.value)}
                                                    className="payment-input"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row className="mb-3">
                                        <Col xs={12} md={4} className="mb-3 mb-md-0">
                                            <Form.Group controlId="razorpayMerchantName">
                                                <Form.Label className="payment-label">
                                                    Merchant Name
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Cafe Name"
                                                    value={razorpayMerchantName}
                                                    onChange={(e) => setRazorpayMerchantName(e.target.value)}
                                                    className="payment-input"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col xs={12} md={4} className="mb-3 mb-md-0">
                                            <Form.Group controlId="razorpayMerchantEmail">
                                                <Form.Label className="payment-label">
                                                    Merchant Email
                                                </Form.Label>
                                                <Form.Control
                                                    type="email"
                                                    placeholder="contact@cafe.com"
                                                    value={razorpayMerchantEmail}
                                                    onChange={(e) => setRazorpayMerchantEmail(e.target.value)}
                                                    className="payment-input"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col xs={12} md={4}>
                                            <Form.Group controlId="razorpayMerchantPhone">
                                                <Form.Label className="payment-label">
                                                    Merchant Phone
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="9876543210"
                                                    value={razorpayMerchantPhone}
                                                    onChange={(e) => setRazorpayMerchantPhone(e.target.value)}
                                                    className="payment-input"
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
                                                    className="payment-switch-label"
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
                </>
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
                show={gstModal}
                title={gstEnabled ? 'Change GST Percentage' : 'Activate GST'}
                description={
                    <div className="p-2">
                        <Form.Group controlId="gstPercentInput">
                            <Form.Label className="fw-bold">GST Percentage</Form.Label>
                            <div className="d-flex align-items-center gap-2">
                                <Form.Control
                                    type="number"
                                    min="1"
                                    max="100"
                                    step="0.1"
                                    value={draftGstPercent}
                                    onChange={(e) => {
                                        setDraftGstPercent(e.target.value);
                                    }}
                                />
                                <span className="fw-bold">%</span>
                            </div>
                            <small className="text-muted">Example: 1, 2, 3, 4, 5, 12, 18, 28</small>
                        </Form.Group>
                    </div>
                }
                handleClose={() => {
                    setGstModal(false);
                }}
                handleSubmit={handleSaveGst}
                size={'md'}
                submitText={saving ? 'Saving...' : 'Save'}
                closeText={'Cancel'}
            />
            <OMTModal
                show={discountModal}
                title={'Discount Settings'}
                description={
                    <div className="p-2">
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-bold">Discount Type</Form.Label>
                            <Form.Check
                                type="radio"
                                name="discountType"
                                id="discountPercent"
                                label="Percentage (%)"
                                checked={draftDiscountType === 'PERCENT'}
                                onChange={() => setDraftDiscountType('PERCENT')}
                            />
                            <Form.Check
                                type="radio"
                                name="discountType"
                                id="discountFlat"
                                label="Fixed Amount (₹)"
                                checked={draftDiscountType === 'FLAT'}
                                onChange={() => setDraftDiscountType('FLAT')}
                            />
                        </Form.Group>
                        <Form.Group controlId="discountValueInput">
                            <Form.Label className="fw-bold">Discount Value</Form.Label>
                            <Form.Control
                                type="number"
                                min="1"
                                max={draftDiscountType === 'PERCENT' ? '100' : undefined}
                                step="0.1"
                                value={draftDiscountValue}
                                onChange={(e) => setDraftDiscountValue(e.target.value)}
                            />
                        </Form.Group>
                    </div>
                }
                handleClose={() => setDiscountModal(false)}
                handleSubmit={handleSaveDiscount}
                size={'md'}
                submitText={saving ? 'Saving...' : 'Save'}
                closeText={'Cancel'}
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
