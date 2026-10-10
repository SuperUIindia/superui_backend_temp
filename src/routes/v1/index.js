const express = require('express');

const healthRoutes = require('./health.routes');
const contentRoutes = require('./public/content.routes');
const leadsRoutes = require('./public/leads.routes');
const popupsRoutes = require('./public/popups.routes');
const trackRoutes = require('./public/track.routes');
const adminRoutes = require('./admin/index');

const router = express.Router();

// Health & readiness
router.use('/', healthRoutes);

// Public API endpoints
router.use('/content', contentRoutes);
router.use('/leads', leadsRoutes);
router.use('/popups', popupsRoutes);
router.use('/track', trackRoutes);

// Admin API endpoints
router.use('/admin', adminRoutes);

module.exports = router;

