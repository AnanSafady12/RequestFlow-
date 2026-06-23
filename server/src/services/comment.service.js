// services/comment.service.js
// This service handles business logic for request comments and activity timelines.

const prisma = require('../config/db');
const { logActivity } = require('../utils/activityLogger');

class CommentService {
  /**
   * Adds a new comment to a request.
   * Both students and support reps can comment.
   * Support reps can mark a comment as internal (not visible to students).
   */
  async createComment(requestId, authorId, authorRole, content, isInternal = false) {
    if (!content || content.trim() === '') {
      throw new Error('Comment content cannot be empty.');
    }

    // 1. Fetch request and check existence/access
    const request = await prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error('Request not found.');
    }

    // Students can only comment on their own requests
    if (authorRole === 'STUDENT' && request.studentId !== authorId) {
      throw new Error('Access denied. You can only comment on your own requests.');
    }

    // Students cannot make internal comments
    let commentIsInternal = isInternal;
    if (authorRole === 'STUDENT') {
      commentIsInternal = false;
    }

    // 2. Fetch author name for the log description
    const author = await prisma.user.findUnique({
      where: { id: authorId },
    });

    if (!author) {
      throw new Error('Author not found.');
    }

    // 3. Create comment in the database
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        isInternal: commentIsInternal,
        authorId,
        requestId,
      },
      include: {
        author: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    // 4. Log the activity
    // To protect confidentiality, if it's an internal note, the log description is generic
    const logDesc = commentIsInternal
      ? `${author.name} added an internal note`
      : `${author.name} added a comment`;

    await logActivity('COMMENT_ADDED', logDesc, authorId, requestId);

    return comment;
  }

  /**
   * Retrieves all comments for a request.
   * Students see only public comments. Support agents see all comments.
   */
  async getComments(requestId, userId, role) {
    // Check request access
    const request = await prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error('Request not found.');
    }

    if (role === 'STUDENT' && request.studentId !== userId) {
      throw new Error('Access denied. You can only view comments on your own requests.');
    }

    // Build comment query conditions
    const where = { requestId };
    if (role === 'STUDENT') {
      // Hide internal comments from students
      where.isInternal = false;
    }

    return prisma.comment.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  /**
   * Retrieves the activity log timeline for a request.
   */
  async getActivityTimeline(requestId, userId, role) {
    // Check request access
    const request = await prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error('Request not found.');
    }

    if (role === 'STUDENT' && request.studentId !== userId) {
      throw new Error('Access denied. You can only view the activity of your own requests.');
    }

    // Fetch activities, including the user who performed the action
    const activities = await prisma.activity.findMany({
      where: { requestId },
      include: {
        user: {
          select: { name: true, role: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // If student, filter out activities logging internal comments to keep notes strictly private
    if (role === 'STUDENT') {
      return activities.filter(activity => !activity.description.includes('internal note'));
    }

    return activities;
  }
}

module.exports = new CommentService();
