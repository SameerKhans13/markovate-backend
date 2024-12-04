// teacherRoutes.js
import express from 'express';
import { addTeacher, getTeachers, addTest, viewTest, submitTest, viewResults, postResults } from '../controllers/teacherController.js';

const router = express.Router();

// Route to add a teacher
router.post('/add', addTeacher);

// Route to get all teachers
router.get('/all', getTeachers);

// Additional teacher-related routes
router.post('/test', addTest);
router.get('/test/:id', viewTest);
// other routes...

export default router;
