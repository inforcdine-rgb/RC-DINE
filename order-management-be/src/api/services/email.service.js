import { readFileSync } from 'fs';
import path from 'path';
import Mustache from 'mustache';
import { transporter } from '../../config/email.js';
import env from '../../config/env.js';
import logger from '../../config/logger.js';
import { EMAIL_ACTIONS, CustomError } from '../utils/common.js';

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
        if (!env.email.user || !env.email.pass) {
            throw CustomError(
                500,
                'Email service is not configured. Add EMAIL_USER and EMAIL_PASS in backend .env file.'
            );
        }

        const data = getEmailData(action, payload);

        if (!data) {
            throw CustomError(500, 'Unable to prepare email template.');
        }

        const options = {
            from: `"R&C Dine" <${env.email.user}>`,
            to,
            subject: data.subject,
            html: data.template,
            attachments
        };

        logger('info', `Sending email to: ${to}`);

        const result = await transporter.sendMail(options);

        logger('info', `Email sent successfully to: ${to}`);

        return result;
    } catch (error) {
        logger('error', `Email sending failed: ${error.message}`);

        if (
            error.code === 'EAUTH' ||
            error.responseCode === 535
        ) {
            throw CustomError(
                500,
                'Gmail authentication failed. Check EMAIL_USER and Google App Password.'
            );
        }

        if (
            error.code === 'ETIMEDOUT' ||
            error.code === 'ESOCKET' ||
            error.code === 'ECONNECTION'
        ) {
            throw CustomError(
                503,
                'Email server is not responding. Please try again.'
            );
        }

        throw CustomError(
            error.code && Number.isInteger(error.code) ? error.code : 500,
            error.message || 'Unable to send recovery email.'
        );
    }
};
