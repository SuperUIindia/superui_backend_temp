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
 * GET /api/content - Fetch all site sections
 */
router.get('/', async (req, res, next) => {
  try {
    const allKeys = Object.keys(DEFAULT_SECTIONS);

    // Resolve every section concurrently. Awaiting them one at a time made this
    // route cost twelve serial database round trips, and it is on the critical
    // path of every public page load, so its latency was roughly the sum of all
    // twelve instead of the slowest one. It also means a single slow section can
    // no longer stall the whole response.
    const docs = await Promise.all(allKeys.map((key) => getOrSeedSection(key)));

    const sections = {};
    docs.forEach((doc) => {
      if (!doc) return;
      sections[doc.key] = {
        key: doc.key,
        title: doc.title,
        description: doc.description,
        data: doc.data,
        updatedAt: doc.updatedAt,
        lastUpdatedBy: doc.lastUpdatedBy
      };
    });

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
