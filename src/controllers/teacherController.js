import Teacher from '../models/Teacher.js';
import Test from '../models/test.js';
import Question from '../models/question.js';
import StudentTest from '../models/studentTest.js';
import Answer from '../models/answer.js';
import Result from '../models/Result.js';

// Add a new teacher (Teacher creation functionality)
export const addTeacher = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingTeacher = await Teacher.getTeacherByEmail(email);
    if (existingTeacher) {
      return res.status(400).json({ message: 'Teacher already exists' });
    }

    const teacher = await Teacher.addTeacher(name, email, password);
    res.status(201).json(teacher);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add teacher: ' + err.message });
  }
};

// Get all teachers
export const getTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.getAllTeachers();
    res.status(200).json(teachers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch teachers: ' + err.message });
  }
};

// Add a new test (Teacher functionality to create a test)
export const addTest = async (req, res) => {
  const { teacher_id, test_name, description, questions } = req.body;

  try {
    // Create a new test
    const test = await Test.addTest(test_name, description, teacher_id);

    // Add questions for this test
    for (const question of questions) {
      const { question_text, marks, keywords } = question;
      await Question.addQuestion(test.id, question_text, marks, keywords);
    }

    res.status(201).json(test);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add test: ' + err.message });
  }
};

// View a test (View test questions and marks for students)
export const viewTest = async (req, res) => {
  const { test_id } = req.params;

  try {
    // Get test details
    const test = await Test.getTestById(test_id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    // Get questions associated with this test
    const questions = await Question.getQuestionsByTestId(test_id);
    res.status(200).json({ test, questions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch test: ' + err.message });
  }
};

// Submit a student's test (Post the student's answers to the backend)
export const submitTest = async (req, res) => {
  const { student_id, test_id, answers } = req.body;

  try {
    // Check if the student has already submitted the test
    const existingSubmission = await StudentTest.getStudentTestByStudentIdAndTestId(student_id, test_id);
    if (existingSubmission && existingSubmission.submitted) {
      return res.status(400).json({ message: 'Test already submitted' });
    }

    // Save student answers
    for (const answer of answers) {
      const { question_id, answer_text } = answer;
      await Answer.addAnswer(student_id, test_id, question_id, answer_text);
    }

    // Mark the test as submitted
    await StudentTest.submitTest(student_id, test_id);

    res.status(200).json({ message: 'Test submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit test: ' + err.message });
  }
};

// View results of the test (For the teacher to review results after AI evaluation)
export const viewResults = async (req, res) => {
  const { test_id } = req.params;

  try {
    // Get results for all students who have taken the test
    const results = await Result.getResultsByTestId(test_id);
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch results: ' + err.message });
  }
};

// Post results (Send the results to the student dashboard after AI evaluation)
export const postResults = async (req, res) => {
  const { test_id, student_id, total_marks } = req.body;

  try {
    // Save the result for this student
    await Result.addResult(student_id, test_id, total_marks);

    res.status(200).json({ message: 'Results posted successfully to student' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to post results: ' + err.message });
  }
};
