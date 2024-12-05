// config/nodemailer.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import logger from './winston.js';

dotenv.config();

const createTransporter = () => {
  try {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_SERVICES_USER,
        pass: process.env.EMAIL_SERVICES_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  } catch (error) {
    logger.error('Failed to create email transporter:', error);
    throw error;
  }
};

const transporter = createTransporter();

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    logger.error('SMTP connection error:', error);
  } else {
    logger.info('SMTP server is ready to send emails');
  }
});

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_SERVICES_USER,
      to,
      subject,
      html,
      text
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    logger.error('Failed to send email:', error);
    throw error;
  }
};

// Email templates
export const emailTemplates = {
  testReminder: (studentName, testTitle, startTime) => ({
    subject: `Reminder: Upcoming Test - ${testTitle}`,
    html: `
      <h2>Test Reminder</h2>
      <p>Hello ${studentName},</p>
      <p>This is a reminder that you have an upcoming test:</p>
      <ul>
        <li><strong>Test:</strong> ${testTitle}</li>
        <li><strong>Start Time:</strong> ${new Date(startTime).toLocaleString()}</li>
      </ul>
      <p>Please ensure you're prepared and have a stable internet connection.</p>
      <p>Good luck!</p>
    `
  }),

  testResults: (studentName, testTitle, score, feedback) => ({
    subject: `Test Results - ${testTitle}`,
    html: `
      <h2>Test Results</h2>
      <p>Hello ${studentName},</p>
      <p>Your results for ${testTitle} are now available:</p>
      <div style="margin: 20px 0; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
        <p><strong>Score:</strong> ${score.obtained}/${score.total} (${(score.obtained/score.total * 100).toFixed(2)}%)</p>
        <p><strong>Feedback:</strong></p>
        <p>${feedback}</p>
      </div>
      <p>You can view detailed results by logging into your account.</p>
    `
  }),

  accountVerification: (userName, verificationLink) => ({
    subject: 'Verify Your Email Address',
    html: `
      <h2>Email Verification</h2>
      <p>Hello ${userName},</p>
      <p>Please verify your email address by clicking the button below:</p>
      <div style="margin: 20px 0;">
        <a href="${verificationLink}" 
           style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Verify Email
        </a>
      </div>
      <p>If the button doesn't work, copy and paste this link in your browser:</p>
      <p>${verificationLink}</p>
      <p>This link will expire in 24 hours.</p>
    `
  })
};

export default transporter;