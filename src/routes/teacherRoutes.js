// routes/teacherRoutes.js
import express from 'express';
import { 
    createTest,
    addQuestion,
    publishTest,
    getTestSubmissions,
    evaluateAnswer,
    getTestAnalytics,
    updateTest,
    getDashboardStats
} from '../controllers/teacherController.js';
import { authenticateUser } from '../middleware/auth.js';
import { validateTest, validateQuestion } from '../middleware/validation.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = express.Router();

// Test Management Routes
router.post('/test/create', authenticateUser, validateTest, createTest);
router.post('/test/question', authenticateUser, validateQuestion, addQuestion);
router.put('/test/:testId', authenticateUser, validateTest, updateTest);
router.post('/test/:testId/publish', authenticateUser, publishTest);

// Evaluation Routes
router.get('/test/:testId/submissions', authenticateUser, getTestSubmissions);
router.post('/answer/:answerId/evaluate', authenticateUser, evaluateAnswer);

// Analytics Routes
router.get('/test/:testId/analytics', authenticateUser, cacheMiddleware(300), getTestAnalytics);
router.get('/dashboard/stats', authenticateUser, cacheMiddleware(300), getDashboardStats);

// Swagger Documentation
/**
 * @swagger
 * /api/teacher/test/create:
 *   post:
 *     tags: [Teacher]
 *     summary: Create a new test
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               duration:
 *                 type: integer
 *               totalMarks:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Test created successfully
 *       400:
 *         description: Invalid request
 * 
 * /api/teacher/test/question:
 *   post:
 *     tags: [Teacher]
 *     summary: Add question to test
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
 *               questionText:
 *                 type: string
 *               marks:
 *                 type: integer
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Question added successfully
 *       400:
 *         description: Invalid request
 * 
 * /api/teacher/test/{testId}/publish:
 *   post:
 *     tags: [Teacher]
 *     summary: Publish a test
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
 *         description: Test published successfully
 *       400:
 *         description: Invalid request or test cannot be published
 * 
 * /api/teacher/test/{testId}/analytics:
 *   get:
 *     tags: [Teacher]
 *     summary: Get test analytics
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
 *         description: Test analytics retrieved successfully
 *       404:
 *         description: Test not found
 */

// Error handler specific to teacher routes
router.use((err, req, res, next) => {
    if (err.type === 'test-management') {
        return res.status(400).json({
            error: 'Test Management Error',
            message: err.message
        });
    }
    next(err);
});

export default router;