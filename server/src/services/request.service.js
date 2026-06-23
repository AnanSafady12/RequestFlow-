// services/request.service.js
// This file contains all the business logic for managing support requests.
// It interacts with the database via Prisma and coordinates activity logs.

const prisma = require('../config/db');
const { logActivity } = require('../utils/activityLogger');
const notificationService = require('./notification.service');
const { sendToUser, getIO } = require('../sockets/socket');

class RequestService {
  /**
   * Creates a new support request for a student.
   * @param {Object} data - Request details (title, description, category, priority)
   * @param {string} studentId - The ID of the student creating the request
   * @param {Object} [file] - Optional uploaded file info from multer
   */
  async createRequest(data, studentId, file) {
    const { title, description, category, priority } = data;

    // Validate required fields
    if (!title || !description || !category) {
      throw new Error('Title, description, and category are required.');
    }

    // Verify category is valid based on the enum in schema
    const allowedCategories = ['ADMIN', 'FINANCIAL', 'EXAMS', 'ENGLISH_DEPARTMENT', 'MEDICAL_APPROVAL'];
    if (!allowedCategories.includes(category)) {
      throw new Error(`Invalid category. Allowed values: ${allowedCategories.join(', ')}`);
    }

    // Verify priority is valid if provided
    if (priority) {
      const allowedPriorities = ['LOW', 'MEDIUM', 'HIGH'];
      if (!allowedPriorities.includes(priority)) {
        throw new Error(`Invalid priority. Allowed values: ${allowedPriorities.join(', ')}`);
      }
    }

    // Fetch student info to log their name
    const student = await prisma.user.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      throw new Error('Student not found.');
    }

    // Create the request and optional attachment in a transaction
    const newRequest = await prisma.$transaction(async (tx) => {
      // Automatically map priority based on category:
      // ADMIN, FINANCIAL, MEDICAL_APPROVAL -> HIGH
      // EXAMS -> MEDIUM
      // ENGLISH_DEPARTMENT -> LOW
      let mappedPriority = 'LOW';
      if (category === 'ADMIN' || category === 'FINANCIAL' || category === 'MEDICAL_APPROVAL') {
        mappedPriority = 'HIGH';
      } else if (category === 'EXAMS') {
        mappedPriority = 'MEDIUM';
      } else if (category === 'ENGLISH_DEPARTMENT') {
        mappedPriority = 'LOW';
      }

      // 1. Create the request record
      const request = await tx.request.create({
        data: {
          title,
          description,
          category,
          priority: mappedPriority,
          studentId,
        },
      });

      // 2. If a file was uploaded, create the attachment record
      if (file) {
        await tx.attachment.create({
          data: {
            filename: file.filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            uploadedById: studentId,
            requestId: request.id,
          },
        });
      }

      return request;
    });

    // 3. Log the creation activity (failsafe logger)
    await logActivity(
      'CREATED',
      `Request created by ${student.name}`,
      studentId,
      newRequest.id
    );

