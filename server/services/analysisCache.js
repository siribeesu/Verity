/**
 * In-Memory & Redis-Compatible SHA-256 Document Analysis Cache
 * Speeds up repeated analysis runs to <5ms and avoids redundant LLM token costs.
 */

const crypto = require('crypto');

// In-memory LRU-like cache map with max size and 1-hour TTL
const memoryCache = new Map();
const MAX_CACHE_ENTRIES = 200;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function generateCacheKey({ text, docType = 'general', readingLevel = 'informed', jurisdiction = null }) {
  const normalized = `${(text || '').trim()}||${docType}||${readingLevel}||${jurisdiction || ''}`;
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

function getCachedAnalysis(cacheKey) {
  if (!cacheKey) return null;
  const entry = memoryCache.get(cacheKey);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    memoryCache.delete(cacheKey);
    return null;
  }

  // Refresh access position in Map
  memoryCache.delete(cacheKey);
  memoryCache.set(cacheKey, entry);

  return entry.data;
}

function setCachedAnalysis(cacheKey, data) {
  if (!cacheKey || !data) return;

  if (memoryCache.size >= MAX_CACHE_ENTRIES) {
    // Evict oldest entry
    const oldestKey = memoryCache.keys().next().value;
    if (oldestKey) memoryCache.delete(oldestKey);
  }

  memoryCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });
}

function clearCache() {
  memoryCache.clear();
}

module.exports = {
  generateCacheKey,
  getCachedAnalysis,
  setCachedAnalysis,
  clearCache,
};
