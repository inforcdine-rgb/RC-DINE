import React, { useEffect, useState } from 'react';
import { Card, Col, Form, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import CustomButton from '../../components/CustomButton';
import Loader from '../../components/Loader';
import * as adminService from '../../services/admin.service';
import '../../assets/styles/settings.css';

function AdminSettings() {
    const [loading, setLoading] = useState(true);

    // Profile State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Razorpay State
    const [keyId, setKeyId] = useState('');
    const [keySecret, setKeySecret] = useState('');

    // Platform Plans State
    const [monthlyPrice, setMonthlyPrice] = useState(1000);
    const [halfYearlyPrice, setHalfYearlyPrice] = useState(5500);
    const [yearlyPrice, setYearlyPrice] = useState(11000);

    const [savingProfile, setSavingProfile] = useState(false);
    const [savingRazorpay, setSavingRazorpay] = useState(false);
    const [savingPlans, setSavingPlans] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await adminService.getSettings();
                if (res) {
                    setFirstName(res.profile.firstName || '');
                    setLastName(res.profile.lastName || '');
                    setEmail(res.profile.email || '');
                    setPhoneNumber(res.profile.phoneNumber || '');

                    setKeyId(res.razorpay.keyId || '');
                    setKeySecret(res.razorpay.keySecret || '');

                    if (res.plans) {
                        setMonthlyPrice(res.plans.MONTHLY?.amount || 1000);
                        setHalfYearlyPrice(res.plans.HALF_YEARLY?.amount || 5500);
                        setYearlyPrice(res.plans.YEARLY?.amount || 11000);
                    }
                }
            } catch (error) {
                toast.error(error?.message || 'Failed to load admin settings');
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (password && password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setSavingProfile(true);
        try {
            const payload = {
                profile: {
                    firstName,
                    lastName,
                    email,
                    phoneNumber,
                    ...(password ? { password } : {})
                }
            };
            await adminService.updateSettings(payload);
            toast.success('Admin Profile updated successfully');
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            toast.error(error?.message || 'Failed to update admin profile');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleSaveRazorpay = async (e) => {
        e.preventDefault();
        setSavingRazorpay(true);
        try {
            const payload = {
                razorpay: {
                    keyId,
                    keySecret
                }
            };
            await adminService.updateSettings(payload);
            toast.success('Admin Razorpay settings updated successfully');
        } catch (error) {
            toast.error(error?.message || 'Failed to update Razorpay settings');
        } finally {
            setSavingRazorpay(false);
        }
    };

    const handleSavePlans = async (e) => {
        e.preventDefault();
        setSavingPlans(true);
        try {
            const payload = {
                plans: {
                    MONTHLY: { amount: Number(monthlyPrice) },
                    HALF_YEARLY: { amount: Number(halfYearlyPrice) },
                    YEARLY: { amount: Number(yearlyPrice) }
                }
            };
            await adminService.updateSettings(payload);
            toast.success('Subscription plans updated successfully');
        } catch (error) {
            toast.error(error?.message || 'Failed to update plans');
        } finally {
            setSavingPlans(false);
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="m-4">
            <div className="heading-container mb-4">
                <h4 className="text-center text-white pt-4 m-0">Admin Settings</h4>
            </div>

            <Row className="g-4">
                {/* Admin Profile Form */}
                <Col xs={12} lg={6}>
                    <Card className="shadow p-4 bg-white text-dark h-100">
                        <Card.Header className="bg-transparent border-0 ps-0 pt-0">
                            <h5 className="fw-bold text-success mb-3">Admin Profile</h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Form onSubmit={handleSaveProfile}>
                                <Form.Group className="mb-3" controlId="firstName">
                                    <Form.Label className="small fw-semibold text-secondary">First Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="First Name"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="lastName">
                                    <Form.Label className="small fw-semibold text-secondary">Last Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Last Name"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="email">
                                    <Form.Label className="small fw-semibold text-secondary">Email Address</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="admin@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="phoneNumber">
                                    <Form.Label className="small fw-semibold text-secondary">Phone Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Phone Number"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <hr />
                                <h6 className="fw-bold text-secondary mb-3">Change Password (Optional)</h6>
                                <Form.Group className="mb-3" controlId="password">
                                    <Form.Label className="small fw-semibold text-secondary">New Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Leave blank to keep current password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-4" controlId="confirmPassword">
                                    <Form.Label className="small fw-semibold text-secondary">
                                        Confirm New Password
                                    </Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </Form.Group>
                                <div className="d-flex justify-content-end">
                                    <CustomButton
                                        label={savingProfile ? 'Saving...' : 'Save Profile'}
                                        disabled={savingProfile}
                                        type="submit"
                                    />
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Settings Column */}
                <Col xs={12} lg={6} className="d-flex flex-column gap-4">
                    {/* Admin Razorpay Settings */}
                    <Card className="shadow p-4 bg-white text-dark flex-fill">
                        <Card.Header className="bg-transparent border-0 ps-0 pt-0">
                            <h5 className="fw-bold text-success mb-3">Admin Razorpay Settings</h5>
                            <p className="text-muted small">
                                Configure credentials used for owner subscription payments.
                            </p>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Form onSubmit={handleSaveRazorpay}>
                                <Form.Group className="mb-3" controlId="keyId">
                                    <Form.Label className="small fw-semibold text-secondary">
                                        Razorpay Key ID
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="rzp_live_..."
                                        value={keyId}
                                        onChange={(e) => setKeyId(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-4" controlId="keySecret">
                                    <Form.Label className="small fw-semibold text-secondary">
                                        Razorpay Secret Key
                                    </Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Enter secret key to update"
                                        value={keySecret}
                                        onChange={(e) => setKeySecret(e.target.value)}
                                    />
                                </Form.Group>
                                <div className="d-flex justify-content-end">
                                    <CustomButton
                                        label={savingRazorpay ? 'Saving...' : 'Save Razorpay Credentials'}
                                        disabled={savingRazorpay}
                                        type="submit"
                                    />
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>

                    {/* Platform Settings (Subscription Plans) */}
                    <Card className="shadow p-4 bg-white text-dark flex-fill">
                        <Card.Header className="bg-transparent border-0 ps-0 pt-0">
                            <h5 className="fw-bold text-success mb-3">Platform Subscription Plans</h5>
                            <p className="text-muted small">
                                Update pricing details for plans available to website owners.
                            </p>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Form onSubmit={handleSavePlans}>
                                <Form.Group className="mb-3" controlId="monthlyPrice">
                                    <Form.Label className="small fw-semibold text-secondary">
                                        1 Month Plan Price (₹)
                                    </Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="1000"
                                        value={monthlyPrice}
                                        onChange={(e) => setMonthlyPrice(e.target.value)}
                                        min="1"
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="halfYearlyPrice">
                                    <Form.Label className="small fw-semibold text-secondary">
                                        6 Months Plan Price (₹)
                                    </Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="5500"
                                        value={halfYearlyPrice}
                                        onChange={(e) => setHalfYearlyPrice(e.target.value)}
                                        min="1"
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-4" controlId="yearlyPrice">
                                    <Form.Label className="small fw-semibold text-secondary">
                                        1 Year Plan Price (₹)
                                    </Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="11000"
                                        value={yearlyPrice}
                                        onChange={(e) => setYearlyPrice(e.target.value)}
                                        min="1"
                                        required
                                    />
                                </Form.Group>
                                <div className="d-flex justify-content-end">
                                    <CustomButton
                                        label={savingPlans ? 'Saving...' : 'Save Plan Prices'}
                                        disabled={savingPlans}
                                        type="submit"
                                    />
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default AdminSettings;
