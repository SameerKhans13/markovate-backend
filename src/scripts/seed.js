// scripts/seed.js
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import logger from '../utils/logger.js';

const seedData = async () => {
 try {
   const client = await pool.connect();

   try {
     await client.query('BEGIN');

     // Create demo teacher
     const hashedTeacherPassword = await bcrypt.hash('teacher123', 10);
     const teacherResult = await client.query(`
       INSERT INTO teachers (name, email, password_hash, subject)
       VALUES ($1, $2, $3, $4)
       RETURNING id
     `, ['Demo Teacher', 'teacher@demo.com', hashedTeacherPassword, 'Mathematics']);
     const teacherId = teacherResult.rows[0].id;

     // Create demo student
     const hashedStudentPassword = await bcrypt.hash('student123', 10); 
     const studentResult = await client.query(`
       INSERT INTO students (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id
     `, ['Demo Student', 'student@demo.com', hashedStudentPassword]);
     const studentId = studentResult.rows[0].id;

     // Create demo test
     const testResult = await client.query(`
       INSERT INTO tests (teacher_id, test_id, title, duration, total_marks, description, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id
     `, [teacherId, 'DEMO001', 'Mathematics Test', 60, 100, 'Basic mathematics concepts', 'published']);
     const testId = testResult.rows[0].id;

     // Create demo questions
     const questions = [
       {
         text: 'Explain the Pythagorean theorem and its applications.',
         marks: 20,
         keywords: JSON.stringify(['a2 + b2 = c2', 'right triangle', 'hypotenuse', 'perpendicular'])
       },
       {
         text: 'Solve the quadratic equation: x2 + 5x + 6 = 0',
         marks: 15,
         keywords: JSON.stringify(['quadratic', 'factoring', 'roots', '-2', '-3'])
       }
     ];

     for (const question of questions) {
       await client.query(`
         INSERT INTO questions (test_id, question_text, marks, keywords)
         VALUES ($1, $2, $3, $4)
       `, [testId, question.text, question.marks, question.keywords]);
     }

     await client.query('COMMIT');
     logger.info('Seed data inserted successfully');
     process.exit(0);
   } catch (error) {
     await client.query('ROLLBACK');
     throw error;
   } finally {
     client.release();
   }
 } catch (error) {
   logger.error('Seeding failed:', error);
   process.exit(1);
 }
};

seedData();