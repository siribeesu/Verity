const express = require('express');
const router = express.Router();

const { streamCompletion } = require('../services/claudeClient');
const { chunk, retrieveRelevant } = require('../services/chunker');
const { buildAskPrompt } = require('../prompts/ask');

// POST /api/ask
// Body: { text, messages: [{role, content}], question }
// Streams SSE: data: {"delta":"...", "done":false} ... data: {"done":true, "excerpt":"..."}
router.post('/', async (req, res, next) => {
  try {
    const { text, messages = [], question } = req.body;

    if (!text || text.trim().length < 10) {
      return res.status(400).json({ error: 'No document text provided.' });
    }
    if (!question || question.trim().length < 2) {
      return res.status(400).json({ error: 'No question provided.' });
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const sendEvent = (data) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // Retrieve relevant chunks for long documents
    const chunks = chunk(text);
    const relevantChunks = retrieveRelevant(chunks, question, 3);
    const documentContext = relevantChunks.join('\n\n---\n\n');

    const systemPrompt = buildAskPrompt({ documentContext });

    // Build conversation history
    const conversationMessages = [
      ...messages.slice(-8), // keep last 8 turns for context
      { role: 'user', content: question },
    ];

    let fullResponse = '';

    await streamCompletion({
      systemPrompt,
      messages: conversationMessages,
      maxTokens: 1024,
      onDelta: (delta) => {
        fullResponse += delta;
        // Don't send the source block as it streams — we'll parse it at the end
        // But DO stream the main response text
        const sourceBlockStart = fullResponse.indexOf('```source');
        if (sourceBlockStart === -1) {
          sendEvent({ delta, done: false });
        }
        // Once we hit the source block, stop streaming text (handle at end)
      },
      onComplete: (full) => {
        // Parse out source excerpt
        let excerpt = null;
        const sourceMatch = full.match(/```source\s*([\s\S]*?)```/);
        if (sourceMatch) {
          try {
            const parsed = JSON.parse(sourceMatch[1].trim());
            excerpt = parsed.excerpt || null;
          } catch {
            excerpt = null;
          }
        }

        // Clean the displayed text (remove source block)
        const displayText = full.replace(/```source[\s\S]*?```/g, '').trim();

        sendEvent({ done: true, excerpt, fullText: displayText });
        res.end();
      },
    });
  } catch (err) {
    console.error('[Ask Route Error]', err);
    try {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    } catch {
      next(err);
    }
  }
});

module.exports = router;
