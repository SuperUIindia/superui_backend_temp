/**
 * Single source of truth for runtime configuration.
 *
 * Rules enforced:
 *   1. All critical runtime variables are validated at process startup (fail-fast).
 *   2. JWT_SECRET must be at least 32 characters to ensure secure token generation.
 *   3. CORS origins are strictly matched (no dangerous *.vercel.app wildcards with credentials in production).
 *   4. Sensitive secrets are never exposed in log output.
 */
const path = require('path');
const dns = require('dns');

const ENV_FILE = path.join(__dirname, '../../.env');
require('dotenv').config({ path: ENV_FILE });

class MissingEnvError extends Error {
  constructor(name, hint) {
    super(
      `Missing or invalid required environment variable: ${name}.${hint ? ` ${hint}` : ''}\n` +
      `Check your .env file or hosting environment variables.`
    );
    this.name = 'MissingEnvError';
    this.variable = name;
  }
}

function str(name) {
  const value = process.env[name];
  return typeof value === 'string' ? value.trim() : '';
}

function requiredStr(name, hint) {
  const value = str(name);
  if (!value) throw new MissingEnvError(name, hint);
  return value;
}

function list(name) {
  return str(name)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function requiredInt(name, hint) {
  const raw = requiredStr(name, hint);
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0 || value > 65535) {
    throw new MissingEnvError(name, `${hint || ''} (expected integer 1-65535, received "${raw}")`);
  }
  return value;
}

function requiredUrl(name, hint) {
  const raw = requiredStr(name, hint);
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    throw new MissingEnvError(name, `${hint || ''} (expected absolute URL, received "${raw}")`);
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new MissingEnvError(name, `${hint || ''} (expected http:// or https://, received "${raw}")`);
  }
  return raw.replace(/\/+$/, '');
}

function optionalUrl(name) {
  const raw = str(name);
  if (!raw) return '';
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
  } catch {
    return '';
  }
  return raw.replace(/\/+$/, '');
}

function bool(name, fallback = false) {
  const raw = str(name).toLowerCase();
  if (!raw) return fallback;
  return raw === 'true' || raw === '1' || raw === 'yes' || raw === 'on';
}

function isMongoUri(value) {
  return typeof value === 'string' && /^mongodb(\+srv)?:\/\/.+/.test(value.trim());
}

function redactMongoUri(value) {
  return String(value || '').replace(/\/\/([^:/@]+):([^@]*)@/, '//$1:****@');
}

const DNS_SERVERS = list('DNS_SERVERS');
if (DNS_SERVERS.length > 0) {
  try {
    dns.setServers(DNS_SERVERS);
  } catch (err) {
    console.warn(`Could not apply DNS_SERVERS: ${err.message}`);
  }
}

const NODE_ENV = str('NODE_ENV') || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';

function normalizeOriginEntry(raw) {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return '';
  if (trimmed === '*') return '*';
  return trimmed.replace(/\/+$/, '');
}

const CLIENT_URL = requiredUrl(
  'CLIENT_URL',
  'Public origin of the frontend (e.g. http://localhost:5173 or https://superui.in).'
);

// Allow-list built from CLIENT_URL + CORS_ORIGINS
const rawCorsList = list('CORS_ORIGINS').map(normalizeOriginEntry);
// In production, reject any wildcards in CORS_ORIGINS for credential security
if (IS_PRODUCTION) {
  const hasWildcard = rawCorsList.some((origin) => origin.includes('*'));
  if (hasWildcard) {
    console.warn('[Security Warning] Wildcard CORS origins (*.vercel.app or *) are disabled in production with credentials. Using exact origins only.');
  }
}

const CORS_ORIGINS = [...new Set([
  CLIENT_URL,
  ...rawCorsList.filter((origin) => !IS_PRODUCTION || !origin.includes('*'))
])];

