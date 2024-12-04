import express from 'express';
import { addStudent, getStudents } from '../controllers/studentController.js';

const router = express.Router();

router.post('/add', addStudent);
router.get('/list', getStudents);

export default router;
