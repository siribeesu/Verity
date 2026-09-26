require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const Redis = require('ioredis');

const { getActiveProvider } = require('./services/claudeClient');
const { MAX_UPLOAD_BYTES } = require('./services/documentLimits');
const { createAuthMiddleware } = require('./middleware/auth');
const analyzeRoute = require('./routes/analyze');
const compareRoute = require('./routes/compare');
const askRoute = require('./routes/ask');
const lawyerPrepRoute = require('./routes/lawyerPrep');
const complianceRoute = require('./routes/compliance');

const app = express();
const PORT = process.env.PORT || 3001;
const providerKeyNames = {
  anthropic: 'ANTHROPIC_API_KEY',
  openai: 'OPENAI_API_KEY',
  gemini: 'GEMINI_API_KEY',
  grok: 'GROK_API_KEY',
};
const activeProvider = getActiveProvider();
const isProduction = process.env.NODE_ENV === 'production' ||
  (process.env.VERCEL === '1' && process.env.NODE_ENV !== 'test');
const authConfig = {
  issuer: process.env.AUTH_ISSUER,
  audience: process.env.AUTH_AUDIENCE,
  jwksUrl: process.env.AUTH_JWKS_URL,
};
const authValues = Object.values(authConfig);
const hasAnyAuthConfig = authValues.some(Boolean);
const hasCompleteAuthConfig = authValues.every(Boolean);

if (isProduction) {
  const providerApiKey = (process.env[providerKeyNames[activeProvider]] || '').trim();
  if (!providerApiKey || /^(your_|replace_with_)/i.test(providerApiKey)) {
    throw new Error(`${providerKeyNames[activeProvider]} must be configured in production.`);
  }
  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL must be configured in production for shared rate limiting.');
  }
  if (process.env.REQUIRE_AUTH === 'true' && !hasCompleteAuthConfig) {
    throw new Error('AUTH_ISSUER, AUTH_AUDIENCE, and AUTH_JWKS_URL must be configured in production.');
  }
}

if (hasAnyAuthConfig && !hasCompleteAuthConfig) {
  throw new Error('Configure AUTH_ISSUER, AUTH_AUDIENCE, and AUTH_JWKS_URL together.');
}

if (hasCompleteAuthConfig && isProduction) {
  for (const setting of ['issuer', 'jwksUrl']) {
    if (new URL(authConfig[setting]).protocol !== 'https:') {
      throw new Error(`AUTH_${setting === 'issuer' ? 'ISSUER' : 'JWKS_URL'} must use HTTPS in production.`);
    }
  }
}

const authenticate = hasCompleteAuthConfig ? createAuthMiddleware(authConfig) : null;

if (isProduction && process.env.REQUIRE_AUTH === 'true' && !authenticate) {
  throw new Error('Authentication must be configured in production.');
}

const trustProxySetting = process.env.TRUST_PROXY;
const trustProxyCount = Number(trustProxySetting);
const trustedProxy = trustProxySetting === undefined
  ? (process.env.VERCEL ? 1 : false)
  : trustProxySetting === 'true'
    ? true
    : trustProxySetting === 'false'
      ? false
      : Number.isInteger(trustProxyCount) && trustProxyCount >= 0
        ? trustProxyCount
        : trustProxySetting;
app.set('trust proxy', trustedProxy);

