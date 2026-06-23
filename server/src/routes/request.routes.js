// routes/request.routes.js
// This file defines the API endpoints for support requests.
// It maps URLs to controller functions and protects routes with roles.

const { Router } = require('express');
const requestController = require('../controllers/request.controller');
const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');
const { upload } = require('../middleware/upload');

const router = Router();

// A wrapper middleware to handle Multer upload errors gracefully
// (e.g. file size exceeded or invalid file type) without triggering a 500 error.
function handleUpload(req, res, next) {
  const uploadSingle = upload.single('file');
  uploadSingle(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}

/**
 * @swagger
 * tags:
 *   name: Requests
 *   description: Student support ticket management and tracking
 */

/**
 * @swagger
 * /requests:
 *   post:
 *     summary: Create a new support request (Student only)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, description, category]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Unable to register for courses
 *               description:
 *                 type: string
 *                 example: I keep receiving a registration hold error code 403 on portal.
 *               category:
 *                 type: string
 *                 enum: [ADMIN, FINANCIAL, EXAMS, ENGLISH_DEPARTMENT, MEDICAL_APPROVAL]
 *                 example: ADMIN
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *                 example: LOW
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Optional attachment (Image or PDF, max 5MB)
 *     responses:
 *       201:
 *         description: Request created successfully
 *       400:
 *         description: Invalid inputs or file too large/unsupported
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Forbidden (only students can create requests)
 */
router.post('/', authenticate, authorize('STUDENT'), handleUpload, requestController.createRequest);

/**
 * @swagger
 * /requests:
 *   get:
 *     summary: Get lists of support requests (Student sees own, Support sees all)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [OPEN, IN_PROGRESS, RESOLVED, CLOSED]
 *         description: Filter requests by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH]
 *         description: Filter requests by priority
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [ADMIN, FINANCIAL, EXAMS, ENGLISH_DEPARTMENT, MEDICAL_APPROVAL]
 *         description: Filter requests by category
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter (YYYY-MM-DD)
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter (YYYY-MM-DD)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query matched against title and description (case-insensitive)
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *         description: Filter requests by a specific student ID (Support only)
 *     responses:
 *       200:
 *         description: A list of requests
 *       401:
 *         description: Not authenticated
 */
router.get('/', authenticate, requestController.listRequests);

/**
 * @swagger
 * /requests/search:
 *   get:
 *     summary: Search and filter support requests (same parameters as GET /requests)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *         description: Filter by priority
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: A list of filtered requests
 *       401:
 *         description: Not authenticated
 */
router.get('/search', authenticate, requestController.listRequests);

/**
 * @swagger
 * /requests/{id}:
 *   get:
 *     summary: Retrieve single request details (timeline + comments + attachments)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID
 *     responses:
 *       200:
 *         description: Detailed request object returned
 *       403:
 *         description: Access denied (student trying to read another student's request)
 *       404:
 *         description: Request not found
 */
router.get('/:id', authenticate, requestController.getRequestById);

/**
 * @swagger
 * /requests/{id}:
 *   patch:
 *     summary: Update request status, priority, or assign support rep (Support only)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [OPEN, IN_PROGRESS, RESOLVED, CLOSED]
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *               assignedToId:
 *                 type: string
 *                 nullable: true
 *                 description: User ID of the support rep to assign, or null to unassign
 *     responses:
 *       200:
 *         description: Request updated successfully
 *       400:
 *         description: Invalid status/priority or assignee is not support role
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Access denied (non-support users)
 *       404:
 *         description: Request not found
 */
router.patch('/:id', authenticate, authorize('SUPPORT'), requestController.updateRequest);

module.exports = router;
