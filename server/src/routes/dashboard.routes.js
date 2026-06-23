// routes/dashboard.routes.js
// This file defines the API endpoints for the support representative dashboard analytics,
// SLA breaches listings, and agent satisfaction scoreboards.

const { Router } = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Analytical reports and performance logs (Support reps only)
 */

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Retrieve total requests count, category groups, response time averages, and breaches (Support only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats compiled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRequests:
 *                   type: integer
 *                 openRequests:
 *                   type: integer
 *                 inProgressRequests:
 *                   type: integer
 *                 resolvedRequests:
 *                   type: integer
 *                 closedRequests:
 *                   type: integer
 *                 avgResponseTime:
 *                   type: number
 *                   description: Average elapsed hours from OPEN to IN_PROGRESS
 *                 slaBreaches:
 *                   type: integer
 *                 avgSatisfaction:
 *                   type: number
 *                 topCategory:
 *                   type: string
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Access denied (Students)
 */
router.get('/stats', authenticate, authorize('SUPPORT'), dashboardController.getStats);

/**
 * @swagger
 * /dashboard/sla-breaches:
 *   get:
 *     summary: Retrieve details of requests that exceeded response deadlines (Support only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of breached requests
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Access denied
 */
router.get('/sla-breaches', authenticate, authorize('SUPPORT'), dashboardController.getSlaBreaches);

/**
 * @swagger
 * /dashboard/satisfaction:
 *   get:
 *     summary: Retrieve ranking cards showing average student feedback rating per support agent (Support only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rankings compiled successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Access denied
 */
router.get('/satisfaction', authenticate, authorize('SUPPORT'), dashboardController.getSatisfactionPerAgent);

module.exports = router;
