// it is the nodemailer.js file

import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_SERVICES_USER,
    pass: process.env.EMAIL_SERVICES_PASS,
  },
});

export default transporter;
