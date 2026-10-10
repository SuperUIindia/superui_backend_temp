const express = require('express');
const Lead = require('../../../models/Lead');
const Visit = require('../../../models/Visit');
const ClickEvent = require('../../../models/ClickEvent');

const router = express.Router();

/**
 * GET /api/v1/admin/stats
 * Overview analytics: total visits, memory-safe unique visitors, leads, clicks, device breakdown, top areas
 */
router.get('/', async (req, res, next) => {
  try {
    // 1. Total counts
    const totalVisitsPromise = Visit.countDocuments();
    
    // Memory-safe unique visitors count via aggregation (replaces Visit.distinct which has 16MB limit)
    const uniqueVisitorsPromise = Visit.aggregate([
      { $group: { _id: '$visitorId' } },
      { $count: 'total' }
    ]).then((result) => (result.length > 0 ? result[0].total : 0));

    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayVisitsPromise = Visit.countDocuments({ createdAt: { $gte: todayStart } });

    const totalLeadsPromise = Lead.countDocuments();
    const newLeadsPromise = Lead.countDocuments({ status: 'New' });
    const totalClicksPromise = ClickEvent.countDocuments();

    // 2. Visits per day for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 29);
    thirtyDaysAgo.setUTCHours(0, 0, 0, 0);

    const visits30DaysPromise = Visit.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          visits: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 3. Clicks per service
    const clicksPerServicePromise = ClickEvent.aggregate([
      {
        $group: {
          _id: '$service',
          count: { $sum: 1 },
          lastClicked: { $max: '$createdAt' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // 4. Device breakdown
    const deviceBreakdownPromise = Visit.aggregate([
      {
        $group: {
          _id: '$deviceCategory',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // 5. Area breakdown (top 10)
    const areaBreakdownPromise = Visit.aggregate([
      { $match: { area: { $nin: ['Unknown', null, ''] } } },
      {
        $group: {
          _id: '$area',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const [
      totalVisits,
      uniqueVisitors,
      todayVisits,
      totalLeads,
      newLeads,
      totalClicks,
      visits30DaysRaw,
      clicksPerServiceRaw,
      deviceBreakdownRaw,
      areaBreakdownRaw
    ] = await Promise.all([
      totalVisitsPromise,
      uniqueVisitorsPromise,
      todayVisitsPromise,
      totalLeadsPromise,
      newLeadsPromise,
      totalClicksPromise,
      visits30DaysPromise,
      clicksPerServicePromise,
      deviceBreakdownPromise,
      areaBreakdownPromise
    ]);

    // Fill in missing days for 30-day chart
    const visitsMap = new Map();
    visits30DaysRaw.forEach((item) => visitsMap.set(item._id, item.visits));

    const visitsPerDay = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      visitsPerDay.push({
        date: dateStr,
        visits: visitsMap.get(dateStr) || 0
      });
    }

    const clicksPerService = clicksPerServiceRaw.map((item) => ({
      service: item._id,
      count: item.count,
      lastClicked: item.lastClicked
    }));

    const deviceBreakdown = deviceBreakdownRaw.map((item) => ({
      device: item._id || 'Unknown',
      count: item.count
    }));

    const areaBreakdown = areaBreakdownRaw.map((item) => ({
      area: item._id,
      count: item.count
    }));

    return res.status(200).json({
      success: true,
      data: {
        totalVisits,
        uniqueVisitors,
        todayVisits,
        totalLeads,
        newLeads,
        totalClicks,
        visitsPerDay,
        clicksPerService,
        deviceBreakdown,
        areaBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

