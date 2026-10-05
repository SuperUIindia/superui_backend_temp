const jwt = require('jsonwebtoken');
const { config } = require('../config/env');

function authMiddleware(req, res, next) {
  try {
    let token = null;

    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Authentication required'
      });
    }

    // JWT_SECRET comes from backend/.env only. There is deliberately no
    // fallback secret, so a misconfigured deployment fails closed instead of
    // signing tokens with a value that is published in the repository.
    const decoded = jwt.verify(token, config.jwtSecret);

    req.admin = {
      id: decoded.id,
      username: decoded.username
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired session'
    });
  }
}

module.exports = authMiddleware;

