require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const { getActiveProvider } = require('./services/claudeClient');
const analyzeRoute = require('./routes/analyze');
const compareRoute = require('./routes/compare');
const askRoute = require('./routes/ask');
const lawyerPrepRoute = require('./routes/lawyerPrep');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'verity-server', provider: getActiveProvider() }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error('[Verity Server Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

app.listen(PORT, () => {
  const provider = getActiveProvider();
  console.log(`\n✓ Verity server running at http://localhost:${PORT}`);
  console.log(`  Provider: ${provider.toUpperCase()}`);
  const keyMap = {
    anthropic: 'ANTHROPIC_API_KEY',
    openai: 'OPENAI_API_KEY',
    gemini: 'GEMINI_API_KEY',
    grok: 'GROK_API_KEY',
  };
  const keyName = keyMap[provider] || 'API_KEY';
  if (!process.env[keyName]) {
    console.warn(`⚠  ${keyName} is not set — AI features will fail. Add it to server/.env`);
  }
});
