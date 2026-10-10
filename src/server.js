/**
 * Every host, port, origin and secret used by this process is resolved from
 * backend/.env through src/config/env.js. Nothing is hard-coded here, and a
 * missing value aborts startup with an explicit message instead of silently
 * falling back to a localhost default.
 */
const { config, isOriginAllowed, describe } = require('./config/env');

const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const leadsRouter = require('./routes/leads');
const trackRouter = require('./routes/track');
const adminRouter = require('./routes/admin');
const contentRouter = require('./routes/content');
const popupsRouter = require('./routes/popups');
const adminContentRouter = require('./routes/adminContent');

const app = express();
const PORT = config.port;
const MONGODB_URI = config.mongoUri;

// Behind Render / a CDN the socket IP is the proxy's, so client IPs (used for
// rate limiting and anonymised visitor hashing) are only correct with this on.
app.set('trust proxy', config.trustProxy);

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);

// CORS configuration - strict allow-list built from CLIENT_URL + CORS_ORIGINS
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);
      if (isOriginAllowed(origin)) return callback(null, true);
      // Never leak whether an origin exists: report it as a normal CORS failure.
      console.warn(`Blocked cross-origin request from "${origin}"`);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Request body parsers & cookies
app.use(cookieParser());
// The full 15-category / 191-service catalogue is ~16 kB of JSON, so the
// body limit must exceed that or PUT /api/content/services is rejected.
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Health check endpoint. Reports only non-secret runtime facts.
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    brand: config.brandName || undefined,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Mount modular API routes
app.use('/api/leads', leadsRouter);
app.use('/api/track', trackRouter);
// Admin CRUD for site sections (navbar, footer and every home section).
// Mounted ahead of adminRouter because it owns a distinct /api/admin/content
// prefix; each route here applies authMiddleware itself.
app.use('/api/admin/content', adminContentRouter);
app.use('/api/admin', adminRouter);
// Public read of live popups (admin CRUD lives in admin.js, behind authMiddleware)
app.use('/api/popups', popupsRouter);
app.use('/api/content', contentRouter);

// 404 handler for undefined API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route ${req.originalUrl} not found`
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: messages[0] || 'Validation failed',
      errors: messages
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `A record with that ${field} already exists.`
    });
  }

  // Fallback generic 500
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Database connection & Server initialization
async function startServer() {
  try {
    console.log(`Connecting to MongoDB at: ${require('./config/env').redactMongoUri(MONGODB_URI)}`);
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB connection established successfully.');
  } catch (dbErr) {
    console.warn('MongoDB connection warning:', dbErr.message);
    console.warn('Backend server will continue running; ensure MongoDB or MongoDB Atlas is available for full database persistence.');
  }

  const server = app.listen(PORT, () => {
    console.log(`${config.brandName || 'SuperUI'} API Server listening on port ${PORT}`);
    console.log('Resolved runtime configuration:', describe());
  });

  return server;
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, startServer };
