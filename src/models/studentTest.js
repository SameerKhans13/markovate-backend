// studentTest.js file

import pool from '../config/database.js';

class StudentTest {
  static async submitTest(student_id, test_id) {
    const query = 'UPDATE student_tests SET submitted = true WHERE student_id = $1 AND test_id = $2';
    const values = [student_id, test_id];
    await pool.query(query, values);
  }

  static async saveAnswers(student_id, test_id, answers) {
    const query = 'INSERT INTO student_ans (student_id, test_id, question_id, answer_text) VALUES ($1, $2, $3, $4)';
    for (const answer of answers) {
      const { question_id, answer_text } = answer;
      const values = [student_id, test_id, question_id, answer_text];
      await pool.query(query, values);
    }
  }
}

export default StudentTest;