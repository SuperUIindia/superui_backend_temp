const rateLimit = require('express-rate-limit');

// Leads submission rate limiter: 10 per IP per 10 minutes
const leadsLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please wait 10 minutes before submitting again.'
  }
});

// Admin login rate limiter: 5 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.'
  }
});

// Tracking rate limiter: generous (180 requests per 15 minutes)
const trackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 180,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Tracking rate limit exceeded.'
  }
});

module.exports = {
  leadsLimiter,
  loginLimiter,
  trackLimiter
};

