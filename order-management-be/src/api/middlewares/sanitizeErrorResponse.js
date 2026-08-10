import env from '../../config/env.js';

const sanitizeErrorResponse = (_req, res, next) => {
    if (env.app.env !== 'production') return next();

    const originalSend = res.send.bind(res);
    const originalJson = res.json.bind(res);
    let sanitizing = false;

    res.json = (body) => {
        if (res.statusCode < 500 || sanitizing) return originalJson(body);
        sanitizing = true;
        try {
            return originalJson({ message: 'Internal server error' });
        } finally {
            sanitizing = false;
        }
    };

    res.send = (body) => {
        if (res.statusCode < 500 || sanitizing) return originalSend(body);

        const contentType = String(res.getHeader('Content-Type') || '');
        sanitizing = true;
        try {
            if (typeof body === 'object' || contentType.includes('application/json')) {
                return originalJson({ message: 'Internal server error' });
            }
            return originalSend('Internal server error');
        } finally {
            sanitizing = false;
        }
    };

    return next();
};

export default sanitizeErrorResponse;
