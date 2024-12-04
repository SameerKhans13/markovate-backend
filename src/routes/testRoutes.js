// it is the testRoutes.js file

import express from 'express';
import { addTest, viewTest, submitTest, viewResults, postResults, addQuestionstoTest } from '../controllers/teacherController.js';


const router = express.Router();

// POST request to create a new test
router.post('/add-test', addTest);

router.post('/add-question', addQuestionstoTest);

// GET request to view the test (for students)
router.get('/view-test/:test_id', viewTest);

// POST request to submit student's answers
router.post('/submit-test', submitTest);

// GET request to view all results (for the teacher)
router.get('/view-results/:test_id', viewResults);

// POST request to post the results back to the student
router.post('/post-results', postResults);

export default router;