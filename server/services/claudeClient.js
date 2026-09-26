/**
 * Multi-provider LLM client for Verity.
 * Supports: Anthropic Claude, OpenAI, Google Gemini, xAI Grok.
 *
 * Set PROVIDER=anthropic|openai|gemini|grok in server/.env
 * along with the appropriate API key.
 */

const PROVIDER = (process.env.PROVIDER || 'anthropic').toLowerCase();
const SUPPORTED_PROVIDERS = new Set(['anthropic', 'openai', 'gemini', 'grok']);

if (!SUPPORTED_PROVIDERS.has(PROVIDER)) {
  throw new Error(`Unsupported LLM provider: ${PROVIDER}`);
}

// ── Anthropic ─────────────────────────────────────────────────────────────────
async function anthropicStructured({ systemPrompt, userContent, maxTokens }) {
  const Anthropic = require('@anthropic-ai/sdk');
  const client = new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY });
  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userContent }],
  });

  return extractJSON(response.content[0]?.text ?? '');
}

async function anthropicStream({ systemPrompt, messages, maxTokens, onDelta, onComplete }) {
  const Anthropic = require('@anthropic-ai/sdk');
  const client = new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY });
  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5';

  let fullText = '';
  const stream = await client.messages.stream({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages,
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
      const delta = event.delta.text;
      fullText += delta;
      if (onDelta) onDelta(delta);
    }
  }
  if (onComplete) onComplete(fullText);
  return fullText;
}

// ── OpenAI ────────────────────────────────────────────────────────────────────
async function openaiStructured({ systemPrompt, userContent, maxTokens }) {
  const { default: OpenAI } = require('openai');
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL || 'gpt-4o';

  const response = await client.chat.completions.create({
    model,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
  });

  return extractJSON(response.choices[0]?.message?.content ?? '');
}

async function openaiStream({ systemPrompt, messages, maxTokens, onDelta, onComplete }) {
  const { default: OpenAI } = require('openai');
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL || 'gpt-4o';

  let fullText = '';
  const stream = await client.chat.completions.create({
    model,
    max_tokens: maxTokens,
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content || '';
    if (delta) {
      fullText += delta;
      if (onDelta) onDelta(delta);
    }
  }
  if (onComplete) onComplete(fullText);
  return fullText;
}

// ── Gemini ────────────────────────────────────────────────────────────────────
async function geminiStructured({ systemPrompt, userContent, maxTokens }) {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const preferredModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
  const candidateModels = [preferredModel, 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.7-flash']
    .filter((m, i, arr) => arr.indexOf(m) === i);

  let lastError;
  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
        generationConfig: {
          maxOutputTokens: maxTokens,
          responseMimeType: 'application/json',
        },
      });

      const result = await model.generateContent(userContent);
      return extractJSON(result.response.text());
    } catch (err) {
      lastError = err;
      const isTemporary = err.status === 503 || err.status === 404 || err.status === 429 ||
        err.message?.includes('503') || err.message?.includes('404') || err.message?.includes('high demand');
      if (isTemporary) {
        console.warn(`[Gemini] Model ${modelName} returned temporary status (${err.status || 503}), trying next model candidate...`);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}


async function geminiStream({ systemPrompt, messages, maxTokens, onDelta, onComplete }) {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const preferredModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
  const candidateModels = [preferredModel, 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-3.7-flash']
    .filter((m, i, arr) => arr.indexOf(m) === i);

  let lastError;
  for (const modelName of candidateModels) {
    try {
      const geminiModel = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
        generationConfig: { maxOutputTokens: maxTokens },
      });

      const history = messages.slice(0, -1).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));
      const lastMsg = messages[messages.length - 1];

      const chat = geminiModel.startChat({ history });
      const streamResult = await chat.sendMessageStream(lastMsg.content);

      let fullText = '';
      for await (const chunk of streamResult.stream) {
        const delta = chunk.text();
        fullText += delta;
        if (onDelta) onDelta(delta);
      }
      if (onComplete) onComplete(fullText);
      return fullText;
    } catch (err) {
      lastError = err;
      const isTemporary = err.status === 503 || err.status === 404 || err.status === 429 ||
        err.message?.includes('503') || err.message?.includes('404') || err.message?.includes('high demand');
      if (isTemporary) {
        console.warn(`[Gemini Stream] Model ${modelName} returned temporary status (${err.status || 503}), trying next model candidate...`);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}


// ── Grok (xAI — OpenAI-compatible) ───────────────────────────────────────────
async function grokStructured({ systemPrompt, userContent, maxTokens }) {
  const { default: OpenAI } = require('openai');
  const client = new OpenAI({
    apiKey: process.env.GROK_API_KEY,
    baseURL: 'https://api.x.ai/v1',
  });
  const model = process.env.GROK_MODEL || 'grok-3';

  const response = await client.chat.completions.create({
    model,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
  });

  return extractJSON(response.choices[0]?.message?.content ?? '');
}

async function grokStream({ systemPrompt, messages, maxTokens, onDelta, onComplete }) {
  const { default: OpenAI } = require('openai');
  const client = new OpenAI({
    apiKey: process.env.GROK_API_KEY,
    baseURL: 'https://api.x.ai/v1',
  });
  const model = process.env.GROK_MODEL || 'grok-3';

  let fullText = '';
  const stream = await client.chat.completions.create({
    model,
    max_tokens: maxTokens,
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content || '';
    if (delta) {
      fullText += delta;
      if (onDelta) onDelta(delta);
    }
  }
  if (onComplete) onComplete(fullText);
  return fullText;
}

// ── JSON extraction helper ────────────────────────────────────────────────────
function extractJSON(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = fenced ? fenced[1].trim() : text.trim();

  // 1. Try direct parse
  try {
    return JSON.parse(jsonStr);
  } catch {}

  // 2. Remove trailing commas before closing braces/brackets
  const cleaned = jsonStr.replace(/,\s*([\]}])/g, '$1').trim();
  try {
    return JSON.parse(cleaned);
  } catch {}

  // 3. Find JSON object or array anywhere in text
  const match = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (match) {
    try {
      return JSON.parse(match[0].replace(/,\s*([\]}])/g, '$1'));
    } catch {}
  }

  throw new Error(`LLM returned non-JSON response: ${text.slice(0, 300)}`);
}

// ── Public API ────────────────────────────────────────────────────────────────
async function structuredCompletion(args) {
  switch (PROVIDER) {
    case 'openai':  return openaiStructured(args);
    case 'gemini':  return geminiStructured(args);
    case 'grok':    return grokStructured(args);
    default:        return anthropicStructured(args);  // 'anthropic'
  }
}

async function streamCompletion(args) {
  switch (PROVIDER) {
    case 'openai':  return openaiStream(args);
    case 'gemini':  return geminiStream(args);
    case 'grok':    return grokStream(args);
    default:        return anthropicStream(args);      // 'anthropic'
  }
}

function getActiveProvider() {
  return PROVIDER;
}

module.exports = { structuredCompletion, streamCompletion, getActiveProvider };
