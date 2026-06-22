import initDb from './config/database.js';
import env from './config/env.js';
import app from './config/express.js';
import logger from './config/logger.js';

const startServer = async () => {
    try {
        logger('info', 'Starting R&C Dine server...');

        logger('info', 'Establishing database connection...');
        await initDb();

        const port = process.env.PORT || env.app.port;
        app.listen(port, () => {
            logger('info', `R&C Dine server started on port ${port}`);
        });

        app.on('error', (error) => {
            logger('error', `Error starting server: ${error}`);
        });

        return app;
    } catch (error) {
        logger('error', `Error starting server: ${error}`);
    }
};

startServer();

// Server crash handlers
process.on('uncaughtException', (error) => {
    logger('error', `Uncaught Exception: ${error}`);
    process.exit(1);
});

process.on('unhandledRejection', (error) => {
    logger('error', `Unhandled Rejection: ${error}`);
});