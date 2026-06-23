// controllers/auth.controller.js
// Controllers are the "middle layer" between routes and services.
// They receive the HTTP request, pull out the data, call the service,
// then send the response back to the client.
// They do NOT contain business logic — that lives in the service file.

const authService = require('../services/auth.service');

// ─────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────

async function register(req, res, next) {
  try {
    // Pull the fields we need from the request body
    const { name, email, password, role } = req.body;

    // Basic validation — make sure all required fields are present
    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Name, email, and password are required.',
      });
    }

    // Password must be at least 6 characters
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long.',
      });
    }

    // Call the service to do the actual work
    const result = await authService.register(name, email, password, role);

    // 201 = Created successfully
    res.status(201).json({
      message: 'Account created! A 6-digit verification code has been sent to your email.',
      user: result,
    });
  } catch (error) {
    // Pass the error to the global error handler in server.js
    next(error);
  }
}

// ─────────────────────────────────────────────
// POST /api/auth/verify-code
// ─────────────────────────────────────────────

async function verifyCode(req, res, next) {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        error: 'Email and verification code are required.',
      });
    }

    const result = await authService.verifyCode(email, code);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// POST /api/auth/resend-code
// ─────────────────────────────────────────────

async function resendCode(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    const result = await authService.resendCode(email);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required.',
      });
    }

    const result = await authService.login(email, password);
    res.json(result); // returns { token, user }
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// GET /api/auth/me
// This route is protected — only logged-in users can call it
// The authenticate middleware runs before this and sets req.user
// ─────────────────────────────────────────────

async function getMe(req, res, next) {
  try {
    // req.user.id was set by the authenticate middleware from the JWT token
    const user = await authService.getMe(req.user.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
}

module.exports = { register, verifyCode, resendCode, login, getMe };
