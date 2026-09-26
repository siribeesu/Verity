const express = require('express');
const router = express.Router();
const multer = require('multer');

const { structuredCompletion } = require('../services/claudeClient');
const { parseFile } = require('../services/documentParser');
const { chunk } = require('../services/chunker');
const { MAX_DOCUMENT_CHARS, MAX_UPLOAD_BYTES } = require('../services/documentLimits');
const { buildAnalyzePrompt } = require('../prompts/analyze');

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

    const systemPrompt = buildAnalyzePrompt({ readingLevel, docType, jurisdiction });

    // Handle long documents by chunking and merging results
    const chunks = chunk(text);

    if (chunks.length === 1) {
      // Simple case — single chunk
      const result = await structuredCompletion({
        systemPrompt,
        userContent: `Please analyze this legal document:\n\n${text}`,
        maxTokens: 4096,
      });
      return res.json({ ...result, chunkCount: 1 });
    }

    // Multi-chunk: analyze each chunk and merge
    const chunkResults = await Promise.all(
      chunks.map((c, i) =>
        structuredCompletion({
          systemPrompt,
          userContent: `Please analyze this section (part ${i + 1} of ${chunks.length}) of a legal document:\n\n${c}`,
          maxTokens: 3000,
        })
      )
    );

    // Merge chunk results
    const merged = {
      summary: chunkResults[0].summary,
      clauses: chunkResults.flatMap((r) => r.clauses || []),
      key_terms: deduplicateByKey(chunkResults.flatMap((r) => r.key_terms || []), 'term'),
      action_items: deduplicateStrings(chunkResults.flatMap((r) => r.action_items || [])),
      chunkCount: chunks.length,
    };

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
