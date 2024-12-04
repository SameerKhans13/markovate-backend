import pool from '../config/database.js';

class StudentTest {
  // Submit a student's test
  static async submitTest(student_id, test_id) {
    try {
      const query = 'UPDATE student_tests SET submitted = true WHERE student_id = $1 AND test_id = $2 RETURNING *';
      const result = await pool.query(query, [student_id, test_id]);
      return result.rows[0];
    } catch (err) {
      throw new Error('Failed to submit test: ' + err.message);
    }
  }

  // Get student's test by student_id and test_id
  static async getStudentTestByStudentIdAndTestId(student_id, test_id) {
    try {
      const query = 'SELECT * FROM student_tests WHERE student_id = $1 AND test_id = $2';
      const result = await pool.query(query, [student_id, test_id]);
      return result.rows[0];
    } catch (err) {
      throw new Error('Failed to get student test: ' + err.message);
    }
  }
}

export default StudentTest;
