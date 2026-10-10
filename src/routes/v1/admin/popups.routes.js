const express = require('express');
const { z } = require('zod');
const Popup = require('../../../models/Popup');

const router = express.Router();

const popupSchema = z
  .object({
    imageUrl: z
      .string()
      .trim()
      .max(500, 'Image URL cannot exceed 500 characters')
      .refine((v) => /^https?:\/\//i.test(v) || /^\//.test(v), 'Image URL must start with https:// or /'),
    title: z.string().trim().max(120).optional().default(''),
    bodyText: z.string().trim().max(1000).optional().default(''),
    footerText: z.string().trim().max(300).optional().default(''),
    ctaLabel: z.string().trim().max(40).optional().default('Contact Us'),
    ctaUrl: z
      .string()
      .trim()
      .max(500)
      .optional()
      .default('')
      .refine(
        (v) => !v || /^(https?:\/\/|mailto:|tel:|\/)/i.test(v),
        'CTA URL must be a valid http(s) link, relative path (/), mailto:, or tel: URL'
      ),
    fromDate: z.coerce.date(),
    toDate: z.coerce.date(),
    isActive: z.boolean().optional().default(true)
  })
  .refine((d) => d.toDate >= d.fromDate, {
    message: 'End date must be on or after the start date',
    path: ['toDate']
  });

/**
 * GET /api/v1/admin/popups
 */
router.get('/', async (req, res, next) => {
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
 * POST /api/v1/admin/popups
 */
router.post('/', async (req, res, next) => {
  try {
    const parsed = popupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
      });
    }

    const popup = await Popup.create({ ...parsed.data, createdBy: req.admin?.username || 'admin' });
    return res.status(201).json({ success: true, message: 'Popup created', data: popup });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/v1/admin/popups/:id
 */
router.put('/:id', async (req, res, next) => {
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid popup id' });
    }

    const parsed = popupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
      });
    }

    const popup = await Popup.findByIdAndUpdate(
      req.params.id,
      { ...parsed.data, updatedBy: req.admin?.username || 'admin' },
      { new: true, runValidators: true }
    );

    if (!popup) {
      return res.status(404).json({ success: false, message: 'Popup not found' });
    }
    return res.status(200).json({ success: true, message: 'Popup updated', data: popup });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/admin/popups/:id
 */
router.delete('/:id', async (req, res, next) => {
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid popup id' });
    }

    const popup = await Popup.findByIdAndDelete(req.params.id);
    if (!popup) {
      return res.status(404).json({ success: false, message: 'Popup not found' });
    }
    return res.status(200).json({ success: true, message: 'Popup deleted', data: { id: req.params.id } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

