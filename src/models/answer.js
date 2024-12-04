// it is the answer.js file

import pool from '../config/database.js';

class Answer {
  // Add a student's answer to a test
  static async addAnswer(student_id, test_id, question_id, answer_text) {
    try {
      const query = 'INSERT INTO answers (student_id, test_id, question_id, answer_text) VALUES ($1, $2, $3, $4) RETURNING *';
      const result = await pool.query(query, [student_id, test_id, question_id, answer_text]);
      return result.rows[0];
    } catch (err) {
      throw new Error('Failed to add answer: ' + err.message);
    }
  }
}

export default Answer;