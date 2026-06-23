// tests/requests.test.js
// Tests for support request creation, role scoping, status updates,
// comments thread visibility, activity logging, and satisfaction feedback ratings.

const request = require('supertest');
const { app } = require('../src/server');
const prisma = require('../src/config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('📋 Requests, Comments & Feedback API Tests', () => {
  let student1, student2, support1;
  let student1Token, student2Token, support1Token;

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

    student2 = await prisma.user.create({
      data: {
        name: 'Student Two',
        email: 'student2@test.com',
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

    const signToken = (user) =>
      jwt.sign(
        { id: user.id, role: user.role, name: user.name },
        process.env.JWT_SECRET
      );

    student1Token = signToken(student1);
    student2Token = signToken(student2);
    support1Token = signToken(support1);
  });

  // Helper to create a request directly via database
  const createRequestDirectly = async (studentId, title, details = {}) => {
    return prisma.request.create({
      data: {
        title,
        description: details.description || 'Description details',
        category: details.category || 'ADMIN',
        priority: details.priority || 'LOW',
        status: details.status || 'OPEN',
        studentId,
        assignedToId: details.assignedToId || null,
      },
    });
  };

  describe('1. POST /api/requests - Create Requests', () => {
    test('Student can create a request with valid parameters', async () => {
      const res = await request(app)
        .post('/api/requests')
        .set('Authorization', `Bearer ${student1Token}`)
        .field('title', 'Exam Appeal')
        .field('description', 'Requesting review of math exam')
        .field('category', 'EXAMS')
        .field('priority', 'MEDIUM');

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('Exam Appeal');
      expect(res.body.status).toBe('OPEN');
      expect(res.body.priority).toBe('MEDIUM');
      expect(res.body.category).toBe('EXAMS');
      expect(res.body.student.id).toBe(student1.id);

      // Verify activity log was created
      const logs = await prisma.activity.findMany({
        where: { requestId: res.body.id },
      });
      expect(logs).toHaveLength(1);
      expect(logs[0].action).toBe('CREATED');
    });

    test('Support agent cannot create a request', async () => {
      const res = await request(app)
        .post('/api/requests')
        .set('Authorization', `Bearer ${support1Token}`)
        .field('title', 'Exam Appeal')
        .field('description', 'Requesting review of math exam')
        .field('category', 'EXAMS');

      expect(res.status).toBe(403);
    });

    test('Fails on missing required fields', async () => {
      const res = await request(app)
        .post('/api/requests')
        .set('Authorization', `Bearer ${student1Token}`)
        .field('title', 'Missing details')
        .field('category', 'EXAMS'); // missing description

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('required');
    });

    test('Fails on invalid category or priority', async () => {
      const res = await request(app)
        .post('/api/requests')
        .set('Authorization', `Bearer ${student1Token}`)
        .field('title', 'Bad enum value')
        .field('description', 'Testing constraints')
        .field('category', 'SPORTS') // invalid category
        .field('priority', 'URGENT'); // invalid priority

      expect(res.status).toBe(400);
    });
  });

  describe('2. GET /api/requests - Listing and Role Scoping', () => {
    test('Student can only view their own requests', async () => {
      // Create request for student1 and student2
      await createRequestDirectly(student1.id, "Student 1's Ticket");
      await createRequestDirectly(student2.id, "Student 2's Ticket");

      const res = await request(app)
        .get('/api/requests')
        .set('Authorization', `Bearer ${student1Token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].title).toBe("Student 1's Ticket");
    });

    test('Support agent can view all requests', async () => {
      await createRequestDirectly(student1.id, "Student 1's Ticket");
      await createRequestDirectly(student2.id, "Student 2's Ticket");

      const res = await request(app)
        .get('/api/requests')
        .set('Authorization', `Bearer ${support1Token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });
  });

  describe('3. GET /api/requests/:id - Fetch Single Request Details', () => {
    test('Student can view own request detail, but denied for other student request', async () => {
      const ticket1 = await createRequestDirectly(student1.id, 'My Ticket');
      const ticket2 = await createRequestDirectly(student2.id, 'Other Ticket');

      // 1. Can view own
      const resOwn = await request(app)
        .get(`/api/requests/${ticket1.id}`)
        .set('Authorization', `Bearer ${student1Token}`);
      expect(resOwn.status).toBe(200);
      expect(resOwn.body.title).toBe('My Ticket');

      // 2. Denied viewing other student's ticket
      const resOther = await request(app)
        .get(`/api/requests/${ticket2.id}`)
        .set('Authorization', `Bearer ${student1Token}`);
      expect(resOther.status).toBe(403);
    });

    test('Support rep can view any student request', async () => {
      const ticket1 = await createRequestDirectly(student1.id, 'Student Ticket');

      const res = await request(app)
        .get(`/api/requests/${ticket1.id}`)
        .set('Authorization', `Bearer ${support1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Student Ticket');
    });
  });

  describe('4. PATCH /api/requests/:id - Status/Priority/Assignee Updates', () => {
    test('Support can assign request and update status/priority', async () => {
      const ticket = await createRequestDirectly(student1.id, 'Inquiry');

      const res = await request(app)
        .patch(`/api/requests/${ticket.id}`)
        .set('Authorization', `Bearer ${support1Token}`)
        .send({
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          assignedToId: support1.id,
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('IN_PROGRESS');
      expect(res.body.priority).toBe('HIGH');
      expect(res.body.assignedTo.id).toBe(support1.id);

      // Verify activity log has been recorded for the updates
      const logs = await prisma.activity.findMany({
        where: { requestId: ticket.id },
      });
      // We expect STATUS_CHANGED, PRIORITY_CHANGED, and ASSIGNEE_CHANGED activity logs
      expect(logs.length).toBeGreaterThanOrEqual(2);
    });

    test('Student cannot perform updates (forbidden)', async () => {
      const ticket = await createRequestDirectly(student1.id, 'Inquiry');

      const res = await request(app)
        .patch(`/api/requests/${ticket.id}`)
        .set('Authorization', `Bearer ${student1Token}`)
        .send({
          status: 'IN_PROGRESS',
        });

      expect(res.status).toBe(403);
    });
  });

  describe('5. Comments System & Timeline Visibility', () => {
    test('Student can add comment to own request, support can add public/internal comments', async () => {
      const ticket = await createRequestDirectly(student1.id, 'Ticket');

      // 1. Student adds comment
      const resStudent = await request(app)
        .post(`/api/requests/${ticket.id}/comments`)
        .set('Authorization', `Bearer ${student1Token}`)
        .send({ content: 'Student public reply' });
      expect(resStudent.status).toBe(201);

      // 2. Support adds public comment
      const resSupportPub = await request(app)
        .post(`/api/requests/${ticket.id}/comments`)
        .set('Authorization', `Bearer ${support1Token}`)
        .send({ content: 'Support public reply', isInternal: false });
      expect(resSupportPub.status).toBe(201);

      // 3. Support adds internal comment
      const resSupportInt = await request(app)
        .post(`/api/requests/${ticket.id}/comments`)
        .set('Authorization', `Bearer ${support1Token}`)
        .send({ content: 'Support internal notes', isInternal: true });
      expect(resSupportInt.status).toBe(201);

      // 4. Fetch comments as student: sees only the 2 public comments
      const resGetStudent = await request(app)
        .get(`/api/requests/${ticket.id}/comments`)
        .set('Authorization', `Bearer ${student1Token}`);
      expect(resGetStudent.status).toBe(200);
      expect(resGetStudent.body).toHaveLength(2);
      expect(resGetStudent.body.some(c => c.isInternal)).toBe(false);

      // 5. Fetch comments as support: sees all 3 comments
      const resGetSupport = await request(app)
        .get(`/api/requests/${ticket.id}/comments`)
        .set('Authorization', `Bearer ${support1Token}`);
      expect(resGetSupport.status).toBe(200);
      expect(resGetSupport.body).toHaveLength(3);
    });

    test('Denied adding comment on another student request', async () => {
      const ticket = await createRequestDirectly(student2.id, 'Ticket');

      const res = await request(app)
        .post(`/api/requests/${ticket.id}/comments`)
        .set('Authorization', `Bearer ${student1Token}`)
        .send({ content: 'Malicious comment' });

      expect(res.status).toBe(403);
    });
  });

  describe('6. POST /api/requests/:id/rate - Satisfaction Feedback', () => {
    test('Student can submit rating on resolved/closed ticket', async () => {
      const ticket = await createRequestDirectly(student1.id, 'Resolved Ticket', {
        status: 'RESOLVED',
      });

      const res = await request(app)
        .post(`/api/requests/${ticket.id}/rate`)
        .set('Authorization', `Bearer ${student1Token}`)
        .send({ rating: 5 });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('Rating saved');

      // Verify stored in DB
      const rating = await prisma.satisfactionRating.findUnique({
        where: { requestId: ticket.id },
      });
      expect(rating).toBeTruthy();
      expect(rating.rating).toBe(5);
    });

    test('Fails when ticket is still open/in-progress', async () => {
      const ticket = await createRequestDirectly(student1.id, 'Open Ticket', {
        status: 'OPEN',
      });

      const res = await request(app)
        .post(`/api/requests/${ticket.id}/rate`)
        .set('Authorization', `Bearer ${student1Token}`)
        .send({ rating: 5 });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('resolved or closed');
    });

    test('Fails on invalid rating score (e.g. 6 or 0)', async () => {
      const ticket = await createRequestDirectly(student1.id, 'Resolved Ticket', {
        status: 'RESOLVED',
      });

      const res = await request(app)
        .post(`/api/requests/${ticket.id}/rate`)
        .set('Authorization', `Bearer ${student1Token}`)
        .send({ rating: 6 });

      expect(res.status).toBe(400);
    });
  });
});
