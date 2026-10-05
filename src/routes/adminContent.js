const express = require('express');
const { z } = require('zod');
const SiteContent = require('../models/SiteContent');
const authMiddleware = require('../middleware/auth');
const { DEFAULT_SECTIONS, PROTECTED_SECTION_KEYS } = require('../utils/defaultContent');

const router = express.Router();

// Every route in this file is admin-only. Applied before any handler is
// registered so no section can be read or written without a valid session.
router.use(authMiddleware);

const keySchema = z
  .string()
  .trim()
  .min(1, 'Section key is required')
  .max(60, 'Section key cannot exceed 60 characters')
  .regex(/^[a-z0-9]+$/i, 'Section key may contain only letters and numbers')
  .transform((v) => v.toLowerCase());

const upsertSchema = z.object({
  key: keySchema,
  title: z.string().trim().min(1, 'Title is required').max(160),
  description: z.string().trim().max(400).optional().default(''),
  data: z.unknown()
});

/** Strips Mongo internals so the admin UI receives clean JSON. */
function serialize(doc) {
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  return {
    _id: obj._id,
    key: obj.key,
    title: obj.title,
    description: obj.description || '',
    data: obj.data,
    lastUpdatedBy: obj.lastUpdatedBy || 'system',
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
    isProtected: PROTECTED_SECTION_KEYS.includes(obj.key),
    isDefault: Object.prototype.hasOwnProperty.call(DEFAULT_SECTIONS, obj.key)
  };
}

/**
 * GET /api/admin/content - Every section as a flat JSON array.
 * `?format=tree` returns them keyed by section key instead, which is handy for
 * copy/pasting a single section's JSON.
 */
router.get('/', async (req, res, next) => {
  try {
    const docs = await SiteContent.find().sort({ key: 1 }).lean();
    const sections = docs.map((d) => ({
      ...d,
      isProtected: PROTECTED_SECTION_KEYS.includes(d.key),
      isDefault: Object.prototype.hasOwnProperty.call(DEFAULT_SECTIONS, d.key)
    }));

    // Also surface registered defaults that have never been written to Mongo
    const missing = Object.keys(DEFAULT_SECTIONS).filter(
      (k) => !docs.some((d) => d.key === k)
    );

    if (req.query.format === 'tree') {
      const tree = {};
      for (const s of sections) tree[s.key] = s.data;
      return res.status(200).json({ success: true, data: tree });
    }

    return res.status(200).json({
      success: true,
      data: {
        sections,
        total: sections.length,
        registeredKeys: Object.keys(DEFAULT_SECTIONS),
        missingKeys: missing,
        protectedKeys: PROTECTED_SECTION_KEYS
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/content/:key - One section
 */
router.get('/:key', async (req, res, next) => {
  try {
    const key = String(req.params.key).toLowerCase();
    const doc = await SiteContent.findOne({ key }).lean();
    if (!doc) {
      return res.status(404).json({ success: false, message: `Section "${key}" not found` });
    }
    return res.status(200).json({ success: true, data: serialize(doc) });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/content - Create a brand new section.
 * Refuses to overwrite an existing key so a create can never silently destroy data.
 */
router.post('/', async (req, res, next) => {
  const parsed = upsertSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
    });
  }

  const { key, title, description, data } = parsed.data;
  if (data === undefined || data === null) {
    return res.status(400).json({ success: false, message: 'Section "data" is required' });
  }

  try {
    const existing = await SiteContent.findOne({ key }).lean();
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Section "${key}" already exists. Use PUT to update it.`
      });
    }

    const doc = await SiteContent.create({
      key,
      title,
      description,
      data,
      lastUpdatedBy: req.admin?.username || 'admin'
    });

    return res.status(201).json({
      success: true,
      message: `Section "${key}" created`,
      data: serialize(doc)
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({ success: false, message: `Section "${key}" already exists` });
    }
    return next(error);
  }
});

/**
 * PUT /api/admin/content/:key - Create or replace a section's stored JSON.
 * `?rename=newKey` moves an existing section to a new key.
 */
router.put('/:key', async (req, res, next) => {
  const parsed = upsertSchema.safeParse({ ...req.body, key: req.params.key });
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
    });
  }

  const key = parsed.data.key;
  const { title, description, data } = parsed.data;
  if (data === undefined || data === null) {
    return res.status(400).json({ success: false, message: 'Section "data" is required' });
  }

  try {
    const existing = await SiteContent.findOne({ key }).lean();
    if (!existing) {
      const created = await SiteContent.create({
        key,
        title,
        description,
        data,
        lastUpdatedBy: req.admin?.username || 'admin'
      });
      return res.status(201).json({
        success: true,
        message: `Section "${key}" created`,
        data: serialize(created)
      });
    }

    const updated = await SiteContent.findOneAndUpdate(
      { key },
      {
        $set: {
          title,
          description,
          data,
          lastUpdatedBy: req.admin?.username || 'admin',
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    ).lean();

    return res.status(200).json({
      success: true,
      message: `Section "${key}" updated`,
      data: serialize(updated)
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({ success: false, message: `Section "${key}" already exists` });
    }
    return next(error);
  }
});

/**
 * PATCH /api/admin/content/:key - Rename a section's key.
 * Protected sections cannot be renamed.
 */
router.patch('/:key', async (req, res, next) => {
  const currentKey = String(req.params.key).toLowerCase();
  const parsed = z.object({ newKey: keySchema }).safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
    });
  }

  if (PROTECTED_SECTION_KEYS.includes(currentKey)) {
    return res.status(403).json({
      success: false,
      message: `Section "${currentKey}" is protected and cannot be renamed`
    });
  }

  try {
    const newKey = parsed.data.newKey;
    if (newKey === currentKey) {
      return res.status(400).json({ success: false, message: 'New key is identical to the current key' });
    }

    const clash = await SiteContent.findOne({ key: newKey }).lean();
    if (clash) {
      return res.status(409).json({ success: false, message: `Section "${newKey}" already exists` });
    }

    const doc = await SiteContent.findOneAndUpdate(
      { key: currentKey },
      { $set: { key: newKey, lastUpdatedBy: req.admin?.username || 'admin' } },
      { new: true, runValidators: true }
    ).lean();

    if (!doc) {
      return res.status(404).json({ success: false, message: `Section "${currentKey}" not found` });
    }

    return res.status(200).json({
      success: true,
      message: `Section "${currentKey}" renamed to "${newKey}"`,
      data: serialize(doc)
    });
  } catch (error) {
    if (error && error.code === 11000) {
      return res.status(409).json({ success: false, message: `Section "${parsed.data.newKey}" already exists` });
    }
    return next(error);
  }
});

/**
 * DELETE /api/admin/content/:key - Remove a section.
 * Protected sections (currently `services`) are refused with 403.
 */
router.delete('/:key', async (req, res, next) => {
  const key = String(req.params.key).toLowerCase();

  if (PROTECTED_SECTION_KEYS.includes(key)) {
    return res.status(403).json({
      success: false,
      message: `Section "${key}" is protected and cannot be deleted`
    });
  }

  try {
    const doc = await SiteContent.findOneAndDelete({ key });
    if (!doc) {
      return res.status(404).json({ success: false, message: `Section "${key}" not found` });
    }

    // A deleted default section is re-seeded on the next public GET, which is
    // how the site keeps a working copy even after an admin removes one.
    return res.status(200).json({
      success: true,
      message: `Section "${key}" deleted${Object.prototype.hasOwnProperty.call(DEFAULT_SECTIONS, key) ? ' (it will be re-seeded with defaults on the next page load)' : ''}`,
      data: { key }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;