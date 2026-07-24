import path from 'path';
import { fileURLToPath } from 'url';
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

// CORS fix - production URL allow karo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

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

// Rate limiting - login attack se bachao
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: env.app.isDevelopment ? 1000 : 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'To many attempts. please try again few minutes.' }
});
app.use('/api', generalLimiter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
