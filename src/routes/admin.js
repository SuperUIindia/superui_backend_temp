const express = require('express');
const { z } = require('zod');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Lead = require('../models/Lead');
const Visit = require('../models/Visit');
const ClickEvent = require('../models/ClickEvent');
const Popup = require('../models/Popup');
const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimit');
const { config } = require('../config/env');

const router = express.Router();

const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
});

const patchLeadSchema = z.object({
  status: z.enum(['New', 'Contacted', 'In Discussion', 'Won', 'Lost']).optional(),
  notes: z.string().optional()
});

/**
 * Formula injection protection helper
 * Any cell value starting with '=', '+', '-', '@' will be prefixed with a single quote "'"
 */
function sanitizeCsvValue(val) {
  if (val === null || val === undefined) return '""';
  let str = String(val).trim();
  if (['=', '+', '-', '@'].includes(str.charAt(0))) {
    str = "'" + str;
  }
  // Escape inner double quotes
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

// ==========================================
// AUTHENTICATION ROUTES (Public Login)
// ==========================================

/**
 * POST /api/admin/login - Authenticate admin & issue httpOnly cookie
 */
router.post('/login', loginLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username: username.toLowerCase().trim() });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    // JWT_SECRET comes from backend/.env only - no fallback secret exists.
    const secret = config.jwtSecret;
    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      secret,
      { expiresIn: '8h' }
    );

    // 8 hour httpOnly session cookie.
    // `COOKIE_SAME_SITE` comes from backend/.env because the right value depends
    // on the deployment topology: "lax" when the API is same-site with the
    // frontend, "none" (which forces Secure) when they are on different sites.
    res.cookie('token', token, {
      httpOnly: true,
      secure: config.cookieSecure,
      sameSite: config.cookieSameSite,
      maxAge: 8 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        username: admin.username
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/logout - Clear httpOnly cookie
 */
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax'
  });
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// ==========================================
// PROTECTED ADMIN ROUTES (Require authMiddleware)
// ==========================================
router.use(authMiddleware);

/**
 * GET /api/admin/me - Returns current admin details
 */
router.get('/me', (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      username: req.admin.username
    }
  });
});

/**
 * GET /api/admin/stats - Totals, 30-day visit history, and card click breakdown
 */
