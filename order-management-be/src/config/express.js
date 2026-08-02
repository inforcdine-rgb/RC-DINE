import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from '../../swagger.js';
import routes from '../api/routes/index.js';
import env from './env.js';
import logger from './logger.js';

const app = express();

app.use(helmet());
app.use(express.json({ limit: '1mb' }));

const corsOptions = {
    origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (env.app.isDevelopment && ['http://localhost:3000', 'http://127.0.0.1:3000'].includes(origin)) {
            return callback(null, true);
        }
        if (env.cors.origins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
};
app.use(cors(corsOptions));

// Render/Nginx proxy ke piche correct client IP detect karne ke liye
app.set('trust proxy', 1);

// General API rate limit
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,

    // Manager POS ek screen par multiple APIs use karta hai,
    // isliye 300 requests bahut kam the.
    max: env.app.isDevelopment ? 5000 : 3000,

    standardHeaders: true,
    legacyHeaders: false,

    // Health check aur basic server route ko block mat karo
    skip: (req) => req.method === 'OPTIONS' || req.path === '/health',

    message: {
        message: 'Too many requests. Please try again after a few minutes.'
    }
});

app.use('/api', generalLimiter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/api/health', (_req, res) => {
    return res.status(200).json({
        success: true,
        status: 'OK',
        service: 'RC Dine Backend',
        timestamp: new Date().toISOString()
    });
});

app.get('/', (_req, res) => {
    res.send('Welcome to R&C Dine Restaurant Management System!');
});

app.use('/api', routes);

// Global error handler - server crash nahi hoga
app.use((err, req, res, next) => {
    logger('error', `Global Error: ${err.message}`);
    res.status(err.code || 500).json({
        message: err.message || 'Kuch galat hua, dobara try karo'
    });
});

export default app;