const allowedOrigins = new Set(
  (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
);

app.disable('x-powered-by');
app.use(compression());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https:'],
      fontSrc: ["'self'", 'data:'],
      objectSrc: ["'none'"],
    },
  },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin' },
}));
app.use(cors({
  origin(origin, callback) {
    callback(null, !origin || allowedOrigins.has(origin));
  },
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

const rateLimitWindowMs = Number(process.env.API_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const rateLimitMax = Number(process.env.API_RATE_LIMIT_MAX || 200);

if (!Number.isSafeInteger(rateLimitWindowMs) || rateLimitWindowMs < 1000) {
  throw new Error('API_RATE_LIMIT_WINDOW_MS must be an integer of at least 1000.');
}
if (!Number.isSafeInteger(rateLimitMax) || rateLimitMax < 1) {
  throw new Error('API_RATE_LIMIT_MAX must be a positive integer.');
}

let rateLimitStore;
let sendRedisCommand;
let redisClient;
if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
  });
  redisClient.on('error', (error) => {
    console.error('[Rate Limit Redis Error]', error.message);
  });
  sendRedisCommand = (command, ...args) => redisClient.call(command, ...args);
  rateLimitStore = new RedisStore({
    prefix: 'legalassist:rate-limit:ip:',
    sendCommand: sendRedisCommand,
  });
}

const apiLimiter = rateLimit({
  windowMs: rateLimitWindowMs,
  limit: rateLimitMax,
  ...(rateLimitStore ? { store: rateLimitStore } : {}),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

app.use('/api/', apiLimiter);

const userRateLimitMax = Number(process.env.API_USER_RATE_LIMIT_MAX || 100);
if (!Number.isSafeInteger(userRateLimitMax) || userRateLimitMax < 1) {
  throw new Error('API_USER_RATE_LIMIT_MAX must be a positive integer.');
}

const userApiLimiter = authenticate
  ? rateLimit({
    windowMs: rateLimitWindowMs,
    limit: userRateLimitMax,
    ...(process.env.REDIS_URL
      ? {
        store: new RedisStore({
          prefix: 'legalassist:rate-limit:user:',
          sendCommand: sendRedisCommand,
        }),
      }
      : {}),
    keyGenerator: (req) => req.auth.sub,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests for this account. Please try again later.' },
  })
  : null;

// File upload (memory storage — files parsed immediately, not persisted)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Unsupported file type. Please upload PDF, DOCX, or TXT.'));
  },
});

// Expose multer upload for routes
app.locals.upload = upload;

// Health check
app.get('/api/health', (_req, res) => {
  const redisReady = !isProduction || redisClient?.status === 'ready';
  return res.status(redisReady ? 200 : 503).json({
    status: redisReady ? 'ok' : 'degraded',
    service: 'legalassist-server',
    provider: getActiveProvider(),
    dependencies: { redis: redisClient ? redisClient.status : 'not-configured' },
  });
});

if (authenticate) app.use('/api', authenticate);
if (userApiLimiter) app.use('/api', userApiLimiter);

app.use('/api/analyze', analyzeRoute);
app.use('/api/compare', compareRoute);
app.use('/api/ask', askRoute);
app.use('/api/lawyer-prep', lawyerPrepRoute);
app.use('/api/compliance', complianceRoute);

// Serve built frontend assets when running in unified production/container mode
const path = require('path');
const fs = require('fs');
const clientDistPath = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global error handler
app.use((err, _req, res, _next) => {
  const status = err.statusCode || err.status || 500;
  console.error('[LegalAssist Server Error]', err.name || 'Error', status, err.message);
  res.status(status).json({
    error: err.message || (status >= 500 ? 'Internal server error' : 'Unknown error'),
  });
});

// Export app for serverless deployment on Vercel
module.exports = app;

// Only start standalone HTTP server in non-serverless environments (local dev)
if (require.main === module || !process.env.VERCEL) {
  app.listen(PORT, () => {
    const provider = getActiveProvider();
    console.log(`\n✓ LegalAssist server running at http://localhost:${PORT}`);
    console.log(`  Provider: ${provider.toUpperCase()}`);
    const keyMap = {
      anthropic: 'ANTHROPIC_API_KEY',
      openai: 'OPENAI_API_KEY',
      gemini: 'GEMINI_API_KEY',
      grok: 'GROK_API_KEY',
    };
    const keyName = keyMap[provider] || 'API_KEY';
    if (!process.env[keyName]) {
      console.warn(`⚠  ${keyName} is not set — AI features will fail. Add it to server/.env or Vercel Environment Variables.`);
    }
  });
}
