/**
 * Single source of truth for every runtime value.
 *
 * Rules enforced here:
 *   1. Nothing is ever hard-coded in application code. Ports, hosts, origins,
 *      URLs, secrets and the admin bootstrap credentials all come from
 *      backend/.env. A missing value is a hard, explicit failure instead of a
 *      silent localhost/127.0.0.1 fallback that could point at the wrong host.
 *   2. Secrets are exposed through functions and are redacted by `describe()`,
 *      so an accidental `console.log(config)` can never leak them.
 *   3. Real environment variables always win over the .env file, which is what
 *      makes the same build safe on Render / Vercel / Docker.
 */
const path = require('path');
const dns = require('dns');

const ENV_FILE = path.join(__dirname, '../../.env');

require('dotenv').config({ path: ENV_FILE });

class MissingEnvError extends Error {
  constructor(name, hint) {
    super(
      `Missing required environment variable ${name}.${hint ? ` ${hint}` : ''}\n` +
        `Add it to ${ENV_FILE} (see .env.example) or export it in the host environment.`
    );
    this.name = 'MissingEnvError';
    this.variable = name;
  }
}

/** Raw string, trimmed. Returns '' when unset. */
function str(name) {
  const value = process.env[name];
  return typeof value === 'string' ? value.trim() : '';
}

/** Raw string or a hard failure. */
function requiredStr(name, hint) {
  const value = str(name);
  if (!value) throw new MissingEnvError(name, hint);
  return value;
}

/** Comma-separated list, blanks removed. */
function list(name) {
  return str(name)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Integer or a hard failure. */
function requiredInt(name, hint) {
  const raw = requiredStr(name, hint);
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0 || value > 65535) {
    throw new MissingEnvError(name, `${hint || ''} (expected an integer 1-65535, received "${raw}")`);
  }
  return value;
}

