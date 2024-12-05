// scripts/migrate.js
import { initDB } from '../config/database.js';
import logger from '../utils/logger.js';
import pool from '../config/database.js';

const migrate = async () => {
 try {
   // Create extensions
   await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

   // Initialize core tables
   await initDB();

   // Create indices for performance
   await pool.query(`
     CREATE INDEX IF NOT EXISTS idx_test_teacher ON tests(teacher_id);
     CREATE INDEX IF NOT EXISTS idx_question_test ON questions(test_id);
     CREATE INDEX IF NOT EXISTS idx_answer_student ON student_answers(student_id);
     CREATE INDEX IF NOT EXISTS idx_answer_test ON student_answers(test_id);
     CREATE INDEX IF NOT EXISTS idx_submission_student ON test_submissions(student_id);
     CREATE INDEX IF NOT EXISTS idx_submission_test ON test_submissions(test_id);
   `);

   // Create constraints
   await pool.query(`
     ALTER TABLE student_answers
     ADD CONSTRAINT unique_student_question 
     UNIQUE (student_id, test_id, question_id);

     ALTER TABLE test_submissions
     ADD CONSTRAINT unique_student_test 
     UNIQUE (student_id, test_id);
   `);

   logger.info('Database migration completed successfully');
   process.exit(0);
 } catch (error) {
   logger.error('Migration failed:', error);
   process.exit(1);
 }
};

migrate();