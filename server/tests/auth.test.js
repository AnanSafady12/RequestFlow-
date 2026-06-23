// tests/auth.test.js
// This file tests all the authentication endpoints in RequestFlow.
// It uses supertest to send HTTP requests to the Express application.

const request = require('supertest');
const { app } = require('../src/server');
const prisma = require('../src/config/db');
const { sendVerificationEmail } = require('../src/utils/sendEmail');

describe('🔑 Authentication System Tests', () => {
  const testUser = {
    name: 'Test Student',
    email: 'newstudent@test.com',
    password: 'password123',
    role: 'STUDENT',
  };

  test('1. POST /api/auth/register - Successfully register a new student (unverified)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.name).toBe(testUser.name);
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.user.role).toBe('STUDENT');
    expect(res.body.user).not.toHaveProperty('password');

    // Verify user was created in database and is not verified yet
    const dbUser = await prisma.user.findUnique({
      where: { email: testUser.email },
    });
    expect(dbUser).toBeTruthy();
    expect(dbUser.isVerified).toBe(false);
    expect(dbUser.verificationCode).toHaveLength(6);
    expect(dbUser.verificationCodeExpiry).toBeTruthy();

    // Verify email utility was called
    expect(sendVerificationEmail).toHaveBeenCalledTimes(1);
    expect(sendVerificationEmail).toHaveBeenCalledWith(
      testUser.email,
      dbUser.verificationCode,
      testUser.name
    );
  });

  test('2. POST /api/auth/register - Fail registering when email already exists', async () => {
    // Register the user once
    await request(app).post('/api/auth/register').send(testUser);
    sendVerificationEmail.mockClear();

    // Try registering again with the same email
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toContain('already exists');
    expect(sendVerificationEmail).not.toHaveBeenCalled();
  });

  test('3. POST /api/auth/verify-code - Fail verification with incorrect code', async () => {
    // Register
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/verify-code')
      .send({
        email: testUser.email,
        code: '000000', // incorrect code
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Incorrect verification code.');
  });

  test('4. POST /api/auth/verify-code - Successfully verify email with correct code', async () => {
    // Register
    await request(app).post('/api/auth/register').send(testUser);

    // Get code directly from database (simulating receipt of email)
    const dbUserBefore = await prisma.user.findUnique({
      where: { email: testUser.email },
    });

    const res = await request(app)
      .post('/api/auth/verify-code')
      .send({
        email: testUser.email,
        code: dbUserBefore.verificationCode,
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('verified successfully');

    // Check DB states are cleared and verified is true
    const dbUserAfter = await prisma.user.findUnique({
      where: { email: testUser.email },
    });
    expect(dbUserAfter.isVerified).toBe(true);
    expect(dbUserAfter.verificationCode).toBeNull();
    expect(dbUserAfter.verificationCodeExpiry).toBeNull();
  });

  test('5. POST /api/auth/resend-code - Successfully resend code and update expiry', async () => {
    // Register
    await request(app).post('/api/auth/register').send(testUser);
    const dbUserBefore = await prisma.user.findUnique({
      where: { email: testUser.email },
    });
    const oldCode = dbUserBefore.verificationCode;

    // Wait briefly to make sure timestamps would differ if updated, then resend
    sendVerificationEmail.mockClear();
    const res = await request(app)
      .post('/api/auth/resend-code')
      .send({ email: testUser.email });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('verification code has been sent');

    const dbUserAfter = await prisma.user.findUnique({
      where: { email: testUser.email },
    });
    expect(dbUserAfter.verificationCode).not.toBe(oldCode);
    expect(dbUserAfter.verificationCode).toHaveLength(6);
    expect(sendVerificationEmail).toHaveBeenCalledTimes(1);
  });

  test('6. POST /api/auth/login - Fail login when email is unverified', async () => {
    // Register (starts unverified)
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('verify your email');
  });

  test('7. POST /api/auth/login - Success login with verified account', async () => {
    // Register
    await request(app).post('/api/auth/register').send(testUser);
    const dbUser = await prisma.user.findUnique({
      where: { email: testUser.email },
    });

    // Verify
    await prisma.user.update({
      where: { email: testUser.email },
      data: { isVerified: true, verificationCode: null, verificationCodeExpiry: null },
    });

    // Login
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe(testUser.email);
  });

  test('8. GET /api/auth/me - Access profile when authenticated vs reject when unauthenticated', async () => {
    // Register, verify and login to get JWT
    await request(app).post('/api/auth/register').send(testUser);
    await prisma.user.update({
      where: { email: testUser.email },
      data: { isVerified: true, verificationCode: null, verificationCodeExpiry: null },
    });
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    
    const token = loginRes.body.token;

    // 1. Check access WITH token
    const resWithAuth = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(resWithAuth.status).toBe(200);
    expect(resWithAuth.body.email).toBe(testUser.email);
    expect(resWithAuth.body).not.toHaveProperty('password');

    // 2. Check access WITHOUT token
    const resNoAuth = await request(app).get('/api/auth/me');
    expect(resNoAuth.status).toBe(401);
  });
});