/** Absolute http(s) URL, or a hard failure. Trailing slashes are removed. */
function requiredUrl(name, hint) {
  const raw = requiredStr(name, hint);
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    throw new MissingEnvError(name, `${hint || ''} (expected an absolute URL, received "${raw}")`);
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

/** Masks the credentials inside a MongoDB URI so it can safely be logged. */
function redactMongoUri(value) {
  return String(value || '').replace(/\/\/([^:/@]+):([^@]*)@/, '//$1:****@');
}

// Public DNS resolvers are needed when the host resolver cannot answer the SRV
// queries that mongodb+srv:// requires (common on corporate/ISP/Windows DNS).
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

// The public origin of the deployed frontend. Used for CORS, canonical URLs,
// the links inside transactional email, and the admin dashboard deep links.
const CLIENT_URL = requiredUrl(
  'CLIENT_URL',
  'Public origin of the frontend, e.g. the Vite dev server in development and the deployed site in production.'
);

/**
 * Normalises a single CORS origin entry: strips trailing slashes and whitespace
 * so "https://www.superui.in/" matches the browser's "https://www.superui.in"
 * Origin header exactly. A bare "*" is preserved as a wildcard.
 */
function normalizeOriginEntry(raw) {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return '';
  if (trimmed === '*') return '*';
  return trimmed.replace(/\/+$/, '');
}

// Extra browser origins allowed to call the API. CLIENT_URL is always allowed.
// Entries may be exact origins ("https://staging.example.com") or a wildcard
// suffix ("*.vercel.app"). Trailing slashes are stripped so a stored value like
// "https://www.superui.in/" still matches the browser's Origin header, which
// never carries a trailing slash.
const CORS_ORIGINS = [...new Set([CLIENT_URL, ...list('CORS_ORIGINS').map(normalizeOriginEntry)])];

const config = Object.freeze({
  envFile: ENV_FILE,
  nodeEnv: NODE_ENV,
  isProduction: IS_PRODUCTION,
  isTest: NODE_ENV === 'test',

  /** Port the API binds to. Never defaulted - it must be declared in .env. */
  get port() {
    return requiredInt('PORT', 'TCP port the API listens on.');
  },

  /** Public origin of the frontend (CORS + email links). */
  get clientUrl() {
    return CLIENT_URL;
  },

  /** Alias kept for readability in mail templates. */
  get siteUrl() {
    return optionalUrl('SITE_URL') || CLIENT_URL;
  },

  /** Externally reachable API origin, used by tooling and health output. */
  get apiPublicUrl() {
    return optionalUrl('API_PUBLIC_URL') || CLIENT_URL;
  },

  get corsOrigins() {
    return [...CORS_ORIGINS];
  },

  /** When true every origin is accepted. Never enable in production. */
  get corsAllowAny() {
    return bool('CORS_ALLOW_ANY', false);
  },

  /** Express `trust proxy` setting, needed for correct client IPs behind Render.
   *
   * Accepts "1" (trust exactly one proxy hop — the safe default for a single
   * reverse proxy like Render), "true" (trust any proxy — only for known-safe
   * multi-hop setups), "false" (never trust), or an integer. Defaults to 1 in
   * production and false in development so the rate limiter does not warn.
   */
  get trustProxy() {
    const raw = str('TRUST_PROXY').toLowerCase();
    if (!raw) return IS_PRODUCTION ? 1 : false;
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    const asNumber = Number(raw);
    return Number.isFinite(asNumber) && asNumber > 0 ? Math.floor(asNumber) : raw;
  },

  get mongoUri() {
    const value = requiredStr('MONGODB_URI', 'MongoDB connection string for the SuperUI database.');
    if (!isMongoUri(value)) {
      throw new MissingEnvError('MONGODB_URI', 'Expected a mongodb:// or mongodb+srv:// connection string.');
    }
    return value;
  },

  /** Optional second connection string, used only by the migration tools. */
  get localMongoUri() {
    const value = str('LOCAL_MONGODB_URI');
    return isMongoUri(value) ? value : '';
  },

  /** Optional shared-database connection string, used only by verifyIsolation. */
  get sharedMongoUri() {
    const value = str('SHARED_MONGODB_URI');
    return isMongoUri(value) ? value : '';
  },

  get jwtSecret() {
    return requiredStr('JWT_SECRET', 'Secret used to sign the admin session cookie.');
  },

  get ipHashSalt() {
    return requiredStr('IP_HASH_SALT', 'Salt used to hash visitor IP addresses before storage.');
  },

  get brandName() {
    return str('BRAND_NAME') || str('SITE_NAME');
  },

  /**
   * Session cookie policy.
   *
   * The frontend and the API often live on different sites in production
   * (e.g. a CDN host and an API host), which requires SameSite=None; Secure.
   * In local development the origins are same-site, so 'lax' is correct and
   * more secure. Declare it in .env rather than guessing from the environment.
   */
  get cookieSameSite() {
    const raw = str('COOKIE_SAME_SITE').toLowerCase();
    if (raw === 'none' || raw === 'lax' || raw === 'strict') return raw;
    return 'lax';
  },

  get cookieSecure() {
    const raw = str('COOKIE_SECURE');
    if (raw) return raw === 'true' || raw === '1' || raw === 'yes' || raw === 'on';
    // SameSite=None is meaningless without Secure.
    return this.cookieSameSite === 'none' ? true : IS_PRODUCTION;
  },

  /** Lowercase brand slug used for generated filenames such as the CSV export. */
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
    /** Where the rich, icon-led "New Lead" alert is delivered on every
     *  submission. Falls back to the SMTP user when unset. */
    get leadNotificationEmail() {
      return str('LEAD_NOTIFICATION_EMAIL') || str('SMTP_USER');
    },
    get configured() {
      return Boolean(str('SMTP_HOST') && str('SMTP_USER') && str('SMTP_PASS'));
    }
  }),

  /**
   * Admin bootstrap credentials. Read straight from .env and never stored
   * anywhere else - no default, no example value, and never included in
   * describe(). `seedAdmin` refuses to run without them.
   */
  admin: Object.freeze({
    get username() {
      return requiredStr('ADMIN_USERNAME', 'Username seeded into the admins collection.');
    },
    get password() {
      return requiredStr('ADMIN_PASSWORD', 'Plaintext password hashed by `npm run seed:admin`.');
    },
    /** True when both variables are present; used to give a helpful error. */
    get configured() {
      return Boolean(str('ADMIN_USERNAME') && str('ADMIN_PASSWORD'));
    }
  })
});

/**
 * Normalises a single CORS origin entry: strips trailing slashes and whitespace
 * so "https://www.superui.in/" matches the browser's "https://www.superui.in"
 * Origin header exactly. A bare "*" is preserved as a wildcard.
 */
function normalizeOriginEntry(raw) {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return '';
  if (trimmed === '*') return '*';
  return trimmed.replace(/\/+$/, '');
}

/**
 * Origin allow-list matcher. Exact origins match directly; entries written as
 "*.example.com" match any subdomain of example.com.
 */
function isOriginAllowed(origin) {
  if (!origin) return true; // curl, server-to-server and native clients send no Origin
  if (config.corsAllowAny) return true;
  return config.corsOrigins.some((allowed) => {
    if (allowed === '*') return true;
    if (allowed.startsWith('*.')) {
      const suffix = allowed.slice(1); // ".example.com"
      return origin === suffix.slice(1) ? false : origin.endsWith(suffix);
    }
    return origin === allowed;
  });
}

/** Safe-to-print summary. Secrets are never included. */
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
    dnsServers: config.dnsServers,
    adminCredentials: config.admin.configured ? 'loaded from .env' : 'missing in .env',
    smtpConfigured: config.smtp.configured
  };
}

module.exports = {
  config,
  isOriginAllowed,
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
