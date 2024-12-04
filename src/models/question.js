// it is the question.js file

import pool from '../config/database.js';

class Question {
  // Add a new question for a test
  static async addQuestion(test_id, question_text, marks, keywords) {
    try {
      const query = 'INSERT INTO questions (test_id, question_text, marks, keywords) VALUES ($1, $2, $3, $4) RETURNING *';
      const result = await pool.query(query, [test_id, question_text, marks, keywords]);
      return result.rows[0];
    } catch (err) {
      throw new Error('Failed to add question: ' + err.message);
    }
  }

  // Get questions by test ID
  static async getQuestionsByTestId(test_id) {
    try {
      const query = 'SELECT * FROM questions WHERE test_id = $1';
      const result = await pool.query(query, [test_id]);
      return result.rows;
    } catch (err) {
      throw new Error('Failed to get questions: ' + err.message);
    }
  }
}

export default Question;