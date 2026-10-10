const express = require('express');
const Visit = require('../../../models/Visit');
const Lead = require('../../../models/Lead');

const router = express.Router();

function parseIds(body) {
  const raw = Array.isArray(body?.ids) ? body.ids : [];
  return raw.filter((id) => typeof id === 'string' && /^[a-f\d]{24}$/i.test(id));
}

/**
 * GET /api/v1/admin/visitors
 */
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [total, visits] = await Promise.all([
      Visit.countDocuments(),
      Visit.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean()
    ]);

    const visitorIds = visits.map((v) => v.visitorId);
    const matchingLeads = await Lead.find({ visitorId: { $in: visitorIds } }, 'visitorId').lean();
    const leadVisitorSet = new Set(matchingLeads.map((l) => l.visitorId));

    const enrichedVisits = visits.map((v) => ({
      ...v,
      hasSubmittedLead: leadVisitorSet.has(v.visitorId)
    }));

    return res.status(200).json({
      success: true,
      data: {
        visitors: enrichedVisits,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Bulk delete handler for visitors
 */
async function handleBulkDeleteVisitors(req, res, next) {
  try {
    const scope = req.body?.scope === 'all' ? 'all' : 'selected';

    if (scope === 'all') {
      const result = await Visit.deleteMany({});
      return res.status(200).json({
        success: true,
        message: `All ${result.deletedCount} visitor record${result.deletedCount === 1 ? '' : 's'} deleted`,
        data: { scope: 'all', deleted: result.deletedCount }
      });
    }

    const requested = Array.isArray(req.body?.ids) ? req.body.ids : [];
    if (requested.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least one visitor id, or set scope to "all"'
      });
    }
    if (requested.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete more than 2000 visitor records in one request'
      });
    }

    const ids = parseIds(req.body);
    if (ids.length !== requested.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more ids are not valid Mongo ObjectIds'
      });
    }

    const result = await Visit.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      message: `${result.deletedCount} visitor record${result.deletedCount === 1 ? '' : 's'} deleted`,
      data: { scope: 'selected', requested: ids.length, deleted: result.deletedCount }
    });
  } catch (error) {
    next(error);
  }
}

router.post('/bulk-delete', handleBulkDeleteVisitors);
router.delete('/', handleBulkDeleteVisitors); // Backward compatibility for DELETE with body

module.exports = router;

