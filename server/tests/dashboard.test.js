// tests/dashboard.test.js
// Tests for the Support Rep Dashboard analytics, average satisfaction ratings,
// and dynamic SLA breach checker.

const request = require('supertest');
const { app } = require('../src/server');
const prisma = require('../src/config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('📊 Dashboard & Analytics API Tests', () => {
  let student1, support1, support2;
  let student1Token, support1Token;

  beforeEach(async () => {
    // Hash password with 1 round for maximum speed in tests
    const hashedPassword = await bcrypt.hash('password123', 1);

    student1 = await prisma.user.create({
      data: {
        name: 'Student One',
        email: 'student1@test.com',
        password: hashedPassword,
        role: 'STUDENT',
        isVerified: true,
      },
    });

    support1 = await prisma.user.create({
      data: {
        name: 'Support Agent One',
        email: 'support1@test.com',
        password: hashedPassword,
        role: 'SUPPORT',
        isVerified: true,
      },
    });

    support2 = await prisma.user.create({
      data: {
        name: 'Support Agent Two',
        email: 'support2@test.com',
        password: hashedPassword,
        role: 'SUPPORT',
        isVerified: true,
      },
    });

    const signToken = (user) =>
      jwt.sign(
        { id: user.id, role: user.role, name: user.name },
        process.env.JWT_SECRET
      );

    student1Token = signToken(student1);
    support1Token = signToken(support1);
  });

  test('1. GET /api/dashboard/stats - Denied for students, allowed for support', async () => {
    // 1. Denied for student
    const resStudent = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${student1Token}`);
    expect(resStudent.status).toBe(403);

    // 2. Allowed for support
    const resSupport = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${support1Token}`);
    expect(resSupport.status).toBe(200);
    expect(resSupport.body).toHaveProperty('totalRequests');
  });

  test('2. GET /api/dashboard/stats - Compiles correct counts and category stats', async () => {
    // Create multiple tickets with different categories/statuses
    await prisma.request.create({
      data: {
        title: 'Exam issue',
        description: 'Detail',
        category: 'EXAMS',
        status: 'OPEN',
        priority: 'MEDIUM',
        studentId: student1.id,
      },
    });

    await prisma.request.create({
      data: {
        title: 'Billing issue',
        description: 'Detail',
        category: 'FINANCIAL',
        status: 'IN_PROGRESS',
        priority: 'LOW',
        studentId: student1.id,
      },
    });

    await prisma.request.create({
      data: {
        title: 'Stamp document',
        description: 'Detail',
        category: 'ADMIN',
        status: 'RESOLVED',
        priority: 'LOW',
        studentId: student1.id,
      },
    });

    const res = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${support1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.totalRequests).toBe(3);
    expect(res.body.openRequests).toBe(1);
    expect(res.body.inProgressRequests).toBe(1);
    expect(res.body.resolvedRequests).toBe(1);
  });

  test('3. Dynamic SLA breach scanning - Correctly flags overdue high-priority tickets', async () => {
    // Create a HIGH priority ticket created 25 hours ago (threshold is 24 hours)
    const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);
    const overdueTicket = await prisma.request.create({
      data: {
        title: 'Urgent Issue',
        description: 'Needs help now',
        category: 'ADMIN',
        priority: 'HIGH',
        status: 'OPEN',
        studentId: student1.id,
        createdAt: twentyFiveHoursAgo,
      },
    });

    // Create a MEDIUM priority ticket created 25 hours ago (threshold is 48 hours, so NOT breached yet)
    await prisma.request.create({
      data: {
        title: 'Medium Issue',
        description: 'Standard question',
        category: 'FINANCIAL',
        priority: 'MEDIUM',
        status: 'OPEN',
        studentId: student1.id,
        createdAt: twentyFiveHoursAgo,
      },
    });

    // Call stats endpoint to trigger the dynamic breach scanner
    const resStats = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${support1Token}`);

    expect(resStats.status).toBe(200);
    expect(resStats.body.slaBreaches).toBe(1); // Only the HIGH priority one is breached

    // Call breaches endpoint to list overdue tickets
    const resBreaches = await request(app)
      .get('/api/dashboard/sla-breaches')
      .set('Authorization', `Bearer ${support1Token}`);

    expect(resBreaches.status).toBe(200);
    expect(resBreaches.body).toHaveLength(1);
    expect(resBreaches.body[0].id).toBe(overdueTicket.id);
  });

  test('4. GET /api/dashboard/satisfaction - Compiles satisfaction scores per agent', async () => {
    // Create a resolved request assigned to support1 and rate it
    const ticket1 = await prisma.request.create({
      data: {
        title: 'Financial help',
        description: 'Detail',
        category: 'FINANCIAL',
        status: 'RESOLVED',
        studentId: student1.id,
        assignedToId: support1.id,
      },
    });

    await prisma.satisfactionRating.create({
      data: {
        rating: 5,
        studentId: student1.id,
        requestId: ticket1.id,
      },
    });

    // Create a resolved request assigned to support2 and rate it
    const ticket2 = await prisma.request.create({
      data: {
        title: 'Exam question',
        description: 'Detail',
        category: 'EXAMS',
        status: 'RESOLVED',
        studentId: student1.id,
        assignedToId: support2.id,
      },
    });

    await prisma.satisfactionRating.create({
      data: {
        rating: 3,
        studentId: student1.id,
        requestId: ticket2.id,
      },
    });

    const res = await request(app)
      .get('/api/dashboard/satisfaction')
      .set('Authorization', `Bearer ${support1Token}`);

    expect(res.status).toBe(200);
    
    // Find satisfaction scores for agents
    const rating1 = res.body.find((a) => a.id === support1.id);
    const rating2 = res.body.find((a) => a.id === support2.id);

    expect(rating1).toBeTruthy();
    expect(rating1.averageRating).toBe(5);
    expect(rating1.totalRatings).toBe(1);

    expect(rating2).toBeTruthy();
    expect(rating2.averageRating).toBe(3);
    expect(rating2.totalRatings).toBe(1);
  });
});
