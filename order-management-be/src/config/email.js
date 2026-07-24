import nodemailer from 'nodemailer';
import env from './env.js';

export const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,

    auth: {
        user: env.email.user,
        pass: env.email.pass
    },

    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,

    tls: {
        rejectUnauthorized: false
    }
});
