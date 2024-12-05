// models/TestSubmission.js
import pool from '../config/database.js';
import { executeTransaction } from '../utils/dbUtils.js';
import logger from '../config/winston.js';

class TestSubmission {
  static async create(studentId, testId) {
    const query = `
      INSERT INTO test_submissions 
        (student_id, test_id, status, start_time)
      VALUES ($1, $2, 'in_progress', CURRENT_TIMESTAMP)
      RETURNING *
    `;
    const result = await pool.query(query, [studentId, testId]);
    return result.rows[0];
  }

  static async complete(studentId, testId, totalMarks) {
    const query = `
      UPDATE test_submissions
      SET status = 'completed',
          total_marks = $3,
          end_time = CURRENT_TIMESTAMP,
          submitted_at = CURRENT_TIMESTAMP
      WHERE student_id = $1 
        AND test_id = $2 
        AND status = 'in_progress'
      RETURNING *
    `;
    const result = await pool.query(query, [studentId, testId, totalMarks]);
    return result.rows[0];
  }

  static async getByStudentAndTest(studentId, testId) {
    const query = `
      SELECT ts.*, 
             t.duration,
             t.total_marks as max_marks,
             EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - ts.start_time))/60 as elapsed_time
      FROM test_submissions ts
      JOIN tests t ON ts.test_id = t.id
      WHERE ts.student_id = $1 
        AND ts.test_id = $2
    `;
    const result = await pool.query(query, [studentId, testId]);
    return result.rows[0];
  }

  static async getTestStats(testId) {
    const query = `
      SELECT 
        COUNT(DISTINCT student_id) as total_submissions,
        ROUND(AVG(total_marks), 2) as average_score,
        MAX(total_marks) as highest_score,
        MIN(total_marks) as lowest_score,
        ROUND(
          COUNT(CASE WHEN total_marks >= (SELECT total_marks * 0.4 FROM tests WHERE id = $1) THEN 1 END)::float / 
          COUNT(*)::float * 100, 
          2
        ) as pass_percentage
      FROM test_submissions
      WHERE test_id = $1 
        AND status = 'completed'
    `;
    const result = await pool.query(query, [testId]);
    return result.rows[0];
  }

  static async getSubmissionDetails(submissionId) {
    const query = `
      SELECT ts.*,
             t.title as test_title,
             t.total_marks as max_marks,
             s.name as student_name,
             s.email as student_email,
             json_agg(
               json_build_object(
                 'question_id', sa.question_id,
                 'question_text', q.question_text,
                 'answer_text', sa.answer_text,
                 'marks_obtained', sa.marks_obtained,
                 'feedback', sa.feedback
               )
             ) as answers
      FROM test_submissions ts
      JOIN tests t ON ts.test_id = t.id
      JOIN students s ON ts.student_id = s.id
      LEFT JOIN student_answers sa ON ts.test_id = sa.test_id 
        AND ts.student_id = sa.student_id
      LEFT JOIN questions q ON sa.question_id = q.id
      WHERE ts.id = $1
      GROUP BY ts.id, t.title, t.total_marks, s.name, s.email
    `;
    const result = await pool.query(query, [submissionId]);
    return result.rows[0];
  }

  static async getTimeRemaining(submissionId) {
    const query = `
      SELECT 
        t.duration * 60 - EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - ts.start_time)) as remaining_seconds
      FROM test_submissions ts
      JOIN tests t ON ts.test_id = t.id
      WHERE ts.id = $1
        AND ts.status = 'in_progress'
    `;
    const result = await pool.query(query, [submissionId]);
    return result.rows[0]?.remaining_seconds || 0;
  }

  static async autoSubmitExpiredTests() {
    return executeTransaction(async (client) => {
      // Find expired tests
      const expiredQuery = `
        SELECT ts.id, ts.student_id, ts.test_id
        FROM test_submissions ts
        JOIN tests t ON ts.test_id = t.id
        WHERE ts.status = 'in_progress'
        AND EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - ts.start_time))/60 > t.duration
      `;
      const expired = await client.query(expiredQuery);

      // Auto-submit each expired test
      for (const submission of expired.rows) {
        await client.query(`
          UPDATE test_submissions
          SET status = 'completed',
              end_time = start_time + (interval '1 minute' * 
                (SELECT duration FROM tests WHERE id = $1)),
              submitted_at = CURRENT_TIMESTAMP,
              auto_submitted = true
          WHERE id = $2
        `, [submission.test_id, submission.id]);

        logger.info('Auto-submitted expired test', {
          submissionId: submission.id,
          studentId: submission.student_id,
          testId: submission.test_id
        });
      }

      return expired.rows;
    });
  }

  static async getPendingSubmissions(teacherId) {
    const query = `
      SELECT ts.*,
             t.title as test_title,
             s.name as student_name,
             COUNT(sa.id) as answers_count,
             COUNT(CASE WHEN sa.evaluation_status = 'pending' THEN 1 END) as pending_evaluations
      FROM test_submissions ts
      JOIN tests t ON ts.test_id = t.id
      JOIN students s ON ts.student_id = s.id
      LEFT JOIN student_answers sa ON ts.test_id = sa.test_id 
        AND ts.student_id = sa.student_id
      WHERE t.teacher_id = $1
        AND ts.status = 'completed'
      GROUP BY ts.id, t.title, s.name
      HAVING COUNT(CASE WHEN sa.evaluation_status = 'pending' THEN 1 END) > 0
      ORDER BY ts.submitted_at ASC
    `;
    const result = await pool.query(query, [teacherId]);
    return result.rows;
  }
}

export default TestSubmission;