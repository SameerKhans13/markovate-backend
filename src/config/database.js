// it is the database.js file

import pg from "pg";
const { Pool } = pg;

import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

export const initDB = async () => {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS teachers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL,
        subject VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
  );

  await pool.query(
    `CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL
        )`
  );

  await pool.query(`
        CREATE TABLE IF NOT EXISTS tests (
          id SERIAL PRIMARY KEY,
          test_id VARCHAR(100) UNIQUE NOT NULL,
          duration INTEGER , 
          total INTEGER
        )
      `);

  // Table for test questions
  await pool.query(`
        CREATE TABLE IF NOT EXISTS test_questions (
          question_id SERIAL PRIMARY KEY,
          test_id INTEGER REFERENCES tests(test_id),
          question_text TEXT NOT NULL,
          correct_answer TEXT NOT NULL,
          marks INTEGER NOT NULL,
          question_type VARCHAR(50), -- Optional: e.g., 'multiple_choice', 'short_answer', 'true_false'
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
};
// export const initializeDatabaseTables = async () => {
//   try {
//     const connection = await pool.getConnection();

//     // Create student_test table
//     await connection.query(`
//       CREATE TABLE IF NOT EXISTS student_answers (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//        (test_id) varchar(255) NOT NULL,
//       (student_id) varchar(255) NOT NULL,
//      (question_id) varchar(255) NOT NULL,   
//     FREQUENCY OF (question_text) REFRERENCES test_questions(question_text),
//         (question_number) varchar(255) NOT NULL,
//        (keywords) varchar(255) NOT NULL,
//         student_answer varchar(255) NOT NULL,
//         is_correct BOOLEAN DEFAULT FALSE,
//         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//       )
//     `);
//   } catch (error) {
//     console.error("Error creating student_test table:", error);
//   }
// };
export const initializeDatabase = async () => {
  try {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS student_answers (
        id SERIAL PRIMARY KEY,
       test_id varchar(255) NOT NULL,
      student_id varchar(255) NOT NULL,
     question_id varchar(255) NOT NULL,   
        question_number varchar(255) NOT NULL,
        question_text TEXT REFERENCES test_questions(question_text),
       keywords varchar(255) NOT NULL,
        student_answer varchar(255) NOT NULL,
        is_correct BOOLEAN DEFAULT FALSE
      
      );`
    );

    await pool.query(
      `CREATE TABLE IF NOT EXISTS results (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id),
        test_id INTEGER REFERENCES tests(id),
        total_marks INTEGER,
        analysis TEXT,
        feedback TEXT,
        result_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    );

    await pool.query(
      `CREATE TABLE IF NOT EXISTS student_tests (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id),
        test_id INTEGER REFERENCES tests(id),
        submitted BOOLEAN DEFAULT FALSE,
        score INTEGER DEFAULT 0
      )`
    );

    // New tables for questions and answers
    await pool.query(
      `CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        question_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    );

    await pool.query(
      `CREATE TABLE IF NOT EXISTS answers (
        id SERIAL PRIMARY KEY,
        question_id INTEGER REFERENCES questions(id),
        answer_text TEXT NOT NULL,
        confidence_level DECIMAL DEFAULT 0.0,
        generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    );

    console.log("Database initialized successfully!");
  } catch (error) {
    console.error("Error initializing database:", error.message);
  }
};

export default pool;
