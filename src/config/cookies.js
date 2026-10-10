const { config } = require('./env');

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours

/**
 * Options used to set the admin session cookie
 */
function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: config.cookieSameSite,
    maxAge: SESSION_DURATION_MS,
    path: '/'
  };
}

/**
 * Options used to clear the admin session cookie.
 * Must match the domain/path/secure/sameSite flags of getAuthCookieOptions
 * so browsers reliably drop the cookie across all deployment topologies.
 */
function getClearCookieOptions() {
  return {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: config.cookieSameSite,
    path: '/'
  };
}

module.exports = {
  SESSION_DURATION_MS,
  getAuthCookieOptions,
  getClearCookieOptions
};

