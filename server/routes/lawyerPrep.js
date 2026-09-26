const express = require('express');
const router = express.Router();

const { structuredCompletion } = require('../services/claudeClient');
const { buildLawyerPrepPrompt } = require('../prompts/lawyerPrep');
const { sanitizePII } = require('../services/piiSanitizer');
const { generateCacheKey, getCachedAnalysis, setCachedAnalysis } = require('../services/analysisCache');

// POST /api/lawyer-prep
// Body: { analyzeResult } — the full JSON from the Analyze endpoint
router.post('/', async (req, res, next) => {
  try {
    const { analyzeResult } = req.body;

    if (!analyzeResult || !analyzeResult.clauses?.length) {
      return res.status(400).json({ error: 'No analysis result provided. Run Analyze first.' });
    }

    const clauses = Array.isArray(analyzeResult.clauses) ? analyzeResult.clauses : [];

    // Cache check for Lawyer Prep
    const cacheKey = generateCacheKey({
      type: 'lawyer_prep',
      summary: analyzeResult.summary || '',
      clausesCount: clauses.length,
      firstClause: clauses[0]?.title || '',
    });
    const cached = getCachedAnalysis(cacheKey);
    if (cached) {
      return res.json({ ...cached, fromCache: true });
    }

    const systemPrompt = buildLawyerPrepPrompt();

    // Summarize the analysis for the prompt (focus on high/medium risk)
    const highRisk = clauses.filter((c) => c?.risk === 'high');
    const mediumRisk = clauses.filter((c) => c?.risk === 'medium');

    const analysisSummary = `
DOCUMENT SUMMARY: ${sanitizePII(analyzeResult.summary || 'N/A').sanitizedText}

HIGH-RISK CLAUSES:
${highRisk.length ? highRisk.map((c) => `- ${c.title || 'Untitled'} (${c.category || 'General'}): ${sanitizePII(c.explanation || '').sanitizedText}\n  Excerpt: "${sanitizePII(c.original_excerpt || '').sanitizedText}"\n  Risk reason: ${sanitizePII(c.risk_reason || '').sanitizedText}`).join('\n') : 'None identified'}

MEDIUM-RISK CLAUSES:
${mediumRisk.length ? mediumRisk.map((c) => `- ${c.title || 'Untitled'} (${c.category || 'General'}): ${sanitizePII(c.explanation || '').sanitizedText}\n  Excerpt: "${sanitizePII(c.original_excerpt || '').sanitizedText}"\n  Risk reason: ${sanitizePII(c.risk_reason || '').sanitizedText}`).join('\n') : 'None identified'}

KEY TERMS:
${(Array.isArray(analyzeResult.key_terms) ? analyzeResult.key_terms : []).map((t) => `- ${t.term || ''}: ${sanitizePII(t.meaning || '').sanitizedText}`).join('\n')}

SUGGESTED ACTION ITEMS (from analysis):
${(Array.isArray(analyzeResult.action_items) ? analyzeResult.action_items : []).map((a) => `- ${sanitizePII(a || '').sanitizedText}`).join('\n')}
`.trim();

    const rawResult = await structuredCompletion({
      systemPrompt,
      userContent: `Based on this document analysis, generate attorney consultation questions:\n\n<document_analysis>\n${analysisSummary}\n</document_analysis>`,
      maxTokens: 2048,
    });

    // Normalize output: ensure { questions: [...] }
    let questions = [];
    if (Array.isArray(rawResult)) {
      questions = rawResult;
    } else if (Array.isArray(rawResult?.questions)) {
      questions = rawResult.questions;
    } else if (rawResult && typeof rawResult === 'object') {
      const arrayVal = Object.values(rawResult).find(Array.isArray);
      questions = arrayVal || [];
    }

    const finalResult = { questions };
    setCachedAnalysis(cacheKey, finalResult);
    return res.json(finalResult);
  } catch (err) {
    console.error('[Lawyer Prep Error]', err.message);
    const isOverloaded = err.status === 503 || err.message?.includes('503') || err.message?.includes('high demand');
    if (isOverloaded) {
      return res.status(503).json({
        error: 'The AI model is temporarily experiencing high traffic. Please try generating questions again in a moment.'
      });
    }
    next(err);
  }
});

module.exports = router;
