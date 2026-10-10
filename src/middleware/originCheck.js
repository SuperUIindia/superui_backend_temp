const { isOriginAllowed } = require('../config/env');

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Middleware that rejects mutating requests whose Origin header is not in the allow-list.
 * Browser requests with credentials send the Origin header on cross-origin and POST requests.
 */
function originCheck(req, res, next) {
  if (!MUTATING_METHODS.has(req.method.toUpperCase())) {
    return next();
  }

  const origin = req.headers.origin;

  // Requests without Origin (curl, server-to-server, mobile app) are permitted
  if (!origin) {
    return next();
  }

  if (isOriginAllowed(origin)) {
    return next();
  }

  console.warn(`[Origin Check] Blocked mutating request with origin "${origin}" to ${req.originalUrl}`);
  return res.status(403).json({
    success: false,
    message: 'Forbidden: Request origin not allowed'
  });
}

module.exports = originCheck;

