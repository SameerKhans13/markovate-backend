// services/evaluationService.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import NotificationService from './notificationService.js';
import logger from '../config/winston.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export class EvaluationService {
  static async evaluateAnswer(answerId) {
    try {
      // Get answer and question details
      const answer = await Answer.getById(answerId);
      const question = await Question.getQuestionWithKeywords(answer.question_id);
      const keywords = JSON.parse(question.keywords);

      // Prepare evaluation prompt
      const prompt = `
        Evaluate this student answer based on the following criteria:
        Question: ${question.question_text}
        Student Answer: ${answer.answer_text}
        Expected Keywords: ${JSON.stringify(keywords)}
        Total Marks: ${question.marks}

        Please evaluate based on:
        1. Keyword matching and understanding
        2. Completeness of answer
        3. Accuracy of concepts
        4. Clarity and presentation

        Format response as JSON:
        {
          "matched_keywords": {
            "keyword": "context in which it was used"
          },
          "marks_awarded": number,
          "marks_breakdown": {
            "keywords": number,
            "completeness": number,
            "accuracy": number,
            "clarity": number
          },
          "feedback": "detailed feedback",
          "improvement_suggestions": [
            "suggestion1",
            "suggestion2"
          ]
        }
      `;

      // Get evaluation from Gemini
      const result = await model.generateContent(prompt);
      const evaluation = JSON.parse(result.response.text());

      // Update answer with evaluation
      await Answer.updateEvaluation(
        answerId, 
        evaluation.marks_awarded,
        evaluation.feedback,
        evaluation.matched_keywords
      );

      // Log evaluation
      logger.info('Answer evaluated', {
        answerId,
        marksAwarded: evaluation.marks_awarded,
        matchedKeywords: Object.keys(evaluation.matched_keywords).length
      });

      return evaluation;
    } catch (error) {
      logger.error('Evaluation error:', error);
      throw error;
    }
  }

  static async evaluateTestSubmission(studentId, testId) {
    return await Answer.executeTransaction(async (client) => {
      try {
        // Get all answers for the test
        const answers = await Answer.getTestAnswers(studentId, testId, client);
        let totalMarks = 0;
        const evaluations = [];

        // Evaluate each answer
        for (const answer of answers) {
          const evaluation = await this.evaluateAnswer(answer.id);
          totalMarks += evaluation.marks_awarded;
          evaluations.push({
            questionId: answer.question_id,
            evaluation
          });
        }

        // Update test submission
        await Answer.completeTestSubmission(
          studentId,
          testId,
          totalMarks,
          client
        );

        // Send notification
        const student = await Answer.getStudentById(studentId, client);
        const test = await Answer.getTestById(testId, client);
        await NotificationService.sendTestResults(student, test, {
          totalMarks,
          evaluations
        });

        return {
          totalMarks,
          evaluations
        };
      } catch (error) {
        logger.error('Test evaluation error:', error);
        throw error;
      }
    });
  }

  static async reEvaluateAnswer(answerId, teacherFeedback) {
    try {
      const answer = await Answer.getById(answerId);
      const question = await Question.getQuestionWithKeywords(answer.question_id);
      
      // Incorporate teacher feedback into evaluation
      const prompt = `
        Re-evaluate this student answer considering teacher feedback:
        Question: ${question.question_text}
        Student Answer: ${answer.answer_text}
        Previous Evaluation: ${answer.feedback}
        Teacher Feedback: ${teacherFeedback}
        Total Marks: ${question.marks}

        Please provide updated evaluation in same JSON format as before.
      `;

      const result = await model.generateContent(prompt);
      const evaluation = JSON.parse(result.response.text());

      // Update answer with new evaluation
      await Answer.updateEvaluation(
        answerId,
        evaluation.marks_awarded,
        evaluation.feedback,
        evaluation.matched_keywords,
        teacherFeedback
      );

      return evaluation;
    } catch (error) {
      logger.error('Re-evaluation error:', error);
      throw error;
    }
  }

  static async getEvaluationStats(testId) {
    try {
      const stats = await Answer.getTestEvaluationStats(testId);
      return {
        ...stats,
        averageScore: (stats.totalMarks / stats.totalSubmissions).toFixed(2),
        keywordMatchRate: (stats.totalKeywordsMatched / stats.totalKeywords * 100).toFixed(2)
      };
    } catch (error) {
      logger.error('Error getting evaluation stats:', error);
      throw error;
    }
  }
}

export default EvaluationService;