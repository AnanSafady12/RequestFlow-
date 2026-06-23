// controllers/notification.controller.js
// Handles HTTP request payloads for retrieving and marking in-app notifications as read.

const notificationService = require('../services/notification.service');

// ─────────────────────────────────────────────
// GET /api/notifications
// Get all notifications for logged-in user
// ─────────────────────────────────────────────
async function getNotifications(req, res, next) {
  try {
    const userId = req.user.id;
    const notifications = await notificationService.getNotifications(userId);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// PATCH /api/notifications/:id/read
// Mark a notification as read
// ─────────────────────────────────────────────
async function markAsRead(req, res, next) {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;

    const notification = await notificationService.markAsRead(notificationId, userId);
    res.json(notification);
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
// POST /api/notifications/read-all
// Mark all notifications as read
// ─────────────────────────────────────────────
async function markAllAsRead(req, res, next) {
  try {
    const userId = req.user.id;
    await notificationService.markAllAsRead(userId);
    res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
