// models/Test.js
import pool from '../config/database.js';
import { executeTransaction } from '../utils/dbUtils.js';
import logger from '../config/winston.js';

class Test {
  static async create({ testId, teacherId, title, duration, totalMarks, description }) {
    const query = `
      INSERT INTO tests (test_id, teacher_id, title, duration, total_marks, description)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [testId, teacherId, title, duration, totalMarks, description];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getById(testId) {
    const query = `
      SELECT t.*, 
             json_agg(DISTINCT q.*) as questions,
             json_agg(DISTINCT ts.*) as submissions
      FROM tests t
      LEFT JOIN questions q ON t.id = q.test_id
      LEFT JOIN test_submissions ts ON t.id = ts.test_id
      WHERE t.id = $1
      GROUP BY t.id
    `;
    const result = await pool.query(query, [testId]);
    return result.rows[0];
  }

  static async update(testId, updates) {
    const allowedUpdates = ['title', 'duration', 'total_marks', 'description', 'status'];
    const updateFields = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .map((key, index) => `${key} = $${index + 2}`);

    if (updateFields.length === 0) return null;

    const query = `
      UPDATE tests 
      SET ${updateFields.join(', ')},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const values = [testId, ...Object.values(updates)];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async publish(testId) {
    return executeTransaction(async (client) => {
      // Verify test has questions
      const questionsCheck = await client.query(
        'SELECT COUNT(*) FROM questions WHERE test_id = $1',
        [testId]
      );

      if (questionsCheck.rows[0].count === '0') {
        throw new Error('Cannot publish test without questions');
      }

      // Update test status
      const query = `
        UPDATE tests 
        SET status = 'published',
            is_active = true,
            published_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      const result = await client.query(query, [testId]);
      return result.rows[0];
    });
  }

  static async getAvailableForStudent(studentId) {
    const query = `
      SELECT t.*,
             COUNT(q.*) as question_count,
             COALESCE(ts.status, 'not_started') as student_status
      FROM tests t
      LEFT JOIN questions q ON t.id = q.test_id
      LEFT JOIN test_submissions ts ON t.id = ts.test_id AND ts.student_id = $1
      WHERE t.is_active = true
      AND (ts.id IS NULL OR ts.status != 'completed')
      GROUP BY t.id, ts.status
      ORDER BY t.created_at DESC
    `;
    const result = await pool.query(query, [studentId]);
    return result.rows;
  }

  static async getTeacherStats(teacherId) {
    const query = `
      SELECT 
        COUNT(DISTINCT t.id) as total_tests,
        COUNT(DISTINCT q.id) as total_questions,
        COUNT(DISTINCT ts.student_id) as total_students,
        ROUND(AVG(ts.total_marks), 2) as average_score
      FROM tests t
      LEFT JOIN questions q ON t.id = q.test_id
      LEFT JOIN test_submissions ts ON t.id = ts.test_id
      WHERE t.teacher_id = $1
    `;
    const result = await pool.query(query, [teacherId]);
    return result.rows[0];
  }

  static async getRecentTests(teacherId, limit = 5) {
    const query = `
      SELECT t.*,
             COUNT(DISTINCT ts.student_id) as submission_count,
             ROUND(AVG(ts.total_marks), 2) as average_score
      FROM tests t
      LEFT JOIN test_submissions ts ON t.id = ts.test_id
      WHERE t.teacher_id = $1
      GROUP BY t.id
      ORDER BY t.created_at DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [teacherId, limit]);
    return result.rows;
  }

  static async updateTotalMarks(testId) {
    const query = `
      UPDATE tests t
      SET total_marks = (
        SELECT SUM(marks)
        FROM questions
        WHERE test_id = $1
      )
      WHERE id = $1
      RETURNING total_marks
    `;
    const result = await pool.query(query, [testId]);
    return result.rows[0];
  }

  static async getQuestions(testId) {
    const query = `
      SELECT *
      FROM questions
      WHERE test_id = $1
      ORDER BY id ASC
    `;
    const result = await pool.query(query, [testId]);
    return result.rows;
  }

  static async delete(testId, teacherId) {
    return executeTransaction(async (client) => {
      // Verify ownership and status
      const test = await client.query(
        'SELECT * FROM tests WHERE id = $1 AND teacher_id = $2',
        [testId, teacherId]
      );

      if (!test.rows[0]) {
        throw new Error('Test not found or unauthorized');
      }

      if (test.rows[0].status === 'published') {
        throw new Error('Cannot delete published test');
      }

      // Delete associated records
      await client.query('DELETE FROM questions WHERE test_id = $1', [testId]);
      await client.query('DELETE FROM tests WHERE id = $1', [testId]);

      return { message: 'Test deleted successfully' };
    });
  }
}

export default Test;