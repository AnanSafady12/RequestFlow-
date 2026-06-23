// services/notification.service.js
// Handles database operations for in-app notifications and coordinates real-time Socket.io transmissions.

const prisma = require('../config/db');
const { sendToUser } = require('../sockets/socket');

class NotificationService {
  /**
   * Creates an in-app notification record and pushes it in real-time if the user is online.
   * @param {string} userId - Recipient user ID
   * @param {string} message - Notification text content
   * @param {string} type - Notification action type (e.g., "STATUS_UPDATE", "NEW_COMMENT")
   * @param {string} [requestId] - Associated ticket ID (optional)
   */
  async createNotification(userId, message, type, requestId) {
    try {
      // 1. Create notification in database
      const notification = await prisma.notification.create({
        data: {
          userId,
          message,
          type,
          requestId,
        },
      });

      // 2. Emit real-time message through sockets
      sendToUser(userId, 'notification:new', notification);

      return notification;
    } catch (error) {
      // Print warning but do not crash parent request workflow (graceful fallback)
      console.error('⚠️  Failed to create notification:', error.message);
    }
  }

  /**
   * Retrieves all notifications for a logged-in user.
   */
  async getNotifications(userId) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Marks a specific notification as read.
   */
  async markAsRead(notificationId, userId) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification not found.');
    }

    if (notification.userId !== userId) {
      throw new Error('Access denied.');
    }

    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  /**
   * Marks all notifications as read for a user.
   */
  async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}

module.exports = new NotificationService();
