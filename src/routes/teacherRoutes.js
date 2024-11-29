const express = require('express');
const { createTeacher, getTeachers } = require('../controllers/teacherController');
const router = express.Router();

router.post('/teachers', createTeacher); // Add a teacher
router.get('/teachers', getTeachers);    // Get all teachers

module.exports = router;
