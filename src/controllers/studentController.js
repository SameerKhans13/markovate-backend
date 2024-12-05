// controllers/studentController.js
import Test from '../models/Test.js';
import Answer from '../models/Answer.js';
import Student from '../models/Student.js';
import { EvaluationService } from '../services/evaluationService.js';
import NotificationService from '../services/notificationService.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import logger from '../config/winston.js';

export const getAvailableTests = async (req, res) => {
  try {
    const studentId = req.user.id;
    const tests = await Test.getAvailableForStudent(studentId);
    return successResponse(res, { tests });
  } catch (error) {
    logger.error('Error fetching available tests:', error);
    return errorResponse(res, error);
  }
};

export const startTest = async (req, res) => {
  try {
    const { testId } = req.body;
    const studentId = req.user.id;
    
    // Check if test exists and is active
    const test = await Test.getById(testId);
    if (!test || !test.is_active) {
      return errorResponse(res, new Error('Test not available'), 404);
    }

    // Check if student already started this test
    const existingSubmission = await Answer.getStudentTestSubmission(studentId, testId);
    if (existingSubmission) {
      return errorResponse(res, new Error('Test already attempted'), 400);
    }

    // Create test session
    const session = await Answer.createTestSession(studentId, testId);
    const questions = await Test.getQuestions(testId);

    return successResponse(res, {
      sessionId: session.id,
      test: {
        title: test.title,
        duration: test.duration,
        totalMarks: test.total_marks,
        questions: questions.map(q => ({
          id: q.id,
          text: q.question_text,
          marks: q.marks
        }))
      }
    });
  } catch (error) {
    logger.error('Error starting test:', error);
    return errorResponse(res, error);
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const { testId, questionId, answerText } = req.body;
    const studentId = req.user.id;

    // Validate test submission
    const submission = await Answer.getStudentTestSubmission(studentId, testId);
    if (!submission || submission.status === 'submitted') {
      return errorResponse(res, new Error('Invalid test submission'), 400);
    }

    // Save answer
    const answer = await Answer.create({
      studentId,
      testId,
      questionId,
      answerText
    });

    // Queue answer for evaluation
    await EvaluationService.queueAnswerEvaluation(answer.id);

    return successResponse(res, { message: 'Answer submitted successfully' });
  } catch (error) {
    logger.error('Error submitting answer:', error);
    return errorResponse(res, error);
  }
};

export const submitTest = async (req, res) => {
  try {
    const { testId } = req.body;
    const studentId = req.user.id;

    // Get all answers for evaluation
    const answers = await Answer.getTestAnswers(studentId, testId);
    if (!answers.length) {
      return errorResponse(res, new Error('No answers found for submission'), 400);
    }

    // Evaluate all answers
    const results = await EvaluationService.evaluateTestAnswers(answers);
    
    // Calculate total marks
    const totalMarks = results.reduce((sum, result) => sum + result.marksObtained, 0);

    // Update test submission status
    await Answer.completeTestSubmission(studentId, testId, totalMarks);

    // Send notification
    const student = await Student.findById(studentId);
    const test = await Test.getById(testId);
    await NotificationService.sendResultNotification(student, test, {
      totalMarks,
      results
    });

    return successResponse(res, {
      message: 'Test submitted successfully',
      totalMarks,
      results
    });
  } catch (error) {
    logger.error('Error submitting test:', error);
    return errorResponse(res, error);
  }
};

export const getTestResults = async (req, res) => {
  try {
    const { testId } = req.params;
    const studentId = req.user.id;

    const results = await Answer.getStudentTestResults(studentId, testId);
    if (!results) {
      return errorResponse(res, new Error('Results not found'), 404);
    }

    return successResponse(res, { results });
  } catch (error) {
    logger.error('Error fetching test results:', error);
    return errorResponse(res, error);
  }
};

export const getStudentProfile = async (req, res) => {
  try {
    const studentId = req.user.id;
    const student = await Student.findById(studentId);
    const testHistory = await Answer.getStudentTestHistory(studentId);
    
    return successResponse(res, {
      profile: {
        name: student.name,
        email: student.email,
        joinedAt: student.created_at
      },
      testHistory: testHistory.map(test => ({
        testId: test.test_id,
        title: test.title,
        submittedAt: test.submitted_at,
        score: test.total_marks,
        maxMarks: test.max_marks
      }))
    });
  } catch (error) {
    logger.error('Error fetching student profile:', error);
    return errorResponse(res, error);
  }
};