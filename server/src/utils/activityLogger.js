// utils/activityLogger.js
// This utility function writes a log entry to the Activity table.
// Every time something important happens on a request (status change,
// comment added, priority changed, etc.), we call this function.
// It builds the timeline that shows on the request detail page.

const prisma = require('../config/db');

/**
 * Logs an activity entry for a request.
 * @param {string} action - short code like "STATUS_CHANGED" or "COMMENT_ADDED"
 * @param {string} description - human-readable text like "Status changed from Open to In Progress"
 * @param {string} userId - the ID of the user who performed the action
 * @param {string} requestId - the ID of the request this action happened on
 */
async function logActivity(action, description, userId, requestId) {
  try {
    await prisma.activity.create({
      data: {
        action,
        description,
        userId,
        requestId,
      },
    });
  } catch (error) {
    // If logging fails, we just print the error but do NOT crash the app.
    // The main action (like saving a comment) already succeeded — the log is secondary.
    console.error('⚠️  Failed to log activity:', error.message);
  }
}

module.exports = { logActivity };
