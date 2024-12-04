import pool from '../config/database.js';

class Result {
  // Add result for a student
  static async addResult(student_id, test_id, total_marks) {
    try {
      const query = 'INSERT INTO results (student_id, test_id, total_marks) VALUES ($1, $2, $3) RETURNING *';
      const result = await pool.query(query, [student_id, test_id, total_marks]);
      return result.rows[0];
    } catch (err) {
      throw new Error('Failed to add result: ' + err.message);
    }
  }

  // Get results by test ID
  static async getResultsByTestId(test_id) {
    try {
      const query = 'SELECT * FROM results WHERE test_id = $1';
      const result = await pool.query(query, [test_id]);
      return result.rows;
    } catch (err) {
      throw new Error('Failed to fetch results: ' + err.message);
    }
  }
}

export default Result;
