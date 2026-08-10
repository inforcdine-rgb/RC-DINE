import moment from 'moment';
import { format, createLogger, addColors, transports } from 'winston';

const { combine, colorize, simple } = format;
const { Console } = transports;

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'cyan'
};

addColors(colors);

const log = createLogger({
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
    format: combine(colorize({ all: true }), simple()),
    transports: [new Console()]
});

const sensitiveKey = /(password|secret|token|authorization|cookie|otp|recovery|p256dh|\bauth\b|bank|account(number)?|ifsc|email|phone|mobile|gst)/i;

const maskText = (value) =>
    String(value)
        .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[REDACTED_EMAIL]')
        .replace(/\b(?:\+?91[-\s]?)?[6-9]\d{9}\b/g, '[REDACTED_PHONE]')
        .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, '[REDACTED_TOKEN]')
        .replace(/(bearer\s+)[^\s"']+/gi, '$1[REDACTED_TOKEN]');

const redact = (value, seen = new WeakSet()) => {
    if (value === null || value === undefined) return value;
    if (value instanceof Error) return { name: value.name, message: maskText(value.message), code: value.code };
    if (Array.isArray(value)) return value.map((item) => redact(item, seen));
    if (typeof value === 'string') return maskText(value);
    if (typeof value !== 'object') return value;
    if (seen.has(value)) return '[Circular]';
    seen.add(value);

    return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, sensitiveKey.test(key) ? '[REDACTED]' : redact(item, seen)])
    );
};

export const logger = (level, message, payload) => {
    if (!Object.keys(colors).includes(level)) {
        throw new Error('Incorrect value of level');
    }
    log[level](`${moment().toISOString()} - ${JSON.stringify(redact(message))}`);
    if (payload) {
        log[level](JSON.stringify(redact(payload)));
    }
};

export default logger;
