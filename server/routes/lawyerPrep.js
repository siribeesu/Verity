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
    const highRisk = analyzeResult.clauses.filter((c) => c.risk === 'high');
    const mediumRisk = analyzeResult.clauses.filter((c) => c.risk === 'medium');

    const analysisSummary = `
DOCUMENT SUMMARY: ${analyzeResult.summary || 'N/A'}

HIGH-RISK CLAUSES:
${highRisk.length ? highRisk.map((c) => `- ${c.title} (${c.category}): ${c.explanation}\n  Excerpt: "${c.original_excerpt}"\n  Risk reason: ${c.risk_reason}`).join('\n') : 'None identified'}

MEDIUM-RISK CLAUSES:
${mediumRisk.length ? mediumRisk.map((c) => `- ${c.title} (${c.category}): ${c.explanation}\n  Excerpt: "${c.original_excerpt}"\n  Risk reason: ${c.risk_reason}`).join('\n') : 'None identified'}

KEY TERMS:
${(analyzeResult.key_terms || []).map((t) => `- ${t.term}: ${t.meaning}`).join('\n')}

SUGGESTED ACTION ITEMS (from analysis):
${(analyzeResult.action_items || []).map((a) => `- ${a}`).join('\n')}
`.trim();

    const result = await structuredCompletion({
      systemPrompt,
      userContent: `Based on this document analysis, generate attorney consultation questions:\n\n${analysisSummary}`,
      maxTokens: 2048,
    });

    return res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
