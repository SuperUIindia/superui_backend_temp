const express = require('express');
const authMiddleware = require('../../../middleware/auth');

const authRoutes = require('./auth.routes');
const statsRoutes = require('./stats.routes');
const leadsRoutes = require('./leads.routes');
const visitorsRoutes = require('./visitors.routes');
const clicksRoutes = require('./clicks.routes');
const popupsRoutes = require('./popups.routes');
const sectionsRoutes = require('./sections.routes');
const emailRoutes = require('./email.routes');

const router = express.Router();

// CORS preflight
router.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// 1. Auth routes (Login is public, /logout and /me require auth inside authRoutes)
router.use('/auth', authRoutes);
router.use('/', authRoutes); // Allows /login and /logout directly on /admin prefix

// 2. Auth gate applied ONCE to all subsequent admin routes
router.use(authMiddleware);

// 3. Protected admin resource routers
router.use('/stats', statsRoutes);
router.use('/leads', leadsRoutes);
router.use('/visitors', visitorsRoutes);
router.use('/clicks', clicksRoutes);
router.use('/popups', popupsRoutes);
router.use('/sections', sectionsRoutes);
router.use('/content', sectionsRoutes); // Backward compatibility for /api/admin/content
router.use('/email', emailRoutes);

// Backward compatibility mounts for direct admin endpoints:
router.use('/', emailRoutes); // Allows POST /api/admin/test-email directly

module.exports = router;

