const express = require('express');
const { z } = require('zod');
const SiteContent = require('../models/SiteContent');
const authMiddleware = require('../middleware/auth');
const { DEFAULT_SECTIONS } = require('../utils/defaultContent');

const router = express.Router();

/**
 * Ensures a section exists in MongoDB, seeding defaults if missing
 */
async function getOrSeedSection(key) {
  let doc = await SiteContent.findOne({ key: key.toLowerCase() });
  if (!doc) {
    const defaultData = DEFAULT_SECTIONS[key.toLowerCase()];
    if (defaultData) {
      doc = await SiteContent.create({
        key: key.toLowerCase(),
        title: defaultData.title,
        description: defaultData.description,
        data: defaultData.data,
        lastUpdatedBy: 'system-seed'
      });
    }
  }
  return doc;
}

/**
 * GET /api/content - Fetch all site sections in a single fast query
 */
router.get('/', async (req, res, next) => {
  try {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    // Single fast batch query instead of 15 serial/concurrent round-trips
    const docs = await SiteContent.find({}).lean();
    const sections = {};
    const foundKeys = new Set();

    docs.forEach((doc) => {
      if (!doc || !doc.key) return;
      const k = doc.key.toLowerCase();
      foundKeys.add(k);
      sections[k] = {
        key: doc.key,
        title: doc.title,
        description: doc.description,
        data: doc.data,
        updatedAt: doc.updatedAt,
        lastUpdatedBy: doc.lastUpdatedBy
      };
    });

    // For any missing default section, populate immediately and seed asynchronously
    const missingKeys = Object.keys(DEFAULT_SECTIONS).filter((k) => !foundKeys.has(k.toLowerCase()));
    if (missingKeys.length > 0) {
      for (const key of missingKeys) {
        const def = DEFAULT_SECTIONS[key];
        if (def) {
          sections[key] = {
            key,
            title: def.title,
            description: def.description,
            data: def.data,
            updatedAt: new Date()
          };
          SiteContent.create({
            key,
            title: def.title,
            description: def.description,
            data: def.data,
            lastUpdatedBy: 'system-seed'
          }).catch(() => {});
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: sections
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/content/:key - Fetch a specific section (e.g. services, hero, whyUs)
 */
router.get('/:key', async (req, res, next) => {
  try {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    const key = req.params.key.toLowerCase();
    const doc = await getOrSeedSection(key);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: `Section "${key}" not found`
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        key: doc.key,
        title: doc.title,
        description: doc.description,
        data: doc.data,
        updatedAt: doc.updatedAt,
        lastUpdatedBy: doc.lastUpdatedBy
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/content/:key - Admin updates a specific section (JSON format data stored in DB)
 */
router.put('/:key', authMiddleware, async (req, res, next) => {
  try {
    const key = req.params.key.toLowerCase();
    const { title, description, data } = req.body;

    if (data === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing "data" field in request body'
      });
    }

    const updateFields = {
      data,
      lastUpdatedBy: req.admin?.username || 'admin',
      updatedAt: new Date()
    };
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;

    const updatedDoc = await SiteContent.findOneAndUpdate(
      { key },
      { $set: updateFields },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: `Section "${key}" updated successfully in database`,
      data: updatedDoc
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
