import express from 'express';
import { addTest, viewTest, submitTest, viewResults, postResults } from '../controllers/teacherController.js';

const router = express.Router();

// POST request to create a new test
router.post('/add-test', addTest);

// GET request to view the test (for students)
router.get('/view-test/:test_id', viewTest);

// POST request to submit student's answers
router.post('/submit-test', submitTest);

// GET request to view test results (for teachers)
router.get('/view-results/:test_id', viewResults);

// POST request to post results for students (teacher)
router.post('/post-results', postResults);

export default router;
