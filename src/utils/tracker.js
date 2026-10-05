const crypto = require('crypto');
const { UAParser } = require('ua-parser-js');
const { config } = require('../config/env');

/**
 * Hashes client IP with SHA-256 and secret salt to protect privacy.
 * The salt comes from backend/.env (IP_HASH_SALT) with no hard-coded fallback.
 */
function hashIp(ip) {
  const salt = config.ipHashSalt;
  const cleanIp = ip ? String(ip).trim() : 'unknown';
  return crypto.createHash('sha256').update(cleanIp + salt).digest('hex');
}

/**
 * Extracts device category and browser details from user agent string
 */
function parseUserAgent(userAgentString) {
  if (!userAgentString) {
    return { device: 'Desktop', browser: 'Unknown' };
  }

  const parser = new UAParser(userAgentString);
  const result = parser.getResult();

  let deviceType = 'Desktop';
  if (result.device.type === 'mobile') {
    deviceType = 'Mobile';
  } else if (result.device.type === 'tablet') {
    deviceType = 'Tablet';
  } else if (result.device.type) {
    deviceType = result.device.type.charAt(0).toUpperCase() + result.device.type.slice(1);
  }

  const browserName = result.browser.name
    ? `${result.browser.name}${result.browser.major ? ' ' + result.browser.major : ''}`
    : 'Unknown';

  return {
    device: deviceType,
    browser: browserName
  };
}

module.exports = { hashIp, parseUserAgent };

