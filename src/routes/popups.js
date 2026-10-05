const express = require('express');
const Popup = require('../models/Popup');

const router = express.Router();

/**
 * GET /api/popups - Public feed of popups that are active and inside their
 * availability window. Expired popups (toDate in the past) are never returned,
 * so the client needs no expiry logic of its own.
 */
router.get('/', async (req, res, next) => {
  try {
    const now = new Date();
    const popups = await Popup.find(Popup.liveFilter(now))
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        popups,
        count: popups.length,
        serverTime: now.toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;