// utils/sendEmail.js
// This file handles sending emails using Nodemailer and Gmail.
// We use it to send the 6-digit verification code to new users.
// The Gmail credentials come from the .env file.

const nodemailer = require('nodemailer');

// Create a "transporter" — this is the email sender.
// It connects to Gmail using the credentials in .env.
// nodemailer.createTransport() tells Nodemailer HOW to send the email.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // the Gmail address we send FROM
    pass: process.env.EMAIL_PASS, // the Gmail App Password (NOT your regular Gmail password)
  },
});

/**
 * Sends a 6-digit verification code to the user's email.
 * @param {string} toEmail - the recipient's email address
 * @param {string} code - the 6-digit code to send
 * @param {string} userName - the user's name (used in the greeting)
 */
async function sendVerificationEmail(toEmail, code, userName) {
  // mailOptions defines the email content
  const mailOptions = {
    from: process.env.EMAIL_FROM, // e.g. "RequestFlow <noreply@gmail.com>"
    to: toEmail,
    subject: 'RequestFlow — Your Verification Code',
    // html property lets us send a styled HTML email
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        
        <h2 style="color: #2563eb;">RequestFlow 🎓</h2>
        <p>Hi <strong>${userName}</strong>,</p>
        <p>Welcome to RequestFlow! Please verify your email address using the code below:</p>
        
        <!-- The big code box -->
        <div style="
          background: #f0f4ff;
          border: 2px solid #2563eb;
          border-radius: 10px;
          padding: 20px;
          text-align: center;
          margin: 30px 0;
        ">
          <p style="margin: 0; font-size: 14px; color: #666;">Your verification code</p>
          <h1 style="
            margin: 10px 0;
            font-size: 48px;
            letter-spacing: 10px;
            color: #2563eb;
            font-weight: bold;
          ">${code}</h1>
          <p style="margin: 0; font-size: 12px; color: #999;">This code expires in 10 minutes</p>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          If you did not create an account on RequestFlow, please ignore this email.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">RequestFlow — College Support Request System</p>
      </div>
    `,
  };

  // transporter.sendMail() actually sends the email
  // We await it because sending takes a moment
  await transporter.sendMail(mailOptions);
}

/**
 * Sends a notification email when a request status changes.
 * @param {string} toEmail - the student's email
 * @param {string} userName - the student's name
 * @param {string} requestTitle - the title of the request
 * @param {string} newStatus - the new status (e.g. "IN_PROGRESS")
 */
async function sendStatusUpdateEmail(toEmail, userName, requestTitle, newStatus) {
  // Convert the status from "IN_PROGRESS" to "In Progress" for display
  const readableStatus = newStatus.replace('_', ' ');

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: `RequestFlow — Your request status was updated`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">RequestFlow 🎓</h2>
        <p>Hi <strong>${userName}</strong>,</p>
        <p>Your support request has been updated:</p>
        <div style="background: #f0f4ff; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold;">${requestTitle}</p>
          <p style="margin: 8px 0 0 0; color: #2563eb;">New status: <strong>${readableStatus}</strong></p>
        </div>
        <p>Log in to RequestFlow to view the full details and any new comments.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">RequestFlow — College Support Request System</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = { sendVerificationEmail, sendStatusUpdateEmail };
