// models/Answer.js
import pool from '../config/database.js';

class Answer {
  static async submitAnswer(studentId, testId, questionId, answerText) {
    const query = `
      INSERT INTO student_answers 
      (student_id, test_id, question_id, answer_text)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [studentId, testId, questionId, answerText]);
    return result.rows[0];
  }

  static async evaluateAnswer(answerId, marksObtained, feedback, keywordsMatched) {
    const query = `
      UPDATE student_answers
      SET marks_obtained = $2,
          feedback = $3,
          keywords_matched = $4
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [answerId, marksObtained, feedback, keywordsMatched]);
    return result.rows[0];
  }

  static async getStudentAnswers(studentId, testId) {
    const query = `
      SELECT sa.*, q.question_text, q.marks as total_marks
      FROM student_answers sa
      JOIN questions q ON sa.question_id = q.id
      WHERE sa.student_id = $1 AND sa.test_id = $2
    `;
    const result = await pool.query(query, [studentId, testId]);
    return result.rows;
  }
}

export default Answer;