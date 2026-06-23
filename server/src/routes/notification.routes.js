// routes/notification.routes.js
// Defines the API endpoints for user notification counts and read logs.

const { Router } = require('express');
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/authenticate');

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: In-app notification logs and read states
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get all notifications for the logged-in user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 *       401:
 *         description: Not authenticated
 */
router.get('/', authenticate, notificationController.getNotifications);

/**
 * @swagger
 * /notifications/read-all:
 *   post:
 *     summary: Mark all notifications as read for the logged-in user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       401:
 *         description: Not authenticated
 */
router.post('/read-all', authenticate, notificationController.markAllAsRead);

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark a single notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification updated successfully
 *       403:
 *         description: Access denied (wrong user)
 *       404:
 *         description: Notification not found
 */
router.patch('/:id/read', authenticate, notificationController.markAsRead);

module.exports = router;
