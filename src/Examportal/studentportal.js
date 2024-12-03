import express from 'express';

const router = express.Router();

router.post('/submit-answer', async (req, res) => {
    try {
        const { student_id, question_no, answer } = req.body;

        if (!student_id || !question_no || answer === undefined) {
            return res.status(400).json({
                error: 'Missing required fields',
                details: 'student_id, question_no, and answer are required'
            });
        }

        // Placeholder for answer storage logic
        const storedAnswer = { student_id, question_no, answer };

        res.status(201).json({
            message: 'Answer submitted successfully',
            data: storedAnswer
        });
    } catch (error) {
        console.error('Error in submit-answer route:', error);
        res.status(500).json({
            error: 'Failed to submit answer',
            details: error.message
        });
    }
});

export default router;