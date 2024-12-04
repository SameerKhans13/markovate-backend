// it is the questionRoutes.js file

import { generateAnswer } from "../services/geminiService.js";

import express from "express";

const router = express.Router();

// Route to add a new question and generate an answer
router.post('/ask', async (req, res) => {
    try {
        const { question_text } = req.body;


        // Insert the question
        // const questionResult = await pool.query(
        //     INSERT INTO questions (question_text) VALUES ($1) RETURNING id,
        //     [question_text]
        // );

        // const questionId = questionResult.rows[0].id;

        // Generate the answer
        const answerText = await generateAnswer(question_text);

        // Insert the answer
        // await pool.query(
        //     INSERT INTO answers (question_id, answer_text) VALUES ($1, $2),
        //     [questionId, answerText]
        // );

        res.json({
            answer: answerText
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to retrieve question and answers by question ID
router.get('/history/:questionId', async (req, res) => {
    try {
        const result = await db.query(
            `SELECT q.id, q.question_text, a.answer_text, a.generated_at
             FROM questions q
             LEFT JOIN answers a ON q.id = a.question_id
             WHERE q.id = $1
             ORDER BY a.generated_at DESC`,
            [req.params.questionId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;