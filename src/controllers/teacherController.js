// it is the teacherController.js file

import Test from '../models/test.js';
import Question from '../models/question.js';
import Answer from '../models/answer.js';
import Result from '../models/result.js';
import StudentTest from '../models/studentTest.js';

// Add a new test
export const addTest = async (req, res) => {
  const { test_id, duration,total } = req.body;

  try {
    // Create a new test in the Test table
    const test = await Test.addTest({
      test_id,
      duration,
      total
    });

    // Return the created test with its new ID
    res.status(201).json(test);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add test: ' + err.message });
  }
};

export const addQuestionstoTest = async (req, res) => {
  const { test_id, question_text, marks, keywords } = req.body;

  try {
    // Verify the test exists
    const test = await Test.getTestById(test_id);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Create a new question in the Questions table, linked by test_id
    const question = await Question.addQuestion({
      test_id,
      question_text,
      marks,
      keywords
    });

    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add question: ' + err.message });
  }
};
// View test (for students)
export const viewTest = async (req, res) => {
  const { test_id } = req.params;

  try {
    const test = await Test.getTestById(test_id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    const questions = await Question.getQuestionsByTestId(test_id);
    res.status(200).json({ test, questions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch test: ' + err.message });
  }
};

// Submit test answers from student
export const submitTest = async (req, res) => {
  const { student_id, test_id, answers } = req.body;

  try {
    const existingSubmission = await StudentTest.getStudentTestByStudentIdAndTestId(student_id, test_id);
    if (existingSubmission && existingSubmission.submitted) {
      return res.status(400).json({ message: 'Test already submitted' });
    }

    for (const answer of answers) {
      const { question_id, answer_text } = answer;
      await Answer.addAnswer(student_id, test_id, question_id, answer_text);
    }

    await StudentTest.submitTest(student_id, test_id);
    res.status(200).json({ message: 'Test submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit test: ' + err.message });
  }
};

// Post results after evaluation
export const postResults = async (req, res) => {
  const { test_id, student_id, total_marks, analysis, feedback } = req.body;

  try {
    await Result.addResult(student_id, test_id, total_marks, analysis, feedback);
    res.status(200).json({ message: 'Results posted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to post results: ' + err.message });
  }
};

// View results (for teacher)
export const viewResults = async (req, res) => {
  const { test_id } = req.params;

  try {
    const results = await Result.getResultsByTestId(test_id);
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch results: ' + err.message });
  }
};