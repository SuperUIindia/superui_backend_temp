const express = require('express');
const { z } = require('zod');
const Visit = require('../models/Visit');
const ClickEvent = require('../models/ClickEvent');
const validate = require('../middleware/validate');
const { trackLimiter } = require('../middleware/rateLimit');
const { hashIp, parseUserAgent } = require('../utils/tracker');

const router = express.Router();

const visitSchema = z.object({
  visitorId: z.string().trim().min(1, 'visitorId is required'),
  sessionId: z.string().trim().min(1, 'sessionId is required'),
  path: z.string().default('/'),
  referrer: z.string().optional().default(''),
  screenWidth: z.number().optional()
});

const clickSchema = z.object({
  visitorId: z.string().trim().min(1, 'visitorId is required'),
  sessionId: z.string().trim().min(1, 'sessionId is required'),
  service: z.string().trim().min(1, 'service identifier is required')
});

/**
 * POST /api/track/visit - Tracks initial visit per session with anonymized IP
 */
router.post('/visit', trackLimiter, validate(visitSchema), async (req, res, next) => {
  try {
    const { visitorId, sessionId, path, referrer } = req.body;
    
    // Ignore tracking if path is admin route
    if (path && path.startsWith('/admin')) {
      return res.status(200).json({ success: true, message: 'Admin routes excluded from tracking' });
    }

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip;
    const ipHash = hashIp(clientIp);
    const { device, browser } = parseUserAgent(req.headers['user-agent']);

    const visit = await Visit.create({
      visitorId,
      sessionId,
      path: path || '/',
      referrer: referrer || '',
      device,
      browser,
      ipHash
    });

    return res.status(200).json({
      success: true,
      message: 'Visit tracked',
      data: { id: visit._id }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/track/click - Tracks service card clicks
 */
router.post('/click', trackLimiter, validate(clickSchema), async (req, res, next) => {
  try {
    const { visitorId, sessionId, service } = req.body;

    const click = await ClickEvent.create({
      visitorId,
      sessionId,
      service
    });

    return res.status(200).json({
      success: true,
      message: 'Click tracked',
      data: { id: click._id }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

