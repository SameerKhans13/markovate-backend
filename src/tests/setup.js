// tests/setup.js
import { initDB } from '../config/database.js';
import pool from '../config/database.js';
import redis from '../config/redis.js';
import logger from '../utils/logger.js';

beforeAll(async () => {
 try {
   // Initialize test database
   await initDB();
   
   // Clear existing data
   await pool.query(`
     TRUNCATE TABLE 
       user_sessions,
       student_answers,
       test_submissions,
       questions,
       tests,
       students,
       teachers
     CASCADE
   `);

   // Clear Redis cache
   await redis.flushall();

   logger.info('Test environment setup complete');
 } catch (error) {
   logger.error('Test setup failed:', error);
   throw error;
 }
});

// Clean up after tests
afterAll(async () => {
 try {
   await pool.end();
   await redis.quit();
   logger.info('Test environment cleanup complete');
 } catch (error) {
   logger.error('Test cleanup failed:', error);
   throw error;
 }
});

// Reset database between tests
afterEach(async () => {
 try {
   await pool.query(`
     TRUNCATE TABLE 
       user_sessions,
       student_answers,
       test_submissions,
       questions,
       tests,
       students,
       teachers
     CASCADE
   `);
   await redis.flushall();
 } catch (error) {
   logger.error('Test reset failed:', error);
   throw error;
 }
});

// Global test timeout
jest.setTimeout(30000);

// Mock nodemailer in test environment
jest.mock('nodemailer', () => ({
 createTransport: jest.fn().mockReturnValue({
   sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' })
 })
}));