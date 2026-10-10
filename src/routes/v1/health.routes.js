const express = require('express');
const mongoose = require('mongoose');
const { config } = require('../../config/env');
const { isDbConnected } = require('../../config/db');

const router = express.Router();

/**
 * GET /api/v1/health - Process liveness check
 */
router.get('/health', (req, res) => {
  return res.status(200).json({
    status: 'ok',
    brand: config.brandName,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: config.nodeEnv,
    database: isDbConnected() ? 'connected' : 'disconnected'
  });
});

/**
 * GET /api/v1/ready - Readiness check verifying database connectivity
 * Returns 200 when ready to serve traffic, or 503 if database is disconnected
 */
router.get('/ready', (req, res) => {
  const connected = isDbConnected();
  if (!connected) {
    return res.status(503).json({
      status: 'unavailable',
      message: 'Database connection not ready',
      database: 'disconnected',
      timestamp: new Date().toISOString()
    });
  }

  return res.status(200).json({
    status: 'ready',
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

