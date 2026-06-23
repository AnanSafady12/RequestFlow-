// utils/sendEmail.js
// This file handles sending emails using Nodemailer and Gmail.
// It will fall back to printing verification codes to the console if
// credentials are not set in the .env file.

const nodemailer = require('nodemailer');

// Check if credentials are real (not default placeholders)
const isEmailConfigured =
  process.env.EMAIL_USER &&
  process.env.EMAIL_USER !== 'your_gmail@gmail.com' &&
  process.env.EMAIL_PASS &&
  process.env.EMAIL_PASS !== 'your_gmail_app_password';

let transporter = null;
if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

/**
 * Sends a 6-digit verification code to the user's email.
 * @param {string} toEmail - the recipient's email address
 * @param {string} code - the 6-digit code to send
 * @param {string} userName - the user's name (used in the greeting)
 */
async function sendVerificationEmail(toEmail, code, userName) {
  if (isEmailConfigured && transporter) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'RequestFlow <noreply@gmail.com>',
      to: toEmail,
      subject: 'RequestFlow — Your Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">RequestFlow 🎓</h2>
          <p>Hi <strong>${userName}</strong>,</p>
          <p>Welcome to RequestFlow! Please verify your email address using the code below:</p>
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
    await transporter.sendMail(mailOptions);
  } else {
    // Fallback: print to the console logs in a clean visual card
    console.log('\n┌────────────────────────────────────────────────────────┐');
    console.log('│ 🎓 REQUESTFLOW LOCAL DEV MAIL FALLBACK                  │');
    console.log(`│ To: ${toEmail.padEnd(51 - toEmail.length)}│`);
    console.log(`│ Name: ${userName.padEnd(49 - userName.length)}│`);
    console.log('│                                                        │');
    console.log(`│ Your 6-Digit Email Verification Code:                  │`);
    console.log(`│               👉  ${code}  👈                               │`);
    console.log('│                                                        │');
    console.log('│ (Paste this code in the email verification UI)         │');
    console.log('└────────────────────────────────────────────────────────┘\n');
  }
}

/**
 * Sends a notification email when a request status changes.
 * @param {string} toEmail - the student's email
 * @param {string} userName - the student's name
 * @param {string} requestTitle - the title of the request
 * @param {string} newStatus - the new status (e.g. "IN_PROGRESS")
 */
async function sendStatusUpdateEmail(toEmail, userName, requestTitle, newStatus) {
  const readableStatus = newStatus.replace('_', ' ');

  if (isEmailConfigured && transporter) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'RequestFlow <noreply@gmail.com>',
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
  } else {
    // Fallback: print to console
    console.log('\n┌────────────────────────────────────────────────────────┐');
    console.log('│ 🎓 REQUESTFLOW LOCAL DEV MAIL FALLBACK                  │');
    console.log(`│ To: ${toEmail.padEnd(51 - toEmail.length)}│`);
    console.log(`│ Ticket: "${requestTitle.substring(0, 30)}${requestTitle.length > 30 ? '...' : ''}"`.padEnd(57) + '│');
    console.log(`│ Status Update: ${readableStatus.padEnd(40 - readableStatus.length)}│`);
    console.log('└────────────────────────────────────────────────────────┘\n');
  }
}

module.exports = { sendVerificationEmail, sendStatusUpdateEmail };
