const express = require('express');
const SiteContent = require('../../../models/SiteContent');
const { DEFAULT_SECTIONS } = require('../../../utils/defaultContent');

const router = express.Router();

/**
 * GET /api/v1/content - Fetch all site sections.
 * Reads from MongoDB; if a section is not yet in MongoDB, falls back to in-memory DEFAULT_SECTIONS.
 * Does NOT perform database writes during public GET requests.
 */
router.get('/', async (req, res, next) => {
  try {
    const docs = await SiteContent.find().lean();
    const docMap = new Map();
    docs.forEach((doc) => docMap.set(doc.key.toLowerCase(), doc));

    const sections = {};
    const allKeys = Object.keys(DEFAULT_SECTIONS);

    // Merge registered defaults with any custom DB overrides
    for (const key of allKeys) {
      const lowerKey = key.toLowerCase();
      const dbDoc = docMap.get(lowerKey);
      const defaultData = DEFAULT_SECTIONS[lowerKey];

      if (dbDoc) {
        sections[lowerKey] = {
          key: dbDoc.key,
          title: dbDoc.title,
          description: dbDoc.description,
          data: dbDoc.data,
          updatedAt: dbDoc.updatedAt,
          lastUpdatedBy: dbDoc.lastUpdatedBy
        };
      } else if (defaultData) {
        sections[lowerKey] = {
          key: lowerKey,
          title: defaultData.title,
          description: defaultData.description,
          data: defaultData.data,
          updatedAt: new Date(),
          lastUpdatedBy: 'default'
        };
      }
    }

    // Include any custom sections created by admin in DB that aren't in DEFAULT_SECTIONS
    docs.forEach((doc) => {
      const lowerKey = doc.key.toLowerCase();
      if (!sections[lowerKey]) {
        sections[lowerKey] = {
          key: doc.key,
          title: doc.title,
          description: doc.description,
          data: doc.data,
          updatedAt: doc.updatedAt,
          lastUpdatedBy: doc.lastUpdatedBy
        };
      }
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
 * GET /api/v1/content/:key - Fetch a specific section
 */
router.get('/:key', async (req, res, next) => {
  try {
    const rawKey = String(req.params.key || '').trim().toLowerCase();

    // Guard against object prototype injection keys
    if (['__proto__', 'constructor', 'prototype'].includes(rawKey)) {
      return res.status(404).json({
        success: false,
        message: `Section "${rawKey}" not found`
      });
    }

    const doc = await SiteContent.findOne({ key: rawKey }).lean();
    if (doc) {
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
    }

    const defaultData = DEFAULT_SECTIONS[rawKey];
    if (defaultData) {
      return res.status(200).json({
        success: true,
        data: {
          key: rawKey,
          title: defaultData.title,
          description: defaultData.description,
          data: defaultData.data,
          updatedAt: new Date(),
          lastUpdatedBy: 'default'
        }
      });
    }

    return res.status(404).json({
      success: false,
      message: `Section "${rawKey}" not found`
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

