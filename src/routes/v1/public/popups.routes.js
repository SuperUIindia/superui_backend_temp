const express = require('express');
const Popup = require('../../../models/Popup');

const router = express.Router();

/**
 * GET /api/v1/popups - Public feed of active promotional popups
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

