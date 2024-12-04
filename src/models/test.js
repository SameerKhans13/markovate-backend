import pool from '../config/database.js';

class Test {
  // Add a new test
  static async addTest(test_name, description, teacher_id) {
    try {
      const query = 'INSERT INTO tests (test_name, description, teacher_id) VALUES ($1, $2, $3) RETURNING *';
      const result = await pool.query(query, [test_name, description, teacher_id]);
      return result.rows[0];
    } catch (err) {
      throw new Error('Failed to add test: ' + err.message);
    }
  }

  // Get a test by ID
  static async getTestById(test_id) {
    try {
      const query = 'SELECT * FROM tests WHERE id = $1';
      const result = await pool.query(query, [test_id]);
      return result.rows[0];
    } catch (err) {
      throw new Error('Failed to get test: ' + err.message);
    }
  }

  // Get all tests by teacher ID
  static async getTestsByTeacherId(teacher_id) {
    try {
      const query = 'SELECT * FROM tests WHERE teacher_id = $1';
      const result = await pool.query(query, [teacher_id]);
      return result.rows;
    } catch (err) {
      throw new Error('Failed to fetch tests: ' + err.message);
    }
  }
}

export default Test;
