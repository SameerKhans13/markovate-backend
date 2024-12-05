// controllers/teacherController.js
import Test from '../models/Test.js';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import { EvaluationService } from '../services/evaluationService.js';
import NotificationService from '../services/notificationService.js';
import { successResponse, errorResponse } from '../utils/responseHandler.js';
import logger from '../config/winston.js';
import { generateTestId } from '../utils/helpers.js';

export const createTest = async (req, res) => {
  try {
    const { title, duration, totalMarks, description } = req.body;
    const teacherId = req.user.id;
    const testId = generateTestId();

    const test = await Test.create({
      testId,
      teacherId,
      title,
      duration,
      totalMarks,
      description
    });

    logger.info('Test created', { testId: test.id, teacherId });
    return successResponse(res, { test }, 'Test created successfully', 201);
  } catch (error) {
    logger.error('Error creating test:', error);
    return errorResponse(res, error);
  }
};

export const addQuestion = async (req, res) => {
  try {
    const { testId, questionText, marks, keywords } = req.body;
    const teacherId = req.user.id;

    // Verify test ownership
    const test = await Test.getById(testId);
    if (!test || test.teacher_id !== teacherId) {
      return errorResponse(res, new Error('Test not found or unauthorized'), 404);
    }

    const question = await Question.create({
      testId,
      questionText,
      marks,
      keywords: JSON.stringify(keywords)
    });

    // Update test total marks
    await Test.updateTotalMarks(testId);

    logger.info('Question added', { testId, questionId: question.id });
    return successResponse(res, { question }, 'Question added successfully', 201);
  } catch (error) {
    logger.error('Error adding question:', error);
    return errorResponse(res, error);
  }
};

export const publishTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const teacherId = req.user.id;

    const test = await Test.getById(testId);
    if (!test || test.teacher_id !== teacherId) {
      return errorResponse(res, new Error('Test not found or unauthorized'), 404);
    }

    await Test.publish(testId);
    logger.info('Test published', { testId });
    return successResponse(res, { message: 'Test published successfully' });
  } catch (error) {
    logger.error('Error publishing test:', error);
    return errorResponse(res, error);
  }
};

export const getTestSubmissions = async (req, res) => {
  try {
    const { testId } = req.params;
    const teacherId = req.user.id;

    // Verify test ownership
    const test = await Test.getById(testId);
    if (!test || test.teacher_id !== teacherId) {
      return errorResponse(res, new Error('Test not found or unauthorized'), 404);
    }

    const submissions = await Answer.getTestSubmissions(testId);
    const stats = await Answer.getTestStats(testId);

    return successResponse(res, {
      submissions,
      stats,
      test: {
        title: test.title,
        totalMarks: test.total_marks,
        duration: test.duration
      }
    });
  } catch (error) {
    logger.error('Error fetching test submissions:', error);
    return errorResponse(res, error);
  }
};

export const evaluateAnswer = async (req, res) => {
  try {
    const { answerId, marks, feedback } = req.body;
    const teacherId = req.user.id;

    // Verify authorization
    const answer = await Answer.getById(answerId);
    const test = await Test.getById(answer.test_id);
    if (!test || test.teacher_id !== teacherId) {
      return errorResponse(res, new Error('Unauthorized'), 403);
    }

    // Manual evaluation
    await Answer.updateEvaluation(answerId, marks, feedback);
    
    // Send notification if all answers evaluated
    const allEvaluated = await Answer.checkAllEvaluated(answer.student_id, answer.test_id);
    if (allEvaluated) {
      const student = await Student.findById(answer.student_id);
      const results = await Answer.getStudentTestResults(answer.student_id, answer.test_id);
      await NotificationService.sendResultNotification(student, test, results);
    }

    return successResponse(res, { message: 'Answer evaluated successfully' });
  } catch (error) {
    logger.error('Error evaluating answer:', error);
    return errorResponse(res, error);
  }
};

export const getTestAnalytics = async (req, res) => {
  try {
    const { testId } = req.params;
    const teacherId = req.user.id;

    // Verify test ownership
    const test = await Test.getById(testId);
    if (!test || test.teacher_id !== teacherId) {
      return errorResponse(res, new Error('Test not found or unauthorized'), 404);
    }

    const analytics = await Answer.getTestAnalytics(testId);
    return successResponse(res, { analytics });
  } catch (error) {
    logger.error('Error fetching test analytics:', error);
    return errorResponse(res, error);
  }
};

export const updateTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const updates = req.body;
    const teacherId = req.user.id;

    // Verify test ownership
    const test = await Test.getById(testId);
    if (!test || test.teacher_id !== teacherId) {
      return errorResponse(res, new Error('Test not found or unauthorized'), 404);
    }

    // Don't allow updates to published tests
    if (test.status === 'published') {
      return errorResponse(res, new Error('Cannot update published test'), 400);
    }

    const updatedTest = await Test.update(testId, updates);
    logger.info('Test updated', { testId });
    return successResponse(res, { test: updatedTest });
  } catch (error) {
    logger.error('Error updating test:', error);
    return errorResponse(res, error);
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const stats = await Test.getTeacherStats(teacherId);
    const recentTests = await Test.getRecentTests(teacherId);
    const pendingEvaluations = await Answer.getPendingEvaluations(teacherId);

    return successResponse(res, {
      stats,
      recentTests,
      pendingEvaluations
    });
  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    return errorResponse(res, error);
  }
};