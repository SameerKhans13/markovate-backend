// it is the studentRoutes.js file

import express from 'express';
import { getTestsForStudent, submitTestAnswers } from '../controllers/studentController.js';

const router = express.Router();

// Route to get the list of tests available for the student
router.get('/available-tests', getTestsForStudent);

// Route to submit answers for a specific test
router.post('/submit-answers', submitTestAnswers);

export default router;