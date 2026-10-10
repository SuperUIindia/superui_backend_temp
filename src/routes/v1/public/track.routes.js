const express = require('express');
const { z } = require('zod');
const Visit = require('../../../models/Visit');
const ClickEvent = require('../../../models/ClickEvent');
const validate = require('../../../middleware/validate');
const { trackLimiter } = require('../../../middleware/rateLimit');
const { hashIp, parseUserAgent, resolveAreaFromIp } = require('../../../utils/tracker');

const router = express.Router();

const visitSchema = z.object({
  visitorId: z.string().trim().min(1, 'visitorId is required').max(128),
  sessionId: z.string().trim().min(1, 'sessionId is required').max(128),
  path: z.string().default('/').transform((v) => v.slice(0, 500)),
  referrer: z.string().optional().default('').transform((v) => (v ? v.slice(0, 1000) : '')),
  screenWidth: z.number().optional()
});

const clickSchema = z.object({
  visitorId: z.string().trim().min(1, 'visitorId is required').max(128),
  sessionId: z.string().trim().min(1, 'sessionId is required').max(128),
  service: z.string().trim().min(1, 'service identifier is required').max(200)
});

async function handleTrackVisit(req, res, next) {
  try {
    const { visitorId, sessionId, path, referrer, screenWidth } = req.body;

    if (path && path.startsWith('/admin')) {
      return res.status(200).json({ success: true, message: 'Admin routes excluded from tracking' });
    }

    // Rely on req.ip (configured with Express 'trust proxy')
    const clientIp = req.ip || req.socket.remoteAddress;
    const ipHash = hashIp(clientIp);
    const { deviceCategory, deviceModel, deviceVendor, browser } = parseUserAgent(req.headers['user-agent'], screenWidth);
    const area = await resolveAreaFromIp(clientIp);

    const visit = await Visit.create({
      visitorId,
      sessionId,
      path: path || '/',
      referrer: referrer || '',
      device: deviceCategory,
      browser,
      ipHash,
      area,
      deviceCategory,
      deviceModel,
      deviceVendor
    });

    return res.status(201).json({
      success: true,
      message: 'Visit tracked',
      data: { id: visit._id }
    });
  } catch (error) {
    next(error);
  }
}

async function handleTrackClick(req, res, next) {
  try {
    const { visitorId, sessionId, service } = req.body;

    const click = await ClickEvent.create({
      visitorId,
      sessionId,
      service
    });

    return res.status(201).json({
      success: true,
      message: 'Click tracked',
      data: { id: click._id }
    });
  } catch (error) {
    next(error);
  }
}

// POST /track/visits and /track/visit
router.post('/visits', trackLimiter, validate(visitSchema), handleTrackVisit);
router.post('/visit', trackLimiter, validate(visitSchema), handleTrackVisit);

// POST /track/clicks and /track/click
router.post('/clicks', trackLimiter, validate(clickSchema), handleTrackClick);
router.post('/click', trackLimiter, validate(clickSchema), handleTrackClick);

module.exports = router;

