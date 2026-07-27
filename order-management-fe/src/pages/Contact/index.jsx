import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import * as contactService from '../../services/contactEnquiry.service';
import './style.css';

const initialForm = {
    name: '',
    mobile: '',
    email: '',
    restaurantName: '',
    message: ''
};

export default function Contact() {
    const [form, setForm] = useState(initialForm);
    const [submitting, setSubmitting] = useState(false);

    const change = (event) => {
        setForm((current) => ({
            ...current,
            [event.target.name]: event.target.value
        }));
    };

    const submit = async (event) => {
        event.preventDefault();
        setSubmitting(true);

        try {
            const result = await contactService.createEnquiry(form);
            toast.success(result.message || 'Enquiry sent successfully');
            setForm(initialForm);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="contact-page">
            <header className="contact-header">
                <Link className="contact-brand" to="/">
                    <span>R</span> RC DINE
                </Link>
                <Link className="contact-back" to="/">
                    ← Back to home
                </Link>
            </header>

            <main className="contact-shell">
                <section className="contact-copy">
                    <span className="contact-tag">LET&apos;S TALK</span>
                    <h1>Build a smarter restaurant with RC Dine.</h1>
                    <p>
                        Tell us about your restaurant, cafe or food business. Our team will help you understand setup,
                        pricing and the best plan.
                    </p>

                    <div className="contact-points">
                        <article>
                            <strong>Fast response</strong>
                            <small>We normally contact new enquiries within one business day.</small>
                        </article>
                        <article>
                            <strong>Personal guidance</strong>
                            <small>Get help with QR ordering, manager POS, billing and subscriptions.</small>
                        </article>
                        <article>
                            <strong>No obligation</strong>
                            <small>Ask questions and explore RC Dine before selecting a plan.</small>
                        </article>
                    </div>
                </section>

                <form className="contact-form" onSubmit={submit}>
                    <h2>Contact RC Dine</h2>

                    <label>
                        Full name
                        <input name="name" value={form.name} onChange={change} minLength="2" maxLength="100" required />
                    </label>

                    <label>
                        Mobile number
                        <input
                            name="mobile"
                            value={form.mobile}
                            onChange={change}
                            inputMode="tel"
                            maxLength="20"
                            required
                        />
                    </label>

                    <label>
                        Email address <small>(optional)</small>
                        <input name="email" value={form.email} onChange={change} type="email" maxLength="160" />
                    </label>

                    <label>
                        Restaurant name <small>(optional)</small>
                        <input name="restaurantName" value={form.restaurantName} onChange={change} maxLength="160" />
                    </label>

                    <label>
                        How can we help?
                        <textarea
                            name="message"
                            value={form.message}
                            onChange={change}
                            minLength="10"
                            maxLength="3000"
                            rows="5"
                            required
                        />
                    </label>

                    <button type="submit" disabled={submitting}>
                        {submitting ? 'Sending...' : 'Send Enquiry →'}
                    </button>

                    <p className="contact-consent">
                        By submitting, you agree that RC Dine may contact you regarding this enquiry.
                    </p>
                </form>
            </main>
        </div>
    );
}
