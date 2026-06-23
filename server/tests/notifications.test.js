// tests/notifications.test.js
// Tests for user notifications fetching and read state updates.

const request = require('supertest');
const { app } = require('../src/server');
const prisma = require('../src/config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('🔔 Notifications API Tests', () => {
  let student1, student2;
  let student1Token, student2Token;

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

    const signToken = (user) =>
      jwt.sign(
        { id: user.id, role: user.role, name: user.name },
        process.env.JWT_SECRET
      );

    student1Token = signToken(student1);
    student2Token = signToken(student2);
  });

  test('1. GET /api/notifications - List user-specific notifications', async () => {
    // Create notifications for both students
    await prisma.notification.create({
      data: {
        message: 'Notification for student 1',
        type: 'STATUS_UPDATE',
        userId: student1.id,
      },
    });

    await prisma.notification.create({
      data: {
        message: 'Notification for student 2',
        type: 'STATUS_UPDATE',
        userId: student2.id,
      },
    });

    // Student 1 fetches notifications
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${student1Token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].message).toBe('Notification for student 1');
    expect(res.body[0].userId).toBe(student1.id);
  });

  test('2. PATCH /api/notifications/:id/read - Mark a single notification as read', async () => {
    const notif = await prisma.notification.create({
      data: {
        message: 'Alert text',
        type: 'COMMENT_NEW',
        userId: student1.id,
        isRead: false,
      },
    });

    // 1. Try marking as read with wrong user (student 2) -> Forbidden 403
    const resWrong = await request(app)
      .patch(`/api/notifications/${notif.id}/read`)
      .set('Authorization', `Bearer ${student2Token}`);
    expect(resWrong.status).toBe(403);

    // 2. Mark as read with correct user -> Success 200
    const res = await request(app)
      .patch(`/api/notifications/${notif.id}/read`)
      .set('Authorization', `Bearer ${student1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.isRead).toBe(true);

    // Verify change in DB
    const dbNotif = await prisma.notification.findUnique({
      where: { id: notif.id },
    });
    expect(dbNotif.isRead).toBe(true);
  });

  test('3. POST /api/notifications/read-all - Mark all user notifications as read', async () => {
    // Create unread notifications for student 1
    await prisma.notification.create({
      data: { message: 'Alert 1', type: 'STATUS_UPDATE', userId: student1.id, isRead: false },
    });
    await prisma.notification.create({
      data: { message: 'Alert 2', type: 'COMMENT_NEW', userId: student1.id, isRead: false },
    });

    // Create an unread notification for student 2 (should not be marked read)
    const notifS2 = await prisma.notification.create({
      data: { message: 'Alert 3', type: 'STATUS_UPDATE', userId: student2.id, isRead: false },
    });

    const res = await request(app)
      .post('/api/notifications/read-all')
      .set('Authorization', `Bearer ${student1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('marked as read');

    // Verify all notifications of student 1 are now read
    const s1UnreadCount = await prisma.notification.count({
      where: { userId: student1.id, isRead: false },
    });
    expect(s1UnreadCount).toBe(0);

    // Verify student 2's notification is still unread
    const dbNotifS2 = await prisma.notification.findUnique({
      where: { id: notifS2.id },
    });
    expect(dbNotifS2.isRead).toBe(false);
  });
});
