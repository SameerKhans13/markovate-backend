// routes/index.js
import express from 'express';
import authRoutes from './authRoutes.js';
import teacherRoutes from './teacherRoutes.js';
import studentRoutes from './studentRoutes.js';
import testRoutes from './testRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import swaggerRoutes from './swagger.js';
import { authenticateUser } from '../middleware/auth.js';
import { requestLogger } from '../middleware/requestLogger.js';
import { apiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Middleware for all routes
router.use(requestLogger);
router.use(apiLimiter);

// Public routes
router.use('/auth', authRoutes);
router.use('/docs', swaggerRoutes);

// Protected routes
router.use('/teacher', authenticateUser, teacherRoutes);
router.use('/student', authenticateUser, studentRoutes);
router.use('/tests', authenticateUser, testRoutes);
router.use('/dashboard', authenticateUser, dashboardRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// 404 Handler
router.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource does not exist'
  });
});

// Error Handler
router.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    error: {
      status,
      message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    }
  });
});

export default router;