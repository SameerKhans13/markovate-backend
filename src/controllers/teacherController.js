const { Teacher } = require('../models');

const createTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const teacher = await Teacher.create({ name, email, password });
    res.status(201).json({ message: 'Teacher created successfully!', teacher });
  } catch (err) {
    res.status(500).json({ error: 'Error creating teacher', details: err.message });
  }
};

const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.findAll();
    res.status(200).json(teachers);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching teachers', details: err.message });
  }
};

module.exports = { createTeacher, getTeachers };
