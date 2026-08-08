import { readFileSync } from 'fs';
import path from 'path';
import Mustache from 'mustache';
import { transporter } from '../../config/email.js';
import env from '../../config/env.js';
import logger from '../../config/logger.js';
import { EMAIL_ACTIONS, CustomError } from '../utils/common.js';

const RESEND_REPLY_TO_FIELD = ['reply', 'to'].join('_');

const getEmailProvider = () => env.email.provider || (env.email.resendApiKey ? 'resend' : 'smtp');

const getSender = () => env.email.from || (env.email.user ? `"R&C Dine" <${env.email.user}>` : '');

const encodeAttachment = (attachment) => {
    const encodedAttachment = { filename: attachment.filename };

    if (attachment.path) {
        encodedAttachment.content = readFileSync(attachment.path).toString('base64');
        return encodedAttachment;
    }

    if (typeof attachment.content === 'string') {
        encodedAttachment.content =
            attachment.encoding === 'base64'
                ? attachment.content
                : Buffer.from(attachment.content, attachment.encoding || 'utf8').toString('base64');
        return encodedAttachment;
    }

    if (attachment.content !== undefined && attachment.content !== null) {
        encodedAttachment.content = Buffer.from(attachment.content).toString('base64');
    }

    return encodedAttachment;
};

const sendWithResend = async ({ to, subject, html, attachments }) => {
    if (!env.email.resendApiKey || !getSender()) {
        throw CustomError(
            500,
            'Email service is not configured. Add RESEND_API_KEY and EMAIL_FROM in Render environment variables.'
        );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.email.timeoutMs || 15000);

    const body = {
        from: getSender(),
        to: Array.isArray(to) ? to : [to],
        subject,
        html
    };

    if (env.email.replyTo) body[RESEND_REPLY_TO_FIELD] = env.email.replyTo;
    if (attachments.length) body.attachments = attachments.map(encodeAttachment);

    try {
        const response = await fetch(env.email.resendApiUrl || 'https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${env.email.resendApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
            signal: controller.signal
        });
        const responseText = await response.text();
        let result = {};

        try {
            result = responseText ? JSON.parse(responseText) : {};
        } catch {
            result = {};
        }

        if (!response.ok) {
            logger('error', `Resend API request failed (${response.status}): ${result.message || 'Unknown error'}`);

            if (response.status === 401 || response.status === 403) {
                throw CustomError(
                    500,
                    'Resend authentication or sender verification failed. Check RESEND_API_KEY and EMAIL_FROM.'
                );
            }

            if (response.status === 422) {
                throw CustomError(500, 'Resend rejected the email. Check EMAIL_FROM and the verified domain.');
            }

            if (response.status === 429 || response.status >= 500) {
                throw CustomError(503, 'Email service is busy. Please try again.');
            }

            throw CustomError(500, 'Unable to send email through Resend.');
        }

        return result;
    } finally {
        clearTimeout(timeout);
    }
};

const sendWithSmtp = async ({ to, subject, html, attachments }) => {
    if (!env.email.user || !env.email.pass) {
        throw CustomError(
            500,
            'SMTP email is not configured. Add EMAIL_USER and EMAIL_PASS or use EMAIL_PROVIDER=resend.'
        );
    }

    return transporter.sendMail({
        from: getSender(),
        to,
        subject,
        html,
        attachments
    });
};

const getEmailData = (action, payload) => {
    let template = '';
    let url = '';
    let filePath = '';
    switch (action) {
        case EMAIL_ACTIONS.VERIFY_USER:
            filePath = path.join(process.cwd(), `src/api/templates/verifyEmail.html`);
            template = readFileSync(filePath, 'utf8');
            url = `${env.app.appUrl}/verify?token=${encodeURIComponent(payload.token)}`;

            return {
                subject: 'Re: Email Verification',
                template: Mustache.render(template, { appUrl: url })
            };
        case EMAIL_ACTIONS.FORGOT_PASSWORD:
            filePath = path.join(process.cwd(), `src/api/templates/forgotPassword.html`);
            template = readFileSync(filePath, 'utf8');
            url = `${env.app.appUrl}/reset?token=${encodeURIComponent(payload.token)}`;

            return {
                subject: 'Re: Recover Password',
                template: Mustache.render(template, { appUrl: url })
            };
        case EMAIL_ACTIONS.INVITE_MANAGER:
            filePath = path.join(process.cwd(), `src/api/templates/inviteManager.html`);
            template = readFileSync(filePath, 'utf8');
            url = `${env.app.appUrl}/signup?token=${encodeURIComponent(payload.token)}`;

            return {
                subject: 'Re: Invite Manager',
                template: Mustache.render(template, {
                    appUrl: url,
                    ownerName: payload.name
                })
            };
        case EMAIL_ACTIONS.CUSTOM_SUBSCRIPTION:
            filePath = path.join(process.cwd(), `src/api/templates/customSubscription.html`);
            template = readFileSync(filePath, 'utf8');

            return {
                subject: 'Re: Custom Subscription Request',
                template: Mustache.render(template, { ...payload })
            };
        case EMAIL_ACTIONS.INVOICE_EMAIL:
            filePath = path.join(process.cwd(), `src/api/templates/invoiceEmail.html`);
            template = readFileSync(filePath, 'utf8');

            return {
                subject: 'Re: Customer Invoice',
                template: Mustache.render(template, { ...payload })
            };
        default:
            break;
    }
};

export const sendEmail = async (payload, to, action, attachments = []) => {
    try {
        const data = getEmailData(action, payload);

        if (!data) {
            throw CustomError(500, 'Unable to prepare email template.');
        }

        logger('info', `Sending email to: ${to}`);

        const options = { to, subject: data.subject, html: data.template, attachments };
        const result =
            getEmailProvider() === 'resend' ? await sendWithResend(options) : await sendWithSmtp(options);

        logger('info', `Email sent successfully to: ${to}`);

        return result;
    } catch (error) {
        logger('error', `Email sending failed: ${error.message}`);

        if (error.code === 'EAUTH' || error.responseCode === 535) {
            throw CustomError(500, 'Gmail authentication failed. Check EMAIL_USER and Google App Password.');
        }

        if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKET' || error.code === 'ECONNECTION') {
            throw CustomError(503, 'Email server is not responding. Please try again.');
        }

        if (error.name === 'AbortError') {
            throw CustomError(503, 'Email service timed out. Please try again.');
        }

        throw CustomError(
            error.code && Number.isInteger(error.code) ? error.code : 500,
            error.message || 'Unable to send recovery email.'
        );
    }
};