const config = Object.freeze({
  envFile: ENV_FILE,
  nodeEnv: NODE_ENV,
  isProduction: IS_PRODUCTION,
  isTest: NODE_ENV === 'test',

  get port() {
    return requiredInt('PORT', 'TCP port the API listens on.');
  },

  get clientUrl() {
    return CLIENT_URL;
  },

  get siteUrl() {
    return optionalUrl('SITE_URL') || CLIENT_URL;
  },

  get apiPublicUrl() {
    return optionalUrl('API_PUBLIC_URL') || CLIENT_URL;
  },

  get corsOrigins() {
    return [...CORS_ORIGINS];
  },

  get corsAllowAny() {
    return bool('CORS_ALLOW_ANY', false) && !IS_PRODUCTION;
  },

  get trustProxy() {
    const raw = str('TRUST_PROXY').toLowerCase();
    if (!raw) return IS_PRODUCTION ? 1 : false;
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    const asNumber = Number(raw);
    return Number.isFinite(asNumber) && asNumber > 0 ? Math.floor(asNumber) : raw;
  },

  get mongoUri() {
    const value = requiredStr('MONGODB_URI', 'MongoDB connection string.');
    if (!isMongoUri(value)) {
      throw new MissingEnvError('MONGODB_URI', 'Expected a mongodb:// or mongodb+srv:// connection string.');
    }
    return value;
  },

  get localMongoUri() {
    const value = str('LOCAL_MONGODB_URI');
    return isMongoUri(value) ? value : '';
  },

  get sharedMongoUri() {
    const value = str('SHARED_MONGODB_URI');
    return isMongoUri(value) ? value : '';
  },

  get jwtSecret() {
    const secret = requiredStr('JWT_SECRET', 'Secret used to sign admin session tokens.');
    if (secret.length < 32) {
      throw new MissingEnvError(
        'JWT_SECRET',
        `JWT_SECRET must be at least 32 characters for security (currently ${secret.length} characters).`
      );
    }
    return secret;
  },

  get ipHashSalt() {
    return requiredStr('IP_HASH_SALT', 'Salt used to hash visitor IP addresses.');
  },

  get brandName() {
    return str('BRAND_NAME') || str('SITE_NAME') || 'SuperUI';
  },

  get cookieSameSite() {
    const raw = str('COOKIE_SAME_SITE').toLowerCase();
    if (raw === 'none' || raw === 'lax' || raw === 'strict') return raw;
    return 'lax';
  },

  get cookieSecure() {
    const raw = str('COOKIE_SECURE');
    if (raw) return raw === 'true' || raw === '1' || raw === 'yes' || raw === 'on';
    return this.cookieSameSite === 'none' ? true : IS_PRODUCTION;
  },

  get brandSlug() {
    const raw = this.brandName || 'superui';
    return raw.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'superui';
  },

  dnsServers: [...DNS_SERVERS],

  smtp: Object.freeze({
    get host() {
      return str('SMTP_HOST');
    },
    get port() {
      return str('SMTP_PORT') ? Number(str('SMTP_PORT')) : 0;
    },
    get secure() {
      const raw = str('SMTP_SECURE').toLowerCase();
      if (!raw) return false;
      return raw === 'true' || raw === '1' || raw === 'yes' || raw === 'on';
    },
    get user() {
      return str('SMTP_USER');
    },
    get pass() {
      return str('SMTP_PASS');
    },
    get from() {
      return str('SMTP_FROM');
    },
    get notificationEmail() {
      return str('ADMIN_NOTIFICATION_EMAIL');
    },
    get leadNotificationEmail() {
      return str('LEAD_NOTIFICATION_EMAIL') || str('SMTP_USER');
    },
    get configured() {
      return Boolean(str('SMTP_HOST') && str('SMTP_USER') && str('SMTP_PASS'));
    }
  }),

  admin: Object.freeze({
    get username() {
      return requiredStr('ADMIN_USERNAME', 'Username for seeding admin account.');
    },
    get password() {
      return requiredStr('ADMIN_PASSWORD', 'Password for seeding admin account.');
    },
    get configured() {
      return Boolean(str('ADMIN_USERNAME') && str('ADMIN_PASSWORD'));
    }
  })
});

/**
 * Checks Origin header against exact allowed origins.
 */
function isOriginAllowed(origin) {
  if (!origin) return true; // server-to-server, curl, non-browser clients
  if (config.corsAllowAny) return true;

  const normalized = normalizeOriginEntry(origin);
  return config.corsOrigins.includes(normalized);
}

/**
 * Fail-fast startup validation for all required environment variables.
 * Call this before starting server listeners.
 */
function validateStartupEnv() {
  const errors = [];

  try { void config.port; } catch (e) { errors.push(e.message); }
  try { void config.clientUrl; } catch (e) { errors.push(e.message); }
  try { void config.mongoUri; } catch (e) { errors.push(e.message); }
  try { void config.jwtSecret; } catch (e) { errors.push(e.message); }
  try { void config.ipHashSalt; } catch (e) { errors.push(e.message); }

  if (errors.length > 0) {
    console.error('\n======================================================');
    console.error('FATAL: Backend configuration validation failed:');
    errors.forEach((msg, idx) => console.error(`  ${idx + 1}. ${msg}`));
    console.error('======================================================\n');
    throw new Error('Environment configuration validation failed on startup');
  }
}

function describe() {
  return {
    envFile: config.envFile,
    nodeEnv: config.nodeEnv,
    port: str('PORT') || '(unset)',
    clientUrl: config.clientUrl,
    apiPublicUrl: config.apiPublicUrl,
    corsOrigins: config.corsOrigins,
    trustProxy: config.trustProxy,
    mongoUri: redactMongoUri(str('MONGODB_URI')),
    cookieSameSite: config.cookieSameSite,
    cookieSecure: config.cookieSecure,
    dnsServers: config.dnsServers,
    adminCredentials: config.admin.configured ? 'loaded from .env' : 'missing in .env',
    smtpConfigured: config.smtp.configured
  };
}

module.exports = {
  config,
  isOriginAllowed,
  validateStartupEnv,
  redactMongoUri,
  describe,
  MissingEnvError,
  envFile: ENV_FILE,
  str,
  list,
  bool,
  requiredStr,
  requiredInt,
  requiredUrl,
  optionalUrl
};
