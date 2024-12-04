// it is the test.js file

import pool from '../config/database.js';

class Test {
  static async addTest(test_id, duration, total) {
    const query = 'INSERT INTO tests (test_id, duration, total) VALUES ($1, $2, $3) RETURNING *';
    const values = [test_id, duration, total];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }
  static async addQuestiontoTest( test_id, question_text, marks, keywords) {
    const query = 'INSERT INTO tests (test_id, question_text, marks, keywords) VALUES ($1, $2, $3 , $4) RETURNING *';
    const values = [test_id, question_text, marks, keywords];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }


  static async getTestById(test_id) {
    const query = 'SELECT * FROM tests WHERE id = $1';
    const values = [test_id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async getTestsForStudent() {
    const query = 'SELECT * FROM tests WHERE active = true';
    const { rows } = await pool.query(query);
    return rows;
  }
}

export default Test;