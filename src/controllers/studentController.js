import Student from '../models/student.js';

export const addStudent = async (req, res) => {
  const { name, email } = req.body;

  try {
    const student = await Student.addStudent(name, email);
    res.status(201).json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getStudents = async (req, res) => {
  try {
    const students = await Student.getStudents();
    res.status(200).json({ success: true, data: students });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
