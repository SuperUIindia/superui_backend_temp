const crypto = require('crypto');
const { UAParser } = require('ua-parser-js');
const { config } = require('../config/env');

const GEO_API = 'https://ip-api.com/json';

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
 * Resolves a geographic area from an IP using a free geolocation API.
 * Returns "Unknown" on any failure (timeout, error, blocked).
 */
async function resolveAreaFromIp(ip) {
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return 'Localhost';
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${GEO_API}/${ip}?fields=status,city,regionName,countryName`, {
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) return 'Unknown';
    const data = await res.json();
    if (data.status !== 'success') return 'Unknown';
    const parts = [data.city, data.regionName, data.countryName].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Unknown';
  } catch {
    return 'Unknown';
  }
}

/**
 * Extracts device category, model, vendor and browser details from user agent string.
 * Uses screenWidth as a hint to distinguish laptop from desktop.
 */
function parseUserAgent(userAgentString, screenWidth) {
  if (!userAgentString) {
    return {
      deviceCategory: screenWidth && screenWidth < 1024 ? 'Laptop' : 'Desktop',
      deviceModel: '',
      deviceVendor: '',
      browser: 'Unknown'
    };
  }

  const parser = new UAParser(userAgentString);
  const result = parser.getResult();

  let category = 'Desktop';
  let model = result.device.model || '';
  let vendor = result.device.vendor || '';

  if (result.device.type === 'mobile') {
    category = 'Phone';
  } else if (result.device.type === 'tablet') {
    category = 'Tablet';
  } else if (result.device.type === 'smarttv') {
    category = 'Smart TV';
  } else if (result.device.type === 'wearable') {
    category = 'Wearable';
  } else if (result.device.type === 'console') {
    category = 'Console';
  } else if (!result.device.type || result.device.type === undefined || result.device.type === 'desktop') {
    category = screenWidth && screenWidth < 1024 ? 'Laptop' : 'Desktop';
  }

  const browserName = result.browser.name
    ? `${result.browser.name}${result.browser.major ? ' ' + result.browser.major : ''}`
    : 'Unknown';

  return {
    deviceCategory: category,
    deviceModel: model,
    deviceVendor: vendor,
    browser: browserName
  };
}

module.exports = { hashIp, parseUserAgent, resolveAreaFromIp };

