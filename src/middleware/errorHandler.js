const { config } = require('../config/env');

/**
 * Centralized application error handling middleware.
 */
function errorHandler(err, req, res, next) {
  // Always log server errors
  console.error('[Unhandled Error]', {
    method: req.method,
    url: req.originalUrl,
    error: err.message,
    stack: config.isProduction ? undefined : err.stack
  });

  // Zod validation error
  if (err.name === 'ZodError' || (err.issues && Array.isArray(err.issues))) {
    const issues = err.issues || err.errors || [];
    const messages = issues.map((i) => `${i.path.join('.')}: ${i.message}`);
    return res.status(400).json({
      success: false,
      message: messages[0] || 'Validation failed',
      errors: messages
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map((val) => val.message);
    return res.status(400).json({
      success: false,
      message: messages[0] || 'Validation failed',
      errors: messages
    });
  }

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid identifier format for ${err.path}`
    });
  }

  // Mongoose duplicate key error (11000)
  if (err.code === 11000) {
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
    return res.status(409).json({
      success: false,
      message: `A record with that ${field} already exists.`
    });
  }

  // Respect status or statusCode (e.g. 502, 401, 403, 404, etc.)
  const statusCode = err.status || err.statusCode || 500;
  
  // In production, do not leak internal database / stack messages for 5xx errors
  let message = err.message || 'Internal server error';
  if (statusCode >= 500 && config.isProduction) {
    message = 'An unexpected internal server error occurred.';
  }

  return res.status(statusCode).json({
    success: false,
    message
  });
}

module.exports = errorHandler;

