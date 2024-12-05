// routes/studentRoutes.js
import express from 'express';
import { 
    getAvailableTests,
    startTest,
    submitAnswer,
    submitTest,
    getTestResults,
    getStudentProfile
} from '../controllers/studentController.js';
import { validateAnswer } from '../middleware/validation.js';
import { authenticateUser } from '../middleware/auth.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = express.Router();

// Test Management Routes
router.get('/tests', authenticateUser, cacheMiddleware(300), getAvailableTests);
router.post('/test/start', authenticateUser, startTest);
router.post('/test/submit', authenticateUser, submitTest);

// Answer Management Routes
router.post('/answer', authenticateUser, validateAnswer, submitAnswer);
router.get('/test/:testId/results', authenticateUser, getTestResults);

// Profile Routes
router.get('/profile', authenticateUser, cacheMiddleware(600), getStudentProfile);

// Swagger Documentation
/**
 * @swagger
 * /api/student/tests:
 *   get:
 *     tags: [Student]
 *     summary: Get available tests for student
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available tests
 *       401:
 *         description: Unauthorized
 * 
 * /api/student/test/start:
 *   post:
 *     tags: [Student]
 *     summary: Start a test
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               testId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Test started successfully
 *       400:
 *         description: Invalid request or test already attempted
 * 
 * /api/student/answer:
 *   post:
 *     tags: [Student]
 *     summary: Submit answer for a question
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               testId:
 *                 type: string
 *               questionId:
 *                 type: string
 *               answerText:
 *                 type: string
 *     responses:
 *       200:
 *         description: Answer submitted successfully
 *       400:
 *         description: Invalid request
 * 
 * /api/student/test/{testId}/results:
 *   get:
 *     tags: [Student]
 *     summary: Get test results
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: testId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Test results retrieved successfully
 *       404:
 *         description: Test results not found
 */

// Error handler specific to student routes
router.use((err, req, res, next) => {
    if (err.type === 'test-submission') {
        return res.status(400).json({
            error: 'Test Submission Error',
            message: err.message
        });
    }
    next(err);
});

export default router;