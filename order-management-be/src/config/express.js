import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from '../../swagger.js';
import routes from '../api/routes/index.js';
import logger from './logger.js';

const app = express();

app.use(express.json());

// CORS fix - production URL allow karo
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

const corsOptions = {
    origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
};
app.use(cors(corsOptions));

// Rate limiting - login attack se bachao
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: 'Bahut zyada requests — 15 min baad try karo' }
});
app.use('/api', limiter);

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