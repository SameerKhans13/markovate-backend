// it is the teacherRoutes.js file

import express from 'express';
import { addTest, viewTest, submitTest, viewResults, postResults , addQuestionstoTest } from '../controllers/teacherController.js';

const router = express.Router();

// Route to add a new test
router.post('/add-test', addTest);

router.post('/add-question', addQuestionstoTest);

// Route to view a specific test (including its questions)
router.get('/view-test/:test_id', viewTest);

// Route to submit answers to a test
router.post('/submit-test', submitTest);

// Route to view all results for a test (teacher views results for all students)
router.get('/view-results/:test_id', viewResults);

// Route to post results for a specific student (after evaluation)
router.post('/post-results', postResults);

export default router;