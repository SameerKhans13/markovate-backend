// middleware/validation.js
import { body, validationResult } from 'express-validator';

export const validateTest = [
  body('title').trim().notEmpty().withMessage('Test title is required'),
  body('duration').isInt({ min: 1 }).withMessage('Valid duration is required'),
  body('totalMarks').isInt({ min: 1 }).withMessage('Total marks must be positive'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

export const validateQuestion = [
  body('questionText').trim().notEmpty().withMessage('Question text is required'),
  body('marks').isInt({ min: 1 }).withMessage('Marks must be positive'),
  body('keywords').isArray().withMessage('Keywords must be an array')
    .custom((value) => value.length > 0).withMessage('At least one keyword is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

export const validateAnswer = [
  body('answerText').trim().notEmpty().withMessage('Answer text is required'),
  body('questionId').isInt().withMessage('Valid question ID is required'),
  body('testId').isInt().withMessage('Valid test ID is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];