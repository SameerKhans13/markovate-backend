// models/Question.js
import pool from '../config/database.js';

class Question {
  static async create(testId, questionText, marks, keywords) {
    const query = `
      INSERT INTO questions 
      (test_id, question_text, marks, keywords)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [testId, questionText, marks, keywords]);
    return result.rows[0];
  }

  static async getByTestId(testId) {
    const query = `
      SELECT * FROM questions 
      WHERE test_id = $1 
      ORDER BY id ASC
    `;
    const result = await pool.query(query, [testId]);
    return result.rows;
  }

  static async getQuestionWithKeywords(questionId) {
    const query = `
      SELECT * FROM questions 
      WHERE id = $1
    `;
    const result = await pool.query(query, [questionId]);
    return result.rows[0];
  }
}

export default Question;