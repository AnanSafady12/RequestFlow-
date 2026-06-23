// controllers/request.controller.js
// Handles HTTP requests for support tickets, formats inputs, calls the service,
// and returns standard JSON responses.

const requestService = require('../services/request.service');

// ─────────────────────────────────────────────
// POST /api/requests
// Create a new request (Student only)
// ─────────────────────────────────────────────
async function createRequest(req, res, next) {
  try {
    const { title, description, category, priority } = req.body;
    const studentId = req.user.id; // set by authenticate middleware
    const file = req.file;         // populated by multer if a file was uploaded

    if (!title || !description || !category) {
      return res.status(400).json({
        error: 'Title, description, and category are required.',
      });
    }

    const request = await requestService.createRequest(
      { title, description, category, priority },
      studentId,
      file
    );

    res.status(201).json(request);
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// GET /api/requests
// GET /api/requests/search
// List all requests with filter conditions
// ─────────────────────────────────────────────
async function listRequests(req, res, next) {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    // Extract optional filters from query parameters
    const { status, priority, category, dateFrom, dateTo, search, studentId } = req.query;

    const requests = await requestService.listRequests(userId, role, {
      status,
      priority,
      category,
      dateFrom,
      dateTo,
      search,
      studentId,
    });

    res.json(requests);
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// GET /api/requests/:id
// View detailed info of a single request
// ─────────────────────────────────────────────
async function getRequestById(req, res, next) {
  try {
    const requestId = req.params.id;
    const userId = req.user.id;
    const role = req.user.role;

    const request = await requestService.getRequestById(requestId, userId, role);
    res.json(request);
  } catch (error) {
    // If the error message is Access denied or Not found, we can map to proper status
    if (error.message.includes('Access denied')) {
      return res.status(403).json({ error: error.message });
    }
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
}

// ─────────────────────────────────────────────
// PATCH /api/requests/:id
// Update status, priority, or assignee (Support only)
// ─────────────────────────────────────────────
async function updateRequest(req, res, next) {
  try {
    const requestId = req.params.id;
    const userId = req.user.id;
    const { status, priority, assignedToId } = req.body;

    const updatedRequest = await requestService.updateRequest(
      requestId,
      { status, priority, assignedToId },
      userId
    );

    res.json(updatedRequest);
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('must be a valid support agent') || error.message.includes('Invalid status') || error.message.includes('Invalid priority')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
}

module.exports = {
  createRequest,
  listRequests,
  getRequestById,
  updateRequest,
};
