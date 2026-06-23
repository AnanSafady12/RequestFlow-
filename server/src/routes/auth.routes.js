// routes/auth.routes.js
// This file defines the URL paths for all authentication endpoints.
// It connects each URL path to its controller function.
// The authenticate middleware is used to protect the /me route.

const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/authenticate');

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User registration, login, and email verification
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ahmed Al-Student
 *               email:
 *                 type: string
 *                 example: ahmed@college.edu
 *               password:
 *                 type: string
 *                 example: mypassword123
 *               role:
 *                 type: string
 *                 enum: [STUDENT, SUPPORT]
 *                 example: STUDENT
 *     responses:
 *       201:
 *         description: Account created, verification code sent to email
 *       400:
 *         description: Missing fields or email already exists
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /auth/verify-code:
 *   post:
 *     summary: Verify email with the 6-digit code
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code]
 *             properties:
 *               email:
 *                 type: string
 *               code:
 *                 type: string
 *                 example: "482731"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Wrong code or code expired
 */
router.post('/verify-code', authController.verifyCode);

/**
 * @swagger
 * /auth/resend-code:
 *   post:
 *     summary: Resend a new verification code to the user's email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: New code sent
 */
router.post('/resend-code', authController.resendCode);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and receive a JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: student@test.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful, returns token and user
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Email not verified yet
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get the currently logged-in user's info
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns user info
 *       401:
 *         description: Not authenticated
 */
// authenticate middleware runs first — it checks the JWT token
// Only if the token is valid will it call authController.getMe
router.get('/me', authenticate, authController.getMe);

module.exports = router;
