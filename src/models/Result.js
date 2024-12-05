// models/Result.js
import pool from '../config/database.js';

class Result {
  static async create(studentId, testId, answers, totalMarks) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Insert test submission
      const submissionQuery = `
        INSERT INTO test_submissions (student_id, test_id, total_marks)
        VALUES ($1, $2, $3)
        RETURNING id
      `;
      const submission = await client.query(submissionQuery, [studentId, testId, totalMarks]);
      
      // Update answer evaluations
      for (const answer of answers) {
        const answerQuery = `
          UPDATE student_answers
          SET marks_obtained = $1,
              feedback = $2,
              evaluated_at = CURRENT_TIMESTAMP
          WHERE student_id = $3
            AND test_id = $4
            AND question_id = $5
        `;
        await client.query(answerQuery, [
          answer.marksObtained,
          answer.feedback,
          studentId,
          testId,
          answer.questionId
        ]);
      }

      await client.query('COMMIT');
      return submission.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getStudentResults(studentId) {
    const query = `
      SELECT 
        ts.id as submission_id,
        t.title as test_title,
        ts.total_marks,
        t.total_marks as max_marks,
        ts.submitted_at,
        json_agg(
          json_build_object(
            'question_text', q.question_text,
            'answer_text', sa.answer_text,
            'marks_obtained', sa.marks_obtained,
            'feedback', sa.feedback
          )
        ) as answers
      FROM test_submissions ts
      JOIN tests t ON ts.test_id = t.id
      JOIN student_answers sa ON ts.test_id = sa.test_id 
        AND ts.student_id = sa.student_id
      JOIN questions q ON sa.question_id = q.id
      WHERE ts.student_id = $1
      GROUP BY ts.id, t.title, ts.total_marks, t.total_marks, ts.submitted_at
      ORDER BY ts.submitted_at DESC
    `;
    const result = await pool.query(query, [studentId]);
    return result.rows;
  }

  static async getTestResults(testId) {
    const query = `
      SELECT 
        s.name as student_name,
        s.email as student_email,
        ts.total_marks,
        t.total_marks as max_marks,
        ts.submitted_at,
        json_agg(
          json_build_object(
            'question_text', q.question_text,
            'answer_text', sa.answer_text,
            'marks_obtained', sa.marks_obtained,
            'feedback', sa.feedback
          )
        ) as answers
      FROM test_submissions ts
      JOIN students s ON ts.student_id = s.id
      JOIN tests t ON ts.test_id = t.id
      JOIN student_answers sa ON ts.test_id = sa.test_id 
        AND ts.student_id = sa.student_id
      JOIN questions q ON sa.question_id = q.id
      WHERE ts.test_id = $1
      GROUP BY s.name, s.email, ts.total_marks, t.total_marks, ts.submitted_at
      ORDER BY ts.total_marks DESC
    `;
    const result = await pool.query(query, [testId]);
    return result.rows;
  }
}

export default Result;