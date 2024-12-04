import pool from '../config/database.js'; // Pool for DB connection

class Teacher {
  // Add a new teacher
  static async addTeacher(name, email, password) {
    try {
      const query = 'INSERT INTO teachers (name, email, password) VALUES ($1, $2, $3) RETURNING *';
      const result = await pool.query(query, [name, email, password]);
      return result.rows[0];
    } catch (err) {
      throw new Error('Failed to add teacher: ' + err.message);
    }
  }

  // Get teacher by email
  static async getTeacherByEmail(email) {
    try {
      const query = 'SELECT * FROM teachers WHERE email = $1';
      const result = await pool.query(query, [email]);
      return result.rows[0];
    } catch (err) {
      throw new Error('Failed to get teacher: ' + err.message);
    }
  }

  // Get all teachers
  static async getAllTeachers() {
    try {
      const query = 'SELECT * FROM teachers';
      const result = await pool.query(query);
      return result.rows;
    } catch (err) {
      throw new Error('Failed to fetch teachers: ' + err.message);
    }
  }
}

export default Teacher;
