const express = require('express');
const router = express.Router();
const multer = require('multer');

const { structuredCompletion } = require('../services/claudeClient');
const { parseFile } = require('../services/documentParser');
const { chunk } = require('../services/chunker');
const { MAX_DOCUMENT_CHARS, MAX_UPLOAD_BYTES } = require('../services/documentLimits');
const { buildAnalyzePrompt } = require('../prompts/analyze');
const { sanitizePII } = require('../services/piiSanitizer');
const { generateCacheKey, getCachedAnalysis, setCachedAnalysis } = require('../services/analysisCache');
const { logAuditEvent } = require('../services/auditLogger');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_UPLOAD_BYTES } });

// POST /api/analyze
// Body: { text?, readingLevel?, docType?, jurisdiction? }
// File: optional multipart file field "document"
router.post('/', upload.single('document'), async (req, res, next) => {
  try {
    let text = req.body.text || '';
    const readingLevel = req.body.readingLevel || 'informed';
    const docType = req.body.docType || 'general';
    const jurisdiction = req.body.jurisdiction || null;

    // Parse uploaded file if present
    if (req.file) {
      text = await parseFile(req.file.buffer, req.file.mimetype);
    }

    if (text.length > MAX_DOCUMENT_CHARS) {
      return res.status(413).json({ error: `Document exceeds the ${MAX_DOCUMENT_CHARS}-character limit.` });
    }

    if (!text || text.trim().length < 50) {
      return res.status(400).json({ error: 'Please provide a document with at least 50 characters of text.' });
    }

    // Server-side PII sanitization for all input (both uploaded files and text)
    const { sanitizedText, redactionsCount } = sanitizePII(text);

    // Fast-path: SHA-256 analysis cache check
    const cacheKey = generateCacheKey({ text: sanitizedText, docType, readingLevel, jurisdiction });
    const cached = getCachedAnalysis(cacheKey);
    if (cached) {
      return res.json({ ...cached, fromCache: true, piiRedactionsCount: redactionsCount });
    }

    const systemPrompt = buildAnalyzePrompt({ readingLevel, docType, jurisdiction });

    // Handle long documents by chunking and merging results
    const chunks = chunk(sanitizedText);

    if (chunks.length === 1) {
      // Simple case — single chunk
      const result = await structuredCompletion({
        systemPrompt,
        userContent: `Please analyze this legal document:\n\n<document_content>\n${sanitizedText}\n</document_content>`,
        maxTokens: 4096,
      });
      const finalResult = { ...result, chunkCount: 1, piiRedactionsCount: redactionsCount };
      setCachedAnalysis(cacheKey, finalResult);
      logAuditEvent({
        action: 'DOCUMENT_ANALYSIS',
        ip: req.ip,
        piiCount: redactionsCount,
        details: { docType, readingLevel, jurisdiction, chunks: 1 },
      });
      return res.json(finalResult);
    }

    // Multi-chunk: analyze with concurrency limit of 2 to avoid provider rate limits/overload
    const chunkResults = [];
    for (let i = 0; i < chunks.length; i += 2) {
      const batch = chunks.slice(i, i + 2);
      const batchResults = await Promise.all(
        batch.map((c, batchIdx) =>
          structuredCompletion({
            systemPrompt,
            userContent: `Please analyze this section (part ${i + batchIdx + 1} of ${chunks.length}) of a legal document:\n\n<document_content>\n${c}\n</document_content>`,
            maxTokens: 3000,
          })
        )
      );
      chunkResults.push(...batchResults);
    }

    // Merge chunk results
    const merged = {
      summary: chunkResults[0]?.summary || '',
      clauses: chunkResults.flatMap((r) => r?.clauses || []),
      key_terms: deduplicateByKey(chunkResults.flatMap((r) => r?.key_terms || []), 'term'),
      action_items: deduplicateStrings(chunkResults.flatMap((r) => r?.action_items || [])),
      chunkCount: chunks.length,
      piiRedactionsCount: redactionsCount,
    };

    setCachedAnalysis(cacheKey, merged);
    return res.json(merged);
  } catch (err) {
    next(err);
  }
});

function deduplicateByKey(arr, key) {
  const seen = new Set();
  return arr.filter((item) => {
    const k = (item[key] || '').toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function deduplicateStrings(arr) {
  return [...new Set(arr)];
}

module.exports = router;