router.get('/stats', async (req, res, next) => {
  try {
    // 1. Total counts
    const totalVisitsPromise = Visit.countDocuments();
    const uniqueVisitorsPromise = Visit.distinct('visitorId').then((ids) => ids.length);
    
    // Start of today (UTC midnight)
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

    const [
      totalVisits,
      uniqueVisitors,
      todayVisits,
      totalLeads,
      newLeads,
      totalClicks,
      visits30DaysRaw,
      clicksPerServiceRaw
    ] = await Promise.all([
      totalVisitsPromise,
      uniqueVisitorsPromise,
      todayVisitsPromise,
      totalLeadsPromise,
      newLeadsPromise,
      totalClicksPromise,
      visits30DaysPromise,
      clicksPerServicePromise
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
        clicksPerService
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/visitors - Paginated visitors list with lead conversion flag
 */
router.get('/visitors', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;

    const [total, visits] = await Promise.all([
      Visit.countDocuments(),
      Visit.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean()
    ]);

    // Check which visitorIds have submitted a lead
    const visitorIds = visits.map((v) => v.visitorId);
    const matchingLeads = await Lead.find({ visitorId: { $in: visitorIds } }, 'visitorId').lean();
    const leadVisitorSet = new Set(matchingLeads.map((l) => l.visitorId));

    const enrichedVisits = visits.map((v) => ({
      _id: v._id,
      visitorId: v.visitorId,
      shortVisitorId: v.visitorId.slice(0, 8),
      sessionId: v.sessionId,
      path: v.path,
      referrer: v.referrer || 'Direct / None',
      device: v.device,
      browser: v.browser,
      createdAt: v.createdAt,
      hasLead: leadVisitorSet.has(v.visitorId)
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
 * GET /api/admin/clicks - Grouped per service with count and last clicked
 */
router.get('/clicks', async (req, res, next) => {
  try {
    const clicksGrouped = await ClickEvent.aggregate([
      {
        $group: {
          _id: '$service',
          count: { $sum: 1 },
          lastClicked: { $max: '$createdAt' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const formatted = clicksGrouped.map((item) => ({
      service: item._id,
      count: item.count,
      lastClicked: item.lastClicked
    }));

    return res.status(200).json({
      success: true,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/leads - Paginated, filter by status, service, date range and
 * search q on name/email/leadId.
 *
 * Date range (from/to) accepts YYYY-MM-DD and is inclusive of the whole `to`
 * day. Pass from=all or to=all to skip that bound. Pass unread=1 to only
 * return leads an admin has not opened yet.
 */
router.get('/leads', async (req, res, next) => {
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

    // Inclusive date range on createdAt
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
      // Escape regex metacharacters so an admin typing e.g. "(" or "a{1,999}"
      // cannot trigger a pattern compile error or a catastrophic-backtracking
      // scan. Intended matching is plain, case-insensitive substring matching.
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
 * GET /api/admin/leads/notifications - New leads an admin has not opened yet.
 * Defaults to today (UTC day boundaries, matching the list filter). Each entry
 * disappears from this feed once its lead is opened, because opening stamps
 * `viewedAt`.
 */
router.get('/leads/notifications', async (req, res, next) => {
  try {
    const { all } = req.query;
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));

    const filter = { viewedAt: null };

    // Default window: today only
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
 * POST /api/admin/leads/mark-all-viewed - Clear the notification feed by
 * stamping every currently-unviewed lead.
 */
router.post('/leads/mark-all-viewed', async (req, res, next) => {
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
});

/**
 * GET /api/admin/leads/export.csv - Guarded CSV export against formula injection
 */
router.get('/leads/export.csv', async (req, res, next) => {
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
});

/**
 * GET /api/admin/leads/:id - Detail view for a lead
 */
/**
 * GET /api/admin/leads/:id - Fetch one lead. The first open marks it as viewed,
 * which clears the "new lead" highlight in the list.
 */
router.get('/leads/:id', async (req, res, next) => {
  try {
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
 * PATCH /api/admin/leads/:id - Update status and notes only
 */
router.patch('/leads/:id', validate(patchLeadSchema), async (req, res, next) => {
  try {
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

// ==========================================
// DELETION (leads + visitor telemetry)
// ==========================================

/**
 * Normalizes a bulk-delete request body into a list of Mongo ids.
 * Accepts { ids: [...] } and treats ids as Mongo ObjectIds only.
 */
function parseIds(body) {
  const raw = Array.isArray(body?.ids) ? body.ids : [];
  return raw.filter((id) => typeof id === 'string' && /^[a-f\d]{24}$/i.test(id));
}

/**
 * DELETE /api/admin/leads - Delete one lead or a selection of them.
 * Body: { ids: ["<id>", ...] }. Non-ObjectId entries are rejected up front so a
 * typo cannot silently delete the wrong documents.
 */
router.delete('/leads', async (req, res, next) => {
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
});

/**
 * DELETE /api/admin/leads/:id - Delete a single lead
 */
router.delete('/leads/:id', async (req, res, next) => {
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

/**
 * DELETE /api/admin/visitors - Delete visitor telemetry rows.
 *
 * Body: { ids: [...], scope: "selected" | "all" }. "all" wipes the whole
 * collection and is only honoured when explicitly requested.
 */
router.delete('/visitors', async (req, res, next) => {
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
});

/**
 * DELETE /api/admin/clicks - Delete service card click telemetry.
 * Same body contract as /api/admin/visitors.
 */
router.delete('/clicks', async (req, res, next) => {
  try {
    const scope = req.body?.scope === 'all' ? 'all' : 'selected';

    if (scope === 'all') {
      const result = await ClickEvent.deleteMany({});
      return res.status(200).json({
        success: true,
        message: `All ${result.deletedCount} click record${result.deletedCount === 1 ? '' : 's'} deleted`,
        data: { scope: 'all', deleted: result.deletedCount }
      });
    }

    const requested = Array.isArray(req.body?.ids) ? req.body.ids : [];
    if (requested.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least one click id, or set scope to "all"'
      });
    }

    const ids = parseIds(req.body);
    if (ids.length !== requested.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more ids are not valid Mongo ObjectIds'
      });
    }

    const result = await ClickEvent.deleteMany({ _id: { $in: ids } });
    return res.status(200).json({
      success: true,
      message: `${result.deletedCount} click record${result.deletedCount === 1 ? '' : 's'} deleted`,
      data: { scope: 'selected', requested: ids.length, deleted: result.deletedCount }
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// POPUP MANAGEMENT (protected by router.use(authMiddleware) above)
// ==========================================

const popupSchema = z
  .object({
    imageUrl: z
      .string()
      .trim()
      .max(500, 'Image URL cannot exceed 500 characters')
      .refine((v) => /^https?:\/\//i.test(v), 'Image URL must start with http:// or https://'),
    // Optional: an empty header renders a poster-only offer.
    title: z.string().trim().max(120).optional().default(''),
    bodyText: z.string().trim().max(1000).optional().default(''),
    footerText: z.string().trim().max(300).optional().default(''),
    ctaLabel: z.string().trim().max(40).optional().default('Contact Us'),
    ctaUrl: z.string().trim().max(500).optional().default(''),
    fromDate: z.coerce.date(),
    toDate: z.coerce.date(),
    isActive: z.boolean().optional().default(true)
  })
  .refine((d) => d.toDate >= d.fromDate, {
    message: 'End date must be on or after the start date',
    path: ['toDate']
  });

/**
 * GET /api/admin/popups - Every popup with a computed isLive flag
 */
router.get('/popups', async (req, res, next) => {
  try {
    const now = new Date();
    const popups = await Popup.find().sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      data: {
        popups: popups.map((p) => ({
          ...p,
          isLive: Boolean(p.isActive && p.fromDate <= now && p.toDate >= now)
        })),
        total: popups.length
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/popups - Create a popup
 */
router.post('/popups', (req, res, next) => {
  const parsed = popupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
    });
  }

  return Popup.create({ ...parsed.data, createdBy: req.admin?.username || 'admin' })
    .then((popup) =>
      res.status(201).json({ success: true, message: 'Popup created', data: popup })
    )
    .catch(next);
});

/**
 * PUT /api/admin/popups/:id - Update a popup
 */
router.put('/popups/:id', (req, res, next) => {
  const parsed = popupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
    });
  }

  return Popup.findByIdAndUpdate(
    req.params.id,
    { ...parsed.data, updatedBy: req.admin?.username || 'admin' },
    { new: true, runValidators: true }
  )
    .then((popup) => {
      if (!popup) {
        return res.status(404).json({ success: false, message: 'Popup not found' });
      }
      return res.status(200).json({ success: true, message: 'Popup updated', data: popup });
    })
    .catch(next);
});

/**
 * DELETE /api/admin/popups/:id - Delete a popup
 */
router.delete('/popups/:id', (req, res, next) => {
  Popup.findByIdAndDelete(req.params.id)
    .then((popup) => {
      if (!popup) {
        return res.status(404).json({ success: false, message: 'Popup not found' });
      }
      return res
        .status(200)
        .json({ success: true, message: 'Popup deleted', data: { id: req.params.id } });
    })
    .catch(next);
});

module.exports = router;
