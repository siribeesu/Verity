const express = require('express');
const router = express.Router();
const multer = require('multer');

const { structuredCompletion } = require('../services/claudeClient');
const { parseFile } = require('../services/documentParser');
const { buildComparePrompt } = require('../prompts/compare');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// POST /api/compare
// Body: { textA?, textB?, docType? }
// Files: optional multipart fields "documentA" and "documentB"
router.post('/', upload.fields([{ name: 'documentA', maxCount: 1 }, { name: 'documentB', maxCount: 1 }]), async (req, res, next) => {
  try {
    let textA = req.body.textA || '';
    let textB = req.body.textB || '';
    const docType = req.body.docType || 'general';

    if (req.files?.documentA?.[0]) {
      textA = await parseFile(req.files.documentA[0].buffer, req.files.documentA[0].mimetype);
    }
    if (req.files?.documentB?.[0]) {
      textB = await parseFile(req.files.documentB[0].buffer, req.files.documentB[0].mimetype);
    }

    if (!textA || textA.trim().length < 50) {
      return res.status(400).json({ error: 'Document A is too short or missing.' });
    }
    if (!textB || textB.trim().length < 50) {
      return res.status(400).json({ error: 'Document B is too short or missing.' });
    }

    const systemPrompt = buildComparePrompt({ docType });

    const result = await structuredCompletion({
      systemPrompt,
      userContent: `Compare these two documents:\n\n=== DOCUMENT A ===\n${textA}\n\n=== DOCUMENT B ===\n${textB}`,
      maxTokens: 4096,
    });

    return res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
