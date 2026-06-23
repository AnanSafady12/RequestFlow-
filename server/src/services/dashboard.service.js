// services/dashboard.service.js
// Handles analytics, SLA tracking, satisfaction score compilation, and category aggregation.

const prisma = require('../config/db');

class DashboardService {
  /**
   * Compiles the dashboard statistics card payloads for support representatives.
   */
  async getStats() {
    // 1. Fetch count stats
    const totalRequests = await prisma.request.count();
    const openRequests = await prisma.request.count({ where: { status: 'OPEN' } });
    const inProgressRequests = await prisma.request.count({ where: { status: 'IN_PROGRESS' } });
    const resolvedRequests = await prisma.request.count({ where: { status: 'RESOLVED' } });
    const closedRequests = await prisma.request.count({ where: { status: 'CLOSED' } });

    // 2. Fetch all rating scores to calculate average satisfaction
    const ratings = await prisma.satisfactionRating.findMany({
      select: { rating: true },
    });
    const avgSatisfaction =
      ratings.length > 0
        ? parseFloat((ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length).toFixed(2))
        : 0;

    // 3. Dynamic SLA breach scanning
    // We scan all non-resolved/non-closed requests, and update their isSlaBreached status in the DB
    const unresolvedRequests = await prisma.request.findMany({
      where: {
        status: { in: ['OPEN', 'IN_PROGRESS'] },
      },
      select: { id: true, createdAt: true, priority: true, isSlaBreached: true },
    });

    const now = new Date();
    const breachedIds = [];

    for (const req of unresolvedRequests) {
      const elapsedHours = (now - new Date(req.createdAt)) / (1000 * 60 * 60);
      let threshold = 72; // default LOW
      if (req.priority === 'HIGH') threshold = 24;
      else if (req.priority === 'MEDIUM') threshold = 48;

      if (elapsedHours > threshold) {
        breachedIds.push(req.id);
      }
    }

    // Update the database records that transitioned to breached
    if (breachedIds.length > 0) {
      await prisma.request.updateMany({
        where: { id: { in: breachedIds } },
        data: { isSlaBreached: true },
      });
    }

    // Get count of total breaches (both unresolved ones we calculated, plus resolved ones that had breached)
    const totalSlaBreaches = await prisma.request.count({
      where: { isSlaBreached: true },
    });

    // 4. Calculate average response time (OPEN -> IN_PROGRESS) in hours
    // We look at all activities where status changed from OPEN to IN_PROGRESS
    const transitionLogs = await prisma.activity.findMany({
      where: {
        action: 'STATUS_CHANGED',
        description: { contains: 'to IN_PROGRESS' },
      },
      include: {
        request: {
          select: { createdAt: true },
        },
      },
    });

    let totalResponseTimeMs = 0;
    let responseCount = 0;

    for (const log of transitionLogs) {
      if (log.request) {
        const diffMs = new Date(log.createdAt) - new Date(log.request.createdAt);
        if (diffMs >= 0) {
          totalResponseTimeMs += diffMs;
          responseCount++;
        }
      }
    }

    const avgResponseTimeHours =
      responseCount > 0
        ? parseFloat((totalResponseTimeMs / (1000 * 60 * 60) / responseCount).toFixed(2))
        : 0;

    // 5. Calculate top requested category
    const categoryGroup = await prisma.request.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 1,
    });

    const topCategory = categoryGroup.length > 0 ? categoryGroup[0].category : 'N/A';

    return {
      totalRequests,
      openRequests,
      inProgressRequests,
      resolvedRequests,
      closedRequests,
      avgResponseTime: avgResponseTimeHours, // in hours
      slaBreaches: totalSlaBreaches,
      avgSatisfaction,
      topCategory,
    };
  }

  /**
   * Retrieves a list of requests that are currently past their SLA deadline.
   */
  async getSlaBreaches() {
    // Run stats function first to trigger dynamic update of unresolved breached tickets
    await this.getStats();

    // Now query all breached requests from DB
    return prisma.request.findMany({
      where: {
        isSlaBreached: true,
      },
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Submits a satisfaction star rating (1-5) for a resolved or closed support ticket.
   */
  async rateRequest(requestId, studentId, ratingValue) {
    const rating = parseInt(ratingValue, 10);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      throw new Error('Rating must be an integer between 1 and 5.');
    }

    const request = await prisma.request.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error('Request not found.');
    }

    // Access control: only the student who created the request can rate it
    if (request.studentId !== studentId) {
      throw new Error('Access denied. You can only rate your own requests.');
    }

    // Ticket must be resolved or closed to be rated
    if (request.status !== 'RESOLVED' && request.status !== 'CLOSED') {
      throw new Error('You can only rate requests that are resolved or closed.');
    }

    // Create or update satisfaction rating (upsert logic)
    const ratingRecord = await prisma.satisfactionRating.upsert({
      where: { requestId },
      update: {
        rating,
      },
      create: {
        rating,
        studentId,
        requestId,
      },
    });

    // Log the rating activity in the ticket timeline
    const { logActivity } = require('../utils/activityLogger');
    await logActivity(
      'RATED',
      `Student rated the resolution: ${rating} stars`,
      studentId,
      requestId
    );

    return ratingRecord;
  }

  /**
   * Retrieves average satisfaction ratings grouped by support representatives.
   */
  async getSatisfactionPerAgent() {
    // Fetch all support reps
    const agents = await prisma.user.findMany({
      where: { role: 'SUPPORT' },
      select: {
        id: true,
        name: true,
        email: true,
        assignedRequests: {
          select: {
            rating: {
              select: { rating: true },
            },
          },
        },
      },
    });

    return agents.map((agent) => {
      // Filter out null ratings
      const ratings = agent.assignedRequests
        .map((req) => req.rating)
        .filter((r) => r !== null)
        .map((r) => r.rating);

      const averageRating =
        ratings.length > 0 ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)) : 0;

      return {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        averageRating,
        totalRatings: ratings.length,
      };
    });
  }
}

module.exports = new DashboardService();
