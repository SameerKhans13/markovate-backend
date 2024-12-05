// database.js
export const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS teachers (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      email VARCHAR(100) UNIQUE NOT NULL,
      subject VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS students (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      email VARCHAR(100) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tests (
      id SERIAL PRIMARY KEY,
      test_id VARCHAR(100) UNIQUE NOT NULL,
      teacher_id INTEGER REFERENCES teachers(id),
      title VARCHAR(200) NOT NULL,
      duration INTEGER,
      total_marks INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS questions (
      id SERIAL PRIMARY KEY,
      test_id INTEGER REFERENCES tests(id),
      question_text TEXT NOT NULL,
      marks INTEGER NOT NULL,
      keywords JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS student_answers (
      id SERIAL PRIMARY KEY,
      student_id INTEGER REFERENCES students(id),
      test_id INTEGER REFERENCES tests(id),
      question_id INTEGER REFERENCES questions(id),
      answer_text TEXT NOT NULL,
      marks_obtained INTEGER,
      feedback TEXT,
      keywords_matched JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, test_id, question_id)
    );

    CREATE TABLE IF NOT EXISTS test_submissions (
      id SERIAL PRIMARY KEY,
      student_id INTEGER REFERENCES students(id),
      test_id INTEGER REFERENCES tests(id),
      total_marks INTEGER NOT NULL,
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(20) DEFAULT 'submitted',
      UNIQUE(student_id, test_id)
    );
  `);
};