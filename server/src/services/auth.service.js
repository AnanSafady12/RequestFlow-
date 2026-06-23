// services/auth.service.js
// This file contains the BUSINESS LOGIC for authentication.
// Services handle the "how" — they talk to the database and do the work.
// Controllers (the next layer) just call these functions and send the response.
// Keeping them separate makes the code cleaner and easier to test.

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { generateVerificationCode } = require('../utils/generateCode');
const { sendVerificationEmail } = require('../utils/sendEmail');

// ─────────────────────────────────────────────
// REGISTER
// ─────────────────────────────────────────────

async function register(name, email, password, role) {
  // Step 1: Check if a user with this email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    // Throw an error — the controller will catch it and return 400
    const error = new Error('An account with this email already exists.');
    error.status = 400;
    throw error;
  }

  // Step 2: Hash the password before saving it
  // Never store plain text passwords in the database
  // bcrypt.hash() scrambles the password using 10 rounds of hashing
  const hashedPassword = await bcrypt.hash(password, 10);

  // Step 3: Generate a 6-digit verification code
  const code = generateVerificationCode();

  // Step 4: Set expiry — code is only valid for 10 minutes from now
  const codeExpiry = new Date(Date.now() + 10 * 60 * 1000); // now + 10 minutes

  // Step 5: Create the user in the database
  // isVerified is false by default — they can't log in until they verify
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role || 'STUDENT', // default to student if no role provided
      isVerified: false,
      verificationCode: code,
      verificationCodeExpiry: codeExpiry,
    },
  });

  // Step 6: Send the verification code to the user's email
  await sendVerificationEmail(email, code, name);

  // Return only safe fields — never return the password
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

// ─────────────────────────────────────────────
// VERIFY CODE
// ─────────────────────────────────────────────

async function verifyCode(email, code) {
  // Find the user by email
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const error = new Error('No account found with this email.');
    error.status = 404;
    throw error;
  }

  if (user.isVerified) {
    const error = new Error('This account is already verified. Please log in.');
    error.status = 400;
    throw error;
  }

  // Check if the code matches what we stored
  if (user.verificationCode !== code) {
    const error = new Error('Incorrect verification code.');
    error.status = 400;
    throw error;
  }

  // Check if the code has expired
  if (new Date() > user.verificationCodeExpiry) {
    const error = new Error('Verification code has expired. Please request a new one.');
    error.status = 400;
    throw error;
  }

  // All checks passed — activate the account
  // Clear the code and expiry so it can't be reused
  await prisma.user.update({
    where: { email },
    data: {
      isVerified: true,
      verificationCode: null,       // remove the code
      verificationCodeExpiry: null, // remove the expiry
    },
  });

  return { message: 'Email verified successfully. You can now log in.' };
}

// ─────────────────────────────────────────────
// RESEND CODE
// ─────────────────────────────────────────────

async function resendCode(email) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const error = new Error('No account found with this email.');
    error.status = 404;
    throw error;
  }

  if (user.isVerified) {
    const error = new Error('This account is already verified.');
    error.status = 400;
    throw error;
  }

  // Generate a fresh code with a new 10-minute window
  const newCode = generateVerificationCode();
  const newExpiry = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: { email },
    data: {
      verificationCode: newCode,
      verificationCodeExpiry: newExpiry,
    },
  });

  await sendVerificationEmail(email, newCode, user.name);

  return { message: 'A new verification code has been sent to your email.' };
}

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────

async function login(email, password) {
  // Find the user by email
  const user = await prisma.user.findUnique({ where: { email } });

  // Use a generic message — do not tell the user whether the email or password was wrong
  // (this prevents attackers from finding out which emails are registered)
  const genericError = new Error('Invalid email or password.');
  genericError.status = 401;

  if (!user) throw genericError;

  // Check if the password matches the hashed version in the database
  // bcrypt.compare() hashes the input and compares with the stored hash
  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) throw genericError;

  // Check if the user has verified their email
  if (!user.isVerified) {
    const error = new Error('Please verify your email before logging in.');
    error.status = 403;
    throw error;
  }

  // All checks passed — create a JWT token
  // jwt.sign() creates a signed token with the user info baked in
  // The token contains the user's id, role, and name
  // It is signed with JWT_SECRET so nobody can fake it
  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
      name: user.name,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d', // token expires after 7 days
    }
  );

  // Return the token and safe user info (no password)
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

// ─────────────────────────────────────────────
// GET CURRENT USER (me)
// ─────────────────────────────────────────────

async function getMe(userId) {
  // Find the user by their ID (which came from the JWT token)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      // Only return these fields — never return the password
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    const error = new Error('User not found.');
    error.status = 404;
    throw error;
  }

  return user;
}

module.exports = { register, verifyCode, resendCode, login, getMe };
