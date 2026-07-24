import http from 'http';
import initDb from './config/database.js';
import env from './config/env.js';
import app from './config/express.js';
import logger from './config/logger.js';
import { initNotifications } from './config/notification.js';
import { initializeSocket } from './config/socket.js';

const startServer = async () => {
    try {
        logger('info', 'Starting R&C Dine server...');
        logger('info', 'Establishing database connection...');
        await initDb();
        await initNotifications();

        const port = process.env.PORT || env.app.port;
        const httpServer = http.createServer(app);
        initializeSocket(httpServer);

        httpServer.listen(port, '0.0.0.0', () => {
            logger('info', `R&C Dine server started on port ${port}`);
            logger('info', `Socket.IO server started on port ${port}`);
        });

        httpServer.on('error', (error) => logger('error', `Error starting server: ${error.message}`));
        return httpServer;
    } catch (error) {
        logger('error', `Error starting server: ${error.message}`);
        process.exit(1);
    }
};

startServer();

process.on('uncaughtException', (error) => {
    logger('error', `Uncaught Exception: ${error.message}`);
    process.exit(1);
});

process.on('unhandledRejection', (error) => logger('error', `Unhandled Rejection: ${error}`));
