const crypto = require('crypto');
const net = require('net');
const { UAParser } = require('ua-parser-js');
const { config } = require('../config/env');

// ip-api.com free tier does not support HTTPS (HTTP only on free tier)
const GEO_API = 'http://ip-api.com/json';

/**
 * Hashes client IP with SHA-256 and secret salt to protect visitor privacy.
 */
function hashIp(ip) {
  const salt = config.ipHashSalt;
  const cleanIp = ip ? String(ip).trim() : 'unknown';
  return crypto.createHash('sha256').update(cleanIp + salt).digest('hex');
}

/**
 * Checks if an IP is loopback or private RFC 1918 / RFC 4193
 */
function isLocalOrPrivateIp(ip) {
  if (!ip) return true;
  if (ip === '::1' || ip === '127.0.0.1') return true;
  if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.16.') || ip.startsWith('fc00:') || ip.startsWith('fe80:')) {
    return true;
  }
  return false;
}

/**
 * Resolves a geographic area from an IP using geolocation lookup.
 * Returns "Unknown" on any failure or invalid IP.
 */
async function resolveAreaFromIp(ip) {
  const cleanIp = String(ip || '').trim();

  // Validate that the string is actually an IPv4 or IPv6 address
  if (!cleanIp || net.isIP(cleanIp) === 0) {
    return 'Unknown';
  }

  if (isLocalOrPrivateIp(cleanIp)) {
    return 'Localhost';
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    // ip-api.com free tier fields: status, city, regionName, country (note: 'country', not 'countryName')
    const res = await fetch(`${GEO_API}/${encodeURIComponent(cleanIp)}?fields=status,city,regionName,country`, {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) return 'Unknown';
    const data = await res.json();
    if (data.status !== 'success') return 'Unknown';

    const parts = [data.city, data.regionName, data.country].filter(Boolean);
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

module.exports = { hashIp, parseUserAgent, resolveAreaFromIp, isLocalOrPrivateIp };
