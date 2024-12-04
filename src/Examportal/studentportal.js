// it is the studentportal.js file 

import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

// Submit student answer
router.post('/submit-answer', async (req, res) => {
  try {
    const { student_id, test_id, question_id, question_number, student_answer, keywords } = req.body;

    // Validate input
    if (!student_id || !test_id || !question_id || !question_number || student_answer === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        details: 'student_id, test_id, question_id, question_number, and student_answer are required' 
      });
    }

    // Get a connection from the pool
    const connection = await pool.getConnection();

    try {
      // Retrieve the question text and correct keywords
      const [questions] = await connection.query(
        'SELECT question_text, correct_keywords FROM questions WHERE id = ?', 
        [question_id]
      );

      if (questions.length === 0) {
        connection.release();
        return res.status(404).json({ error: 'Question not found' });
      }

      const question = questions[0];

      // Basic keyword matching to determine correctness
      const correctKeywords = question.correct_keywords.split(',');
      const studentKeywords = student_answer.toLowerCase().split(/\s+/);
      const matchedKeywords = studentKeywords.filter(keyword => 
        correctKeywords.includes(keyword.toLowerCase())
      );
      const isCorrect = matchedKeywords.length / correctKeywords.length >= 0.6;

      // Insert or update student test answer
      await connection.query(
        'INSERT INTO student_answers (student_id, test_id, question_id, question_number, student_answer) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (student_id, test_id, question_id) DO UPDATE SET student_answer = $5, is_correct = $6', 
        [
          student_id,
          test_id,
          question_id,
          question_number,
          student_answer,
          isCorrect
        ]
      );

      connection.release();

      res.status(201).json({ 
        message: 'Answer submitted successfully', 
        data: { 
          student_id,
          test_id, 
          student_answer,  
        } 
      });

    } catch (dbError) {
      connection.release();
      console.error('Database error:', dbError);
      res.status(500).json({ error: 'Failed to submit answer', details: dbError.message });
    }
  } catch (error) {
    console.error('Error in submit-answer route:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Get student test results
router.get('/test-results/:student_id/:test_id', async (req, res) => {
  try {
    const { student_id, test_id } = req.params;
    
    const connection = await pool.getConnection();

    try {
      const [results] = await connection.query(
        `SELECT 
          question_number, 
          question_text, 
          student_answer, 
          marks,
          issues
        FROM student_test 
        WHERE student_id = ? AND test_id = ?
        ORDER BY question_number`,
        [student_id, test_id]
      );

      connection.release();

      const totalQuestions = results.length;
      const correctAnswers = results.filter(result => result.is_correct).length;
      const score = (correctAnswers / totalQuestions) * 100;

      res.status(200).json({
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        score: score.toFixed(2),
        details: results
      });
    } catch (dbError) {
      connection.release();
      console.error('Database error:', dbError);
      res.status(500).json({ error: 'Failed to retrieve test results', details: dbError.message });
    }
  } catch (error) {
    console.error('Error in test-results route:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

export default router;