import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Loader from '../../components/Loader';
import * as legalPageService from '../../services/legalPage.service';
import { setPageSeo } from '../../utils/seo';
import './style.css';

const STATIC_PAGES = {
    'refund-policy': {
        title: 'Cancellation & Refund Policy',
        lastUpdatedAt: '2026-08-01T00:00:00.000Z',
        metaTitle: 'Cancellation & Refund Policy | RC Dine',
        metaDescription: 'Read the cancellation and refund policy for RC Dine subscriptions.',
        content: `This Cancellation & Refund Policy applies to prepaid RC Dine subscriptions purchased through our website.

Subscription cancellation
RC Dine plans provide access for the duration shown at checkout. Cancelling a plan does not automatically create a refund. Access normally continues until the current paid period ends unless RC Dine confirms otherwise.

Refund eligibility
RC Dine is a digital software service made available after successful payment. Subscription fees are generally non-refundable after access is activated. We will review refund requests for duplicate captured payments, a captured payment that did not activate the purchased plan, or another verified technical error attributable to RC Dine.

Requesting a refund
Submit a request through the Contact page within 7 days of the payment. Include the account email, plan, payment date and Razorpay payment ID. Never share a UPI PIN, OTP or card security code.

Failed or pending payments
If a payment is marked failed or is not captured, the bank or payment provider normally reverses any debit automatically. RC Dine cannot issue a merchant refund until a payment is confirmed as captured.

Refund processing
Approved refunds are sent to the original payment method. Bank or payment-network processing may take 5–7 business days after the refund is initiated.

Contact
For cancellation, payment or refund help, use the RC Dine Contact page.`
    },
    'shipping-policy': {
        title: 'Shipping & Service Delivery Policy',
        lastUpdatedAt: '2026-08-01T00:00:00.000Z',
        metaTitle: 'Shipping & Service Delivery Policy | RC Dine',
        metaDescription: 'Learn how RC Dine delivers its digital restaurant-management service.',
        content: `RC Dine is a digital restaurant-management software service. We do not sell or ship physical goods.

Delivery method
Subscription access is delivered electronically to the RC Dine account used to purchase the plan. No courier, postal delivery, shipping address or tracking number is required.

Activation timing
Access is normally activated immediately after Razorpay confirms a successful captured payment. If payment confirmation is delayed, activation is completed after the transaction is reconciled, normally within one business day of confirmed capture.

Shipping charges
There are no physical shipping or delivery charges for RC Dine subscriptions.

Access requirements
Users need a compatible web browser, internet connection and valid RC Dine account credentials to use the service.

Delayed delivery
If a captured payment does not activate the selected plan, do not pay again. Use the Contact page and provide the account email, plan, payment date and Razorpay payment ID so the transaction can be verified.

Contact
For service-delivery questions or account-access assistance, use the RC Dine Contact page.`
    }
};

const SLUG_BY_PATH = {
    '/privacy': 'privacy',
    '/terms': 'terms',
    '/refund-policy': 'refund-policy',
    '/shipping-policy': 'shipping-policy'
};

const formatDate = (value) => {
    if (!value) return '';
    return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(value));
};

export default function LegalPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const slug = SLUG_BY_PATH[location.pathname] || 'privacy';
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadPage = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const staticPage = STATIC_PAGES[slug];
            setPage(staticPage || (await legalPageService.getPublic(slug)));
        } catch (requestError) {
            setError(requestError?.message || 'Unable to load this page.');
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        loadPage();
    }, [loadPage]);

    useEffect(() => {
        if (!page) return;
        setPageSeo({
            title: page.metaTitle || `${page.title} – RC Dine`,
            description: page.metaDescription || `Read the RC Dine ${page.title}.`
        });
    }, [page]);

    if (loading) return <Loader />;

    return (
        <div className="legal-public-page">
            <header className="legal-public-header">
                <button type="button" onClick={() => navigate('/')}>
                    ← RC Dine
                </button>
            </header>
            <main className="legal-public-card">
                {error ? (
                    <div className="legal-public-error">
                        <h1>Page unavailable</h1>
                        <p>{error}</p>
                        <div className="legal-public-actions">
                            <button type="button" onClick={loadPage}>
                                Retry
                            </button>
                            <button type="button" onClick={() => navigate('/')}>
                                Return Home
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <span className="legal-public-tag">RC DINE LEGAL</span>
                        <h1>{page?.title}</h1>
                        <p className="legal-public-updated">Last updated: {formatDate(page?.lastUpdatedAt)}</p>
                        <div className="legal-public-content">{page?.content}</div>
                    </>
                )}
            </main>
        </div>
    );
}

