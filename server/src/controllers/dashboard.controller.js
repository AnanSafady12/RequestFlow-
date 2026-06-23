// controllers/dashboard.controller.js
// Handles HTTP request payloads for support dashboard statistics,
// satisfaction ratings, and agent performance matrices.

const dashboardService = require('../services/dashboard.service');

// ─────────────────────────────────────────────
// GET /api/dashboard/stats
// Compile dashboard statistics (Support only)
// ─────────────────────────────────────────────
async function getStats(req, res, next) {
  try {
    const stats = await dashboardService.getStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// GET /api/dashboard/sla-breaches
// Get requests that breached SLA criteria (Support only)
// ─────────────────────────────────────────────
async function getSlaBreaches(req, res, next) {
  try {
    const breaches = await dashboardService.getSlaBreaches();
    res.json(breaches);
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// GET /api/dashboard/satisfaction
// Average satisfaction rankings per support agent (Support only)
// ─────────────────────────────────────────────
async function getSatisfactionPerAgent(req, res, next) {
  try {
    const ratings = await dashboardService.getSatisfactionPerAgent();
    res.json(ratings);
  } catch (error) {
    next(error);
  }
}

// ─────────────────────────────────────────────
// POST /api/requests/:id/rate
// Star rating feedback from students (Student only)
// ─────────────────────────────────────────────
async function rateRequest(req, res, next) {
  try {
    const requestId = req.params.id;
    const studentId = req.user.id;
    const { rating } = req.body;

    if (rating === undefined) {
      return res.status(400).json({ error: 'Rating value is required.' });
    }

    const ratingRecord = await dashboardService.rateRequest(requestId, studentId, rating);

    res.json({
      message: 'Thank you for your feedback! Rating saved.',
      rating: ratingRecord,
    });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('Access denied')) {
      return res.status(403).json({ error: error.message });
    }
    if (error.message.includes('Rating must be') || error.message.includes('only rate requests that are')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
}

module.exports = {
  getStats,
  getSlaBreaches,
  getSatisfactionPerAgent,
  rateRequest,
};
