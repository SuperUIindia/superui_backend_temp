/**
 * Shared HTTP client for the verification scripts (`npm run verify:*`,
 * `npm test`, scripts/verifyLeadsTable.js).
 *
 * Everything - the frontend origin, the API origin and the admin credentials -
 * is resolved from backend/.env via src/config/env.js. No script may hard-code a
 * host, a port or a username/password; that is what this module exists to
 * prevent. The admin password is read from .env at call time and is never
 * printed, stored on disk or returned by an exported value.
 */
const { config } = require('../config/env');

/**
 * API origin used by the scripts.
 *
 * In local development the API is reachable through the Vite proxy on the
 * frontend origin, and directly on its own origin. We prefer the explicit
 * API_PUBLIC_URL from .env and fall back to API_BASE_URL, then to CLIENT_URL
 * (proxy) so the same script works in either topology.
 */
function resolveApiBase() {
  const explicit = process.env.API_BASE_URL && process.env.API_BASE_URL.trim();
  if (explicit) return explicit.replace(/\/+$/, '');
  return config.apiPublicUrl;
}

const API_BASE = resolveApiBase();
const FRONTEND_URL = config.clientUrl;

/** Admin credentials, read from .env on demand so they are never captured early. */
function adminCredentials() {
  return { username: config.admin.username, password: config.admin.password };
}

/** Performs the admin login and returns the httpOnly session cookie header. */
async function loginAsAdmin() {
  const { username, password } = adminCredentials();
  const res = await fetch(`${API_BASE}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  if (!res.ok) {
    throw new Error(
      `Admin login failed with HTTP ${res.status}. Check ADMIN_USERNAME / ADMIN_PASSWORD in ${config.envFile}.`
    );
  }
  const cookies = res.headers.getSetCookie
    ? res.headers.getSetCookie()
    : [res.headers.get('set-cookie')].filter(Boolean);
  const jar = cookies.map((c) => c.split(';')[0]).join('; ');
  if (!jar) throw new Error('Admin login succeeded but no session cookie was returned.');
  return jar;
}

/**
 * Single request helper. `cookie` is optional; `body` is JSON-encoded.
 * Returns { status, json, text } and never throws on a non-2xx status.
 */
async function call(method, path, cookie, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });

  let json = null;
  let text = '';
  try {
    text = await res.text();
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { status: res.status, json, text };
}

/** Same as `call`, but rides an existing Playwright page cookie jar. */
async function callViaPage(page, method, path, body) {
  const res = await page.request.fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body ? { data: body } : {})
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  return { status: res.status(), json };
}

/** Safe banner so a failing run still shows which hosts were exercised. */
function printTargets(label = 'verification target') {
  console.log(`[${label}] frontend : ${FRONTEND_URL}`);
  console.log(`[${label}] api      : ${API_BASE}`);
  console.log(`[${label}] env file : ${config.envFile}`);
}

module.exports = {
  API_BASE,
  FRONTEND_URL,
  adminCredentials,
  loginAsAdmin,
  call,
  callViaPage,
  printTargets,
  config
};
