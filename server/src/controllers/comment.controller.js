// controllers/comment.controller.js
// Handles HTTP request payloads for requests comments and history timelines,
// calling corresponding comment services.

const commentService = require('../services/comment.service');

// ─────────────────────────────────────────────
// POST /api/requests/:id/comments
// Add a comment to a request (Student or Support)
// ─────────────────────────────────────────────
async function createComment(req, res, next) {
  try {
    const requestId = req.params.id;
    const authorId = req.user.id;
    const authorRole = req.user.role;
    const { content, isInternal } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Comment content is required.' });
    }

    const comment = await commentService.createComment(
      requestId,
      authorId,
      authorRole,
      content,
      isInternal
    );

    res.status(201).json(comment);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('Access denied')) {
      return res.status(403).json({ error: error.message });
    }
    next(error);
  }
}

// ─────────────────────────────────────────────
// GET /api/requests/:id/comments
// View comments thread (filtered by role permissions)
// ─────────────────────────────────────────────
async function getComments(req, res, next) {
  try {
    const requestId = req.params.id;
    const userId = req.user.id;
    const role = req.user.role;

    const comments = await commentService.getComments(requestId, userId, role);
    res.json(comments);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('Access denied')) {
      return res.status(403).json({ error: error.message });
    }
    next(error);
  }
}

// ─────────────────────────────────────────────
// GET /api/requests/:id/activity
// View timeline log history for a request
// ─────────────────────────────────────────────
async function getActivityTimeline(req, res, next) {
  try {
    const requestId = req.params.id;
    const userId = req.user.id;
    const role = req.user.role;

    const timeline = await commentService.getActivityTimeline(requestId, userId, role);
    res.json(timeline);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('Access denied')) {
      return res.status(403).json({ error: error.message });
    }
    next(error);
  }
}

module.exports = {
  createComment,
  getComments,
  getActivityTimeline,
};
