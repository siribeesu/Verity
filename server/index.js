require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const Redis = require('ioredis');

const { getActiveProvider } = require('./services/claudeClient');
const analyzeRoute = require('./routes/analyze');
const compareRoute = require('./routes/compare');
const askRoute = require('./routes/ask');
const lawyerPrepRoute = require('./routes/lawyerPrep');

const app = express();
const PORT = process.env.PORT || 3001;
const providerKeyNames = {
  anthropic: 'ANTHROPIC_API_KEY',
  openai: 'OPENAI_API_KEY',
  gemini: 'GEMINI_API_KEY',
  grok: 'GROK_API_KEY',
};
const activeProvider = getActiveProvider();
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  if (!process.env[providerKeyNames[activeProvider]]) {
    throw new Error(`${providerKeyNames[activeProvider]} must be configured in production.`);
  }
  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL must be configured in production for shared rate limiting.');
  }
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

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    callback(null, !origin || allowedOrigins.has(origin));
  },
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const rateLimitWindowMs = Number(process.env.API_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
const rateLimitMax = Number(process.env.API_RATE_LIMIT_MAX || 200);

if (!Number.isSafeInteger(rateLimitWindowMs) || rateLimitWindowMs < 1000) {
  throw new Error('API_RATE_LIMIT_WINDOW_MS must be an integer of at least 1000.');
}
if (!Number.isSafeInteger(rateLimitMax) || rateLimitMax < 1) {
  throw new Error('API_RATE_LIMIT_MAX must be a positive integer.');
}

let rateLimitStore;
if (process.env.REDIS_URL) {
  const redisClient = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
  });
  redisClient.on('error', (error) => {
    console.error('[Rate Limit Redis Error]', error.message);
  });
  rateLimitStore = new RedisStore({
    sendCommand: (command, ...args) => redisClient.call(command, ...args),
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

// File upload (memory storage — files parsed immediately, not persisted)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
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

// Routes
app.use('/api/analyze', analyzeRoute);
app.use('/api/compare', compareRoute);
app.use('/api/ask', askRoute);
app.use('/api/lawyer-prep', lawyerPrepRoute);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'legalassist-server', provider: getActiveProvider() }));

// Global error handler
app.use((err, _req, res, _next) => {
  const status = err.statusCode || err.status || 500;
  console.error('[LegalAssist Server Error]', err.message || 'Unknown error');
  res.status(status).json({
    error: status >= 500 ? 'Internal server error' : err.message,
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
