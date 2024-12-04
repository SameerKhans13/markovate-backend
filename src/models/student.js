import pool from '../config/database.js';

class Student {
  // Add a new student
  static async addStudent(name, email, password) {
    try {
      const query = 'INSERT INTO students (name, email, password) VALUES ($1, $2, $3) RETURNING *';
      const result = await pool.query(query, [name, email, password]);
      return result.rows[0];
    } catch (err) {
      throw new Error('Failed to add student: ' + err.message);
    }
  }

  // Get student by email
  static async getStudentByEmail(email) {
    try {
      const query = 'SELECT * FROM students WHERE email = $1';
      const result = await pool.query(query, [email]);
      return result.rows[0];
    } catch (err) {
      throw new Error('Failed to get student: ' + err.message);
    }
  }

  // Get all students
  static async getAllStudents() {
    try {
      const query = 'SELECT * FROM students';
      const result = await pool.query(query);
      return result.rows;
    } catch (err) {
      throw new Error('Failed to fetch students: ' + err.message);
    }
  }
}

export default Student;
