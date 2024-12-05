// server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { initDB } from './config/database.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import logger from './utils/logger.js';
import swaggerRoutes from './routes/swagger.js';

dotenv.config();

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(compression());

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging and Rate Limiting
app.use(requestLogger);
app.use(rateLimiter);

// Response Time Header
app.use((req, res, next) => {
    res.startTime = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - res.startTime;
        res.set('X-Response-Time', `${duration}ms`);
    });
    next();
});

// Routes
app.use('/api/docs', swaggerRoutes);
app.use('/api', routes);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Error Handler
app.use(errorHandler);

// Handle 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: {
            message: 'Route not found',
            code: 'NOT_FOUND'
        }
    });
});

// Initialize Server
const PORT = process.env.PORT || 8787;

const startServer = async () => {
    try {
        // Initialize Database
        await initDB();
        logger.info('Database initialized successfully');

        // Start Server
        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
        });

    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle Uncaught Exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

// Handle Unhandled Promise Rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Handle Graceful Shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Starting graceful shutdown...');
    
    // Close server and database connections
    server.close(() => {
        logger.info('Server closed. Exiting process...');
        process.exit(0);
    });
});

startServer();