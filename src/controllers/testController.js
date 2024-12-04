// it is the testController.js file

// testController.js
const Test = require('../models/test'); // Adjust the import path as needed
const Question = require('../models/question'); // Adjust the import path as needed

// Controller to add a new test
export const addTest = async (req, res) => {
  const { test_id ,duration,total } = req.body;
  
  try {
    // Validate input
    if (!total || !test_id) {
      return res.status(400).json({ error: 'Total and test ID are required' });
    }

    // Create test with all necessary details
    const test = await Test.addTest({
     test_id,
      duration,
      total
    });

    res.status(201).json(test);
  } catch (err) {
    console.error('Error adding test:', err);
    res.status(500).json({ error: err.message });
  }
};

// Controller to add questions to an existing test
export const addQuestionstoTest = async (req, res) => {
  const { test_id, questions } = req.body;
  
  try {
    // Validate input
    if (!test_id || !questions || !Array.isArray(questions)) {
      return res.status(400).json({ error: 'Test ID and questions array are required' });
    }

    // Verify the test exists
    const testExists = await Test.getTestById(test_id);
    if (!testExists) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Add questions to the test
    const addedQuestions = await Promise.all(
      questions.map(async (question) => {
        return await Question.addQuestion({
          test_id: test_id,
          question_text: question.question_text,
          correct_answer: question.correct_answer,
          marks: question.marks,
          question_type: question.question_type || 'multiple_choice'
        });
      })
    );

    res.status(201).json({
      message: 'Questions added successfully',
      test_id: test_id,
      questions: addedQuestions
    });
  } catch (err) {
    console.error('Error adding questions to test:', err);
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