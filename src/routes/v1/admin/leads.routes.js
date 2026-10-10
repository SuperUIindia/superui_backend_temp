const express = require('express');
const { z } = require('zod');
const Lead = require('../../../models/Lead');
const validate = require('../../../middleware/validate');
const { config } = require('../../../config/env');
const { sanitizeCsvValue } = require('../../../utils/csv');

const router = express.Router();

const patchLeadSchema = z.object({
  status: z.enum(['New', 'Contacted', 'In Discussion', 'Won', 'Lost']).optional(),
  notes: z.string().max(3000).optional()
});

function parseIds(body) {
  const raw = Array.isArray(body?.ids) ? body.ids : [];
  return raw.filter((id) => typeof id === 'string' && /^[a-f\d]{24}$/i.test(id));
}

/**
 * GET /api/v1/admin/leads
 */
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const { status, purpose, q, from, to, unread } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (purpose && purpose !== 'All') {
      filter.purpose = purpose;
    }

    if (unread === '1' || unread === 'true') {
      filter.viewedAt = null;
    }

    if (from && from !== 'all') {
      const start = new Date(`${from}T00:00:00.000Z`);
      if (!Number.isNaN(start.getTime())) {
        filter.createdAt = { ...(filter.createdAt || {}), $gte: start };
      }
    }

    if (to && to !== 'all') {
      const end = new Date(`${to}T00:00:00.000Z`);
      if (!Number.isNaN(end.getTime())) {
        end.setUTCHours(23, 59, 59, 999);
        filter.createdAt = { ...(filter.createdAt || {}), $lte: end };
      }
    }

    if (q && String(q).trim()) {
      const searchTerm = String(q).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 120);
      if (searchTerm) {
        filter.$or = [
          { name: { $regex: searchTerm, $options: 'i' } },
          { email: { $regex: searchTerm, $options: 'i' } },
          { leadId: { $regex: searchTerm, $options: 'i' } },
          { phone: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } }
        ];
      }
    }

    const [total, leads] = await Promise.all([
      Lead.countDocuments(filter),
      Lead.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean()
    ]);

    return res.status(200).json({
      success: true,
      data: {
        leads,
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
 * GET /api/v1/admin/leads/notifications
 */
router.get('/notifications', async (req, res, next) => {
  try {
    const { all } = req.query;
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));

    const filter = { viewedAt: null };

    if (!all) {
      const now = new Date();
      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
      filter.createdAt = { $gte: start, $lte: end };
    }

    const [leads, total] = await Promise.all([
      Lead.find(filter).sort({ createdAt: -1 }).limit(limit).lean(),
      Lead.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      data: {
        leads,
        total,
        window: all ? 'all' : 'today'
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Helper to mark leads as viewed
 */
async function handleMarkViewed(req, res, next) {
  try {
    const filter = { viewedAt: null };
    if (!req.query.all) {
      const now = new Date();
      const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      filter.createdAt = { $gte: start, $lte: new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1) };
    }

    const result = await Lead.updateMany(filter, { $set: { viewedAt: new Date() } });
    return res.status(200).json({
      success: true,
      message: `${result.modifiedCount} lead(s) marked as viewed`,
      data: { modified: result.modifiedCount }
    });
  } catch (error) {
    next(error);
  }
}

router.post('/mark-viewed', handleMarkViewed);
router.post('/mark-all-viewed', handleMarkViewed);

/**
 * Helper for CSV export
 */
async function handleCsvExport(req, res, next) {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 }).lean();

    const headers = [
      'Lead ID',
      'Created Date',
      'Name',
      'Email',
      'Phone',
      'Instagram ID',
      'Purpose',
      'Reason / Note',
      'Status',
      'Notes',
      'Visitor ID'
    ];

    const rows = leads.map((lead) => [
      sanitizeCsvValue(lead.leadId),
      sanitizeCsvValue(new Date(lead.createdAt).toISOString()),
      sanitizeCsvValue(lead.name),
      sanitizeCsvValue(lead.email),
      sanitizeCsvValue(lead.phone),
      sanitizeCsvValue(lead.instagramId || ''),
      sanitizeCsvValue(lead.purpose),
      sanitizeCsvValue(lead.description),
      sanitizeCsvValue(lead.status),
      sanitizeCsvValue(lead.notes),
      sanitizeCsvValue(lead.visitorId)
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${config.brandSlug}-leads.csv"`);
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
}

router.get('/export', handleCsvExport);
router.get('/export.csv', handleCsvExport);

/**
 * Bulk delete handler
 */
async function handleBulkDelete(req, res, next) {
  try {
    const requested = Array.isArray(req.body?.ids) ? req.body.ids : [];
    if (requested.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least one lead id in "ids"'
      });
    }
    if (requested.length > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete more than 1000 leads in one request'
      });
    }

    const ids = parseIds(req.body);
    if (ids.length !== requested.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more ids are not valid Mongo ObjectIds'
      });
    }

    const result = await Lead.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      message: `${result.deletedCount} lead${result.deletedCount === 1 ? '' : 's'} deleted`,
      data: { requested: ids.length, deleted: result.deletedCount }
    });
  } catch (error) {
    next(error);
  }
}

router.post('/bulk-delete', handleBulkDelete);
router.delete('/', handleBulkDelete); // Backward compatibility for DELETE with body

/**
 * GET /api/v1/admin/leads/:id
 */
router.get('/:id', async (req, res, next) => {
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid lead id format' });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    let justViewed = false;
    if (!lead.viewedAt) {
      lead.viewedAt = new Date();
      await lead.save();
      justViewed = true;
    }

    return res.status(200).json({
      success: true,
      data: lead,
      meta: { justViewed }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/v1/admin/leads/:id
 */
router.patch('/:id', validate(patchLeadSchema), async (req, res, next) => {
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid lead id format' });
    }

    const { status, notes } = req.body;
    const updateData = {};

    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const lead = await Lead.findByIdAndUpdate(req.params.id, updateData, {
      returnDocument: 'after',
      runValidators: true
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      data: lead
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/admin/leads/:id
 */
router.delete('/:id', async (req, res, next) => {
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid lead id' });
    }
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    return res.status(200).json({
      success: true,
      message: `Lead ${lead.leadId} deleted`,
      data: { id: req.params.id, leadId: lead.leadId }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

