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

// Database initialization function
export const initializeDatabase = async () => {
  const createUserQuery = `
    CREATE TABLE IF NOT EXISTS accounts (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
	    account_type VARCHAR(255) NOT NULL,
      verified BOOLEAN DEFAULT false,
	    token_key VARCHAR(255) NOT NULL,
      email_services BOOLEAN[] DEFAULT array[false,false]
    );`;

  const createRefreshTokenTableQuery = `
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      token VARCHAR(255) NOT NULL,
      expires TIMESTAMP NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );`;
    const createUserTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    number VARCHAR(50) NOT NULL,
    answer VARCHAR(255) NOT NULL
  );
`;

  try {
    await pool.query(createUserQuery);
    await pool.query(createUserTableQuery);
    console.log("accounts table initialized");
    // await pool.query(createRefreshTokenTableQuery);
  } catch (error) {
    console.error("Database initialization error:", error);
  }
};

export default pool;