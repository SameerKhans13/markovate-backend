// it is the studentController.js file

import Test from '../models/test.js';
import StudentTest from '../models/studentTest.js';

// Get list of tests available for student
export const getTestsForStudent = async (req, res) => {
  try {
    const tests = await Test.getTestsForStudent();
    res.status(200).json(tests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Submit answers for a test
export const submitTestAnswers = async (req, res) => {
  const { student_id, test_id, answers } = req.body;

  try {
    await StudentTest.submitTest(student_id, test_id);
    await StudentTest.saveAnswers(student_id, test_id, answers);
    res.status(200).json({ message: 'Test answers submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit test answers: ' + err.message });
  }
};