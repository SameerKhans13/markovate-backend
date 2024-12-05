// models/Student.js
import pool from '../config/database.js';
import bcrypt from 'bcrypt';

class Student {
  static async create(name, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO students (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, name, email, created_at
    `;
    const result = await pool.query(query, [name, email, hashedPassword]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM students WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM students WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async getTestResults(studentId) {
    const query = `
      SELECT t.title, ts.total_marks, ts.submitted_at,
             t.total_marks as max_marks,
             ROUND((ts.total_marks::float / t.total_marks * 100), 2) as percentage
      FROM test_submissions ts
      JOIN tests t ON ts.test_id = t.id
      WHERE ts.student_id = $1
      ORDER BY ts.submitted_at DESC
    `;
    const result = await pool.query(query, [studentId]);
    return result.rows;
  }

  static async verifyPassword(student, password) {
    return bcrypt.compare(password, student.password_hash);
  }
}

export default Student;