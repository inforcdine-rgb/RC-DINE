import React, { useEffect, useRef, useState } from 'react';
import { Card, Col, Row, Spinner } from 'react-bootstrap';
import { FaCircleCheck } from 'react-icons/fa6';
import { IoRocket } from 'react-icons/io5';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles/subscription.css';
import CustomButton from '../../components/CustomButton';
import OMTModal from '../../components/Modal';
import Razorpay, { ACTIONS } from '../../components/Razporpay';
import * as subscriptionService from '../../services/subscription.service';
import {
    createSubscriptionOrderRequest,
    setSubscriptionOrder,
    verifySubscriptionPaymentRequest
} from '../../store/slice';

const planOptions = [
    {
        key: 'MONTHLY',
        title: 'Basic',
        subtitle: 'Monthly',
        amount: 1000,
        days: 30
    },
    {
        key: 'SIX_MONTHS',
        title: 'Pro',
        subtitle: '6 Months',
        amount: 5500,
        days: 180,
        popular: true
    },
    {
        key: 'YEARLY',
        title: 'Premium',
        subtitle: 'Yearly',
        amount: 11000,
        days: 365
    }
];

const features = [
    'Online menu ordering',
    'Live order notifications',
    'Business statistics dashboard',
    'Customer feedback',
    'Online payment integration',
    'E-Invoice for orders'
];

function Subscription() {
    const [statusData, setStatusData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [error, setError] = useState('');

    const planTrackRef = useRef(null);

    const { subscriptionOrder } = useSelector(
        (state) => state.checkout
    );

    const user = useSelector((state) => state.user.data);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response =
                    await subscriptionService.getStatus();

                setStatusData(response);
            } catch (err) {
                setError(
                    err?.message ||
                        'Unable to load subscription status'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();

        return () => {
            dispatch(setSubscriptionOrder(null));
        };
    }, [dispatch]);

    const scrollPlans = (direction) => {
        const track = planTrackRef.current;

        if (!track) {
            return;
        }

        const firstCard = track.querySelector(
            '.subscription-plan-item'
        );

        const cardWidth =
            firstCard?.getBoundingClientRect().width || 320;

        track.scrollBy({
            left:
                direction === 'next'
                    ? cardWidth + 16
                    : -(cardWidth + 16),
            behavior: 'smooth'
        });
    };

    const handleBuy = (planKey) => {
        setError('');
        setSelectedPlan(planKey);
        setShowModal(true);
    };

    const confirmPurchase = () => {
        if (!selectedPlan) {
            setError('Please select a plan');
            return;
        }

        dispatch(
            createSubscriptionOrderRequest({
                plan: selectedPlan
            })
        );

        setShowModal(false);
    };

    const handleSuccess = ({
        orderId,
        paymentId,
        razorpaySignature
    }) => {
        dispatch(
            verifySubscriptionPaymentRequest({
                razorpayOrderId: orderId,
                razorpayPaymentId: paymentId,
                razorpaySignature,
                plan: selectedPlan,
                navigate
            })
        );
    };

    const renderStatusMessage = () => {
        if (!statusData) {
            return null;
        }

        if (statusData.status === 'ACTIVE') {
            const remainingDays =
                statusData.subscriptionRemaining > 0
                    ? Math.ceil(
                        statusData.subscriptionRemaining /
                            86400
                    )
                    : 0;

            return (
                <div className="alert alert-success text-center subscription-status-alert">
                    <strong>Subscription Active</strong>

                    {remainingDays > 0 && (
                        <span>
                            {' '}
                            · {remainingDays} days remaining
                        </span>
                    )}
                </div>
            );
        }

        if (statusData.status === 'TRIAL') {
            const remainingMinutes =
                statusData.trialRemaining > 0
                    ? Math.ceil(
                        statusData.trialRemaining / 60
                    )
                    : 0;

            return (
                <div className="alert alert-info text-center subscription-status-alert">
                    <strong>Free Trial Active</strong>

                    {remainingMinutes > 0 && (
                        <span>
                            {' '}
                            · Expires in {remainingMinutes}{' '}
                            minutes
                        </span>
                    )}
                </div>
            );
        }

        return (
            <div className="alert alert-warning text-center subscription-status-alert">
                Your trial or subscription has expired.
                Select a plan to continue.
            </div>
        );
    };

    if (loading) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: '30rem' }}
            >
                <Spinner animation="border" />
            </div>
        );
    }

    return (
        <>
            <div className="heading-container">
                <h4 className="text-center text-white pt-5">
                    Subscription
                </h4>
            </div>

            <div className="subscription-status-wrap">
                {renderStatusMessage()}

                {error && (
                    <p className="text-danger text-center mb-0">
                        {error}
                    </p>
                )}
            </div>

            <section className="subscription-section">
                <div className="subscription-heading-row">
                    <div>
                        <p className="subscription-eyebrow">
                            Choose your plan
                        </p>

                        <h2 className="subscription-main-title">
                            Simple pricing for your restaurant
                        </h2>
                    </div>

                    <div className="subscription-desktop-controls">
                        <button
                            type="button"
                            className="subscription-arrow-button"
                            aria-label="Previous subscription plan"
                            onClick={() =>
                                scrollPlans('previous')
                            }
                        >
                            <MdChevronLeft size={28} />
                        </button>

                        <button
                            type="button"
                            className="subscription-arrow-button"
                            aria-label="Next subscription plan"
                            onClick={() =>
                                scrollPlans('next')
                            }
                        >
                            <MdChevronRight size={28} />
                        </button>
                    </div>
                </div>

                <div className="subscription-scroll-shell">
                    <button
                        type="button"
                        className="subscription-scroll-arrow subscription-scroll-arrow-left"
                        aria-label="Previous plan"
                        onClick={() =>
                            scrollPlans('previous')
                        }
                    >
                        <MdChevronLeft size={28} />
                    </button>

                    <div
                        ref={planTrackRef}
                        className="subscription-plan-track"
                    >
                        {planOptions.map((plan) => (
                            <div
                                key={plan.key}
                                className="subscription-plan-item"
                            >
                                <Card
                                    className={`text-center subscription-card ${
                                        plan.popular
                                            ? 'subscription-card-popular'
                                            : ''
                                    }`}
                                >
                                    <Card.Body className="d-flex flex-column">
                                        {plan.popular && (
                                            <span className="subscription-popular-badge">
                                                Most Popular
                                            </span>
                                        )}

                                        <div className="subscription-plan-title text-primary-color">
                                            <div className="subscription-plan-icon">
                                                <IoRocket size={34} />
                                            </div>

                                            <div>
                                                <h3 className="m-0 fw-bold">
                                                    {plan.title}
                                                </h3>

                                                <small>
                                                    {plan.subtitle}
                                                </small>
                                            </div>
                                        </div>

                                        <div className="subscription-price-wrap">
                                            <span className="subscription-currency">
                                                ₹
                                            </span>

                                            <span className="subscription-price">
                                                {plan.amount.toLocaleString(
                                                    'en-IN'
                                                )}
                                            </span>
                                        </div>

                                        <p className="text-muted">
                                            Valid for {plan.days} days
                                        </p>

                                        <div className="subscription-feature-list">
                                            {features.map(
                                                (feature, index) => (
                                                    <Row
                                                        key={`${plan.key}-${index}`}
                                                        className="subscription-feature-row"
                                                    >
                                                        <Col xs="auto">
                                                            <FaCircleCheck
                                                                size={
                                                                    18
                                                                }
                                                                color="#49ac60"
                                                            />
                                                        </Col>

                                                        <Col>
                                                            <p className="m-0">
                                                                {
                                                                    feature
                                                                }
                                                            </p>
                                                        </Col>
                                                    </Row>
                                                )
                                            )}
                                        </div>

                                        <CustomButton
                                            label={`Choose ${plan.title}`}
                                            className="mt-auto mx-auto mb-2 col-11 fw-bold"
                                            onClick={() =>
                                                handleBuy(plan.key)
                                            }
                                            disabled={loading}
                                        />
                                    </Card.Body>
                                </Card>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        className="subscription-scroll-arrow subscription-scroll-arrow-right"
                        aria-label="Next plan"
                        onClick={() => scrollPlans('next')}
                    >
                        <MdChevronRight size={28} />
                    </button>
                </div>

                <p className="subscription-swipe-hint">
                    Swipe to compare plans
                </p>
            </section>

            {subscriptionOrder && (
                <Razorpay
                    action={ACTIONS.ORDERS}
                    name={`${user?.firstName || ''} ${
                        user?.lastName || ''
                    }`.trim()}
                    email={user?.email || ''}
                    phoneNumber={user?.phoneNumber || ''}
                    amount={subscriptionOrder.amount}
                    orderId={subscriptionOrder.orderId}
                    keyId={subscriptionOrder.key}
                    handleSuccess={handleSuccess}
                />
            )}

            <OMTModal
                show={showModal}
                title="Confirm Plan"
                size="md"
                description={
                    <div className="text-center">
                        <h5 className="my-2">
                            Confirm selected plan
                        </h5>

                        <p className="my-4">
                            Proceed with the selected plan to
                            activate your account.
                        </p>
                    </div>
                }
                handleSubmit={confirmPurchase}
                handleClose={() => {
                    setShowModal(false);
                    setSelectedPlan(null);
                }}
                submitText="Continue"
                closeText="Cancel"
            />
        </>
    );
}

export default Subscription;
