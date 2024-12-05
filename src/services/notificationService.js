// services/notificationService.js
import nodemailer from 'nodemailer';
import { emailTemplates } from '../config/nodemailer.js';
import logger from '../utils/logger.js';
import redis from '../config/redis.js';

class NotificationService {
 constructor() {
   this.transporter = nodemailer.createTransport({
     service: 'gmail',
     auth: {
       user: process.env.EMAIL_SERVICES_USER,
       pass: process.env.EMAIL_SERVICES_PASS
     }
   });
 }

 async sendEmail(to, subject, html) {
   try {
     const info = await this.transporter.sendMail({
       from: process.env.EMAIL_SERVICES_USER,
       to,
       subject,
       html
     });
     logger.info('Email sent:', { messageId: info.messageId });
     return true;
   } catch (error) {
     logger.error('Email send error:', error);
     throw error;
   }
 }

 async sendTestReminder(student, test) {
   const key = `reminder:${student.id}:${test.id}`;
   const sent = await redis.get(key);
   
   if (!sent) {
     const { subject, html } = emailTemplates.testReminder(
       student.name,
       test.title,
       test.startTime
     );
     await this.sendEmail(student.email, subject, html);
     await redis.set(key, 'sent', 'EX', 86400); // 24 hours
   }
 }

 async sendTestResults(student, test, results) {
   const { subject, html } = emailTemplates.testResults(
     student.name,
     test.title,
     {
       obtained: results.totalMarks,
       total: test.total_marks
     },
     results.feedback
   );
   await this.sendEmail(student.email, subject, html);
 }

 async sendTestSubmissionConfirmation(student, test) {
   const { subject, html } = emailTemplates.testSubmission(
     student.name,
     test.title,
     test.submittedAt
   );
   await this.sendEmail(student.email, subject, html);
 }

 async notifyTeacher(teacher, type, data) {
   const templates = {
     'new_submission': emailTemplates.newSubmission,
     'test_completed': emailTemplates.testCompleted,
     'evaluation_needed': emailTemplates.evaluationNeeded
   };

   if (templates[type]) {
     const { subject, html } = templates[type](teacher.name, data);
     await this.sendEmail(teacher.email, subject, html);
   }
 }

 async sendPasswordReset(user, resetToken) {
   const { subject, html } = emailTemplates.passwordReset(
     user.name,
     resetToken
   );
   await this.sendEmail(user.email, subject, html);
 }

 async sendAccountVerification(user, verificationToken) {
   const { subject, html } = emailTemplates.accountVerification(
     user.name,
     verificationToken
   );
   await this.sendEmail(user.email, subject, html);
 }
}

export default new NotificationService();