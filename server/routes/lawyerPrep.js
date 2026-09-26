const express = require('express');
const router = express.Router();

const { structuredCompletion } = require('../services/claudeClient');
const { buildLawyerPrepPrompt } = require('../prompts/lawyerPrep');

// POST /api/lawyer-prep
// Body: { analyzeResult } — the full JSON from the Analyze endpoint
router.post('/', async (req, res, next) => {
  try {
    const { analyzeResult } = req.body;

    if (!analyzeResult || !analyzeResult.clauses?.length) {
      return res.status(400).json({ error: 'No analysis result provided. Run Analyze first.' });
    }

    const systemPrompt = buildLawyerPrepPrompt();

    // Summarize the analysis for the prompt (focus on high/medium risk)
    const clauses = Array.isArray(analyzeResult.clauses) ? analyzeResult.clauses : [];
    const highRisk = clauses.filter((c) => c?.risk === 'high');
    const mediumRisk = clauses.filter((c) => c?.risk === 'medium');

    const analysisSummary = `
DOCUMENT SUMMARY: ${analyzeResult.summary || 'N/A'}

HIGH-RISK CLAUSES:
${highRisk.length ? highRisk.map((c) => `- ${c.title || 'Untitled'} (${c.category || 'General'}): ${c.explanation || ''}\n  Excerpt: "${c.original_excerpt || ''}"\n  Risk reason: ${c.risk_reason || ''}`).join('\n') : 'None identified'}

MEDIUM-RISK CLAUSES:
${mediumRisk.length ? mediumRisk.map((c) => `- ${c.title || 'Untitled'} (${c.category || 'General'}): ${c.explanation || ''}\n  Excerpt: "${c.original_excerpt || ''}"\n  Risk reason: ${c.risk_reason || ''}`).join('\n') : 'None identified'}

KEY TERMS:
${(Array.isArray(analyzeResult.key_terms) ? analyzeResult.key_terms : []).map((t) => `- ${t.term || ''}: ${t.meaning || ''}`).join('\n')}

SUGGESTED ACTION ITEMS (from analysis):
${(Array.isArray(analyzeResult.action_items) ? analyzeResult.action_items : []).map((a) => `- ${a}`).join('\n')}
`.trim();

    const rawResult = await structuredCompletion({
      systemPrompt,
      userContent: `Based on this document analysis, generate attorney consultation questions:\n\n${analysisSummary}`,
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

    return res.json({ questions });
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
