import transporter from "../config/nodemailer.js";
import dotenv from "dotenv";

dotenv.config();

export const sendVerificationEmail = async (email, verificationToken) => {
  var mailOptions = {
    from: process.env.EMAIL_SERVICES_USER,
    to: email,
    subject: "Verify Your Email",
    text: `Click <a href="http://yourfrontend.com/verify/${verificationToken}">here</a> to verify your email ${email}.`,
  };
  await transporter.sendMail(mailOptions, async (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log(info.response);
    }
  });
};

export const sendPasswordResetEmail = async (email, resetToken) => {
  await transporter.sendMail({
    from: process.env.EMAIL_SERVICE_USER,
    to: email,
    subject: "Password Reset Request",
    html: `Click <a href="http://yourfrontend.com/reset-password/${resetToken}">here</a> to reset your password. This link will expire in 1 hour.`,
  });
};