    // Return the request with its attachments
    return this.getRequestById(newRequest.id, studentId, student.role);
  }

  /**
   * Retrieves a list of requests.
   * Students see only their own requests.
   * Support agents see all requests in the system.
   * Includes advanced filters: status, priority, category, date range, search query, etc.
   */
  async listRequests(userId, role, filters = {}) {
    const { status, priority, category, dateFrom, dateTo, search, studentId } = filters;

    // Build the query filter conditions
    const where = {};

    // 1. Role-based scoping
    if (role === 'STUDENT') {
      where.studentId = userId;
    } else if (role === 'SUPPORT' && studentId) {
      // Support can optionally filter by a specific student
      where.studentId = studentId;
    }

    // 2. Status filter
    if (status) {
      where.status = status;
    }

    // 3. Priority filter
    if (priority) {
      where.priority = priority;
    }

    // 4. Category filter
    if (category) {
      where.category = category;
    }

    // 5. Date range filter
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    // 6. Search query (matches title or description)
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Fetch from database, including the student and assignee info
    return prisma.request.findMany({
      where,
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        attachments: {
          select: { id: true, originalName: true, mimetype: true, size: true, createdAt: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Retrieves a single request by ID with all its relations (comments, timeline, attachments).
   * Verifies access permission: students can only see their own requests.
   */
  async getRequestById(requestId, userId, role) {
    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        attachments: {
          select: { id: true, filename: true, originalName: true, mimetype: true, size: true, createdAt: true },
        },
        activities: {
          include: {
            user: { select: { name: true, role: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        // We fetch comments here; we can filter internal comments if user is student
        comments: {
          include: {
            author: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!request) {
      throw new Error('Request not found.');
    }

    // Enforce role-based access control
    if (role === 'STUDENT' && request.studentId !== userId) {
      throw new Error('Access denied. You can only view your own requests.');
    }

    // Filter out internal comments for students
    if (role === 'STUDENT') {
      request.comments = request.comments.filter(comment => !comment.isInternal);
    }

    return request;
  }

  /**
   * Updates request status, priority, or assignee (Support reps only).
   */
  async updateRequest(requestId, updateData, userId) {
    const { status, priority, assignedToId } = updateData;

    // Fetch existing request to check for changes
    const existing = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        assignedTo: { select: { name: true } },
      },
    });

    if (!existing) {
      throw new Error('Request not found.');
    }

    const updates = {};
    const logDetails = [];

    // 1. Handle status update
    if (status && status !== existing.status) {
      const allowedStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
      if (!allowedStatuses.includes(status)) {
        throw new Error(`Invalid status. Allowed values: ${allowedStatuses.join(', ')}`);
      }
      updates.status = status;
      logDetails.push({
        action: 'STATUS_CHANGED',
        description: `Status changed from ${existing.status} to ${status}`,
      });
    }

    // 2. Handle priority update
    if (priority && priority !== existing.priority) {
      const allowedPriorities = ['LOW', 'MEDIUM', 'HIGH'];
      if (!allowedPriorities.includes(priority)) {
        throw new Error(`Invalid priority. Allowed values: ${allowedPriorities.join(', ')}`);
      }
      updates.priority = priority;
      logDetails.push({
        action: 'PRIORITY_CHANGED',
        description: `Priority updated from ${existing.priority} to ${priority}`,
      });
    }

    // 3. Handle assignee update
    if (assignedToId !== undefined && assignedToId !== existing.assignedToId) {
      if (assignedToId === null) {
        updates.assignedToId = null;
        logDetails.push({
          action: 'ASSIGNEE_CHANGED',
          description: `Request unassigned (removed ${existing.assignedTo?.name || 'assignee'})`,
        });
      } else {
        // Validate that assignee is a support rep
        const supportRep = await prisma.user.findFirst({
          where: { id: assignedToId, role: 'SUPPORT' },
        });
        if (!supportRep) {
          throw new Error('Assignee must be a valid support agent.');
        }
        updates.assignedToId = assignedToId;
        logDetails.push({
          action: 'ASSIGNEE_CHANGED',
          description: `Assigned request to ${supportRep.name}`,
        });
      }
    }

    // If no changes, return the existing record
    if (Object.keys(updates).length === 0) {
      return this.getRequestById(requestId, userId, 'SUPPORT');
    }

    // Execute update in transaction
    const updatedRequest = await prisma.$transaction(async (tx) => {
      return tx.request.update({
        where: { id: requestId },
        data: updates,
      });
    });

    // Write all activity log entries
    for (const log of logDetails) {
      await logActivity(log.action, log.description, userId, requestId);
    }

    // Trigger in-app notifications and real-time Socket updates
    try {
      if (status && status !== existing.status) {
        await notificationService.createNotification(
          existing.studentId,
          `Your ticket "${existing.title}" status is now ${status}`,
          'STATUS_UPDATE',
          requestId
        );
      }
      if (priority && priority !== existing.priority) {
        await notificationService.createNotification(
          existing.studentId,
          `Your ticket "${existing.title}" priority has changed to ${priority}`,
          'PRIORITY_UPDATE',
          requestId
        );
      }
      if (assignedToId !== undefined && assignedToId !== existing.assignedToId && assignedToId !== null) {
        await notificationService.createNotification(
          existing.studentId,
          `Your ticket "${existing.title}" has been assigned.`,
          'ASSIGNEE_UPDATE',
          requestId
        );
      }

      // Send Socket.io event to the student for live updates
      sendToUser(existing.studentId, 'request:updated', { requestId, updates });

      // Also broadcast to support room so other agents looking at dashboard get live updates
      getIO().to('support_room').emit('request:updated', { requestId, updates });
    } catch (notifyErr) {
      console.error('⚠️  Failed to trigger update notifications:', notifyErr.message);
    }

    return this.getRequestById(requestId, userId, 'SUPPORT');
  }
}

module.exports = new RequestService();
