const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const { config, isOriginAllowed } = require('./config/env');
const originCheck = require('./middleware/originCheck');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const apiRouter = require('./routes/index');

const app = express();

// Trust proxy for correct client IPs behind Render or CDN
app.set('trust proxy', config.trustProxy);

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);

// Strict CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile apps, server-to-server)
      if (!origin) return callback(null, true);
      if (isOriginAllowed(origin)) return callback(null, true);

      console.warn(`[CORS] Blocked cross-origin request from "${origin}"`);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Request parsing & cookies
app.use(cookieParser());
// JSON only (urlencoded removed to prevent form-encoded CSRF attacks)
app.use(express.json({ limit: '1mb' }));

// Reject mutating requests from disallowed origins
app.use(originCheck);

// Request logging
if (config.nodeEnv !== 'test') {
  app.use(morgan(config.isProduction ? 'combined' : 'dev'));
}

// Mount API router
app.use('/api', apiRouter);

// 404 handler for undefined API paths
app.use('/api', notFound);

// Centralized error handler
app.use(errorHandler);

module.exports = app;

