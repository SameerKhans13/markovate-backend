import Test from '../models/test.js';
import Question from '../models/question.js';

// Add a new test
export const addTest = async (req, res) => {
  const { title, description, teacher_id, questions } = req.body;
  try {
    // Create test
    const test = await Test.addTest(title, description, teacher_id);
    
    // Add questions to the test
    questions.forEach(async (question) => {
      await Question.addQuestion(test.id, question.question_text, question.marks, question.keywords);
    });

    res.status(201).json(test);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all tests
export const getTests = async (req, res) => {
  try {
    const tests = await Test.getTests();
    res.status(200).json(tests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
