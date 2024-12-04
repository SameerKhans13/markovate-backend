import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

export const initDB = async () => {
  try {
    // Create Teachers table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS teachers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL,
        subject VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Students table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL
      );
    `);

    // Create Tests table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tests (
        id SERIAL PRIMARY KEY,
        teacher_id INTEGER REFERENCES teachers(id),
        test_name VARCHAR(255),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Questions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        test_id INTEGER REFERENCES tests(id),
        question_text TEXT NOT NULL,
        marks INTEGER NOT NULL,
        keywords TEXT[]
      );
    `);

    // Create Answers table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS answers (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id),
        test_id INTEGER REFERENCES tests(id),
        question_id INTEGER REFERENCES questions(id),
        answer_text TEXT
      );
    `);

    // Create Results table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS results (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id),
        test_id INTEGER REFERENCES tests(id),
        total_marks INTEGER
      );
    `);

    // Create Student_Tests table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS student_tests (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id),
        test_id INTEGER REFERENCES tests(id),
        submitted BOOLEAN DEFAULT FALSE,
        score INTEGER DEFAULT 0
      );
    `);

    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error.message);
  }
};

// Call the function to create tables
initDB();

export default pool;