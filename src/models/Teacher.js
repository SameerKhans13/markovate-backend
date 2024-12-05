// models/Teacher.js
import pool from '../config/database.js';
import bcrypt from 'bcrypt';

class Teacher {
  static async create(name, email, password, subject) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO teachers (name, email, password_hash, subject)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, subject, created_at
    `;
    const result = await pool.query(query, [name, email, hashedPassword, subject]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT * FROM teachers WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM teachers WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async getTests(teacherId) {
    const query = `
      SELECT t.*, 
             COUNT(DISTINCT q.id) as question_count,
             COUNT(DISTINCT ts.student_id) as submission_count
      FROM tests t
      LEFT JOIN questions q ON t.id = q.test_id
      LEFT JOIN test_submissions ts ON t.id = ts.test_id
      WHERE t.teacher_id = $1
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `;
    const result = await pool.query(query, [teacherId]);
    return result.rows;
  }

  static async verifyPassword(teacher, password) {
    return bcrypt.compare(password, teacher.password_hash);
  }
}

export default Teacher;