const express = require('express');
const { z } = require('zod');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../../../models/Admin');
const validate = require('../../../middleware/validate');
const authMiddleware = require('../../../middleware/auth');
const { loginLimiter } = require('../../../middleware/rateLimit');
const { config } = require('../../../config/env');
const { getAuthCookieOptions, getClearCookieOptions } = require('../../../config/cookies');

const router = express.Router();

const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required').max(80),
  password: z.string().min(1, 'Password is required')
});

/**
 * POST /api/v1/admin/auth/login (and /api/v1/admin/login)
 * Authenticates admin and sets httpOnly session cookie
 */
router.post('/login', loginLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const cleanUsername = username.toLowerCase().trim();

    const admin = await Admin.findOne({ username: cleanUsername });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }

    const secret = config.jwtSecret;
    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      secret,
      { expiresIn: '8h' }
    );

    res.cookie('token', token, getAuthCookieOptions());

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        username: admin.username
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/admin/auth/logout (and /api/v1/admin/logout)
 * Clears session cookie matching identical security flags
 */
router.post('/logout', (req, res) => {
  res.clearCookie('token', getClearCookieOptions());
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * GET /api/v1/admin/auth/me (and /api/v1/admin/me)
 * Returns authenticated admin session info
 */
router.get('/me', authMiddleware, (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      username: req.admin.username
    }
  });
});

module.exports = router;

