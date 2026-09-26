const test = require('node:test');
const assert = require('node:assert/strict');
const { generateCacheKey, getCachedAnalysis, setCachedAnalysis, clearCache } = require('./analysisCache');

test.beforeEach(() => {
  clearCache();
});

test('generateCacheKey generates deterministic SHA-256 hash', () => {
  const key1 = generateCacheKey({ text: 'Sample Contract', docType: 'lease', readingLevel: 'informed' });
  const key2 = generateCacheKey({ text: 'Sample Contract', docType: 'lease', readingLevel: 'informed' });
  const key3 = generateCacheKey({ text: 'Different Contract', docType: 'lease', readingLevel: 'informed' });

  assert.equal(key1, key2);
  assert.notEqual(key1, key3);
  assert.equal(key1.length, 64); // SHA-256 hex string
});

test('getCachedAnalysis returns null for missing or expired entries', () => {
  assert.equal(getCachedAnalysis('nonexistent'), null);
  assert.equal(getCachedAnalysis(null), null);
});

test('setCachedAnalysis stores and retrieves cached analysis', () => {
  const key = generateCacheKey({ text: 'Lease Agreement', docType: 'lease' });
  const data = { summary: 'Lease summary', clauses: [] };

  setCachedAnalysis(key, data);
  const cached = getCachedAnalysis(key);

  assert.deepEqual(cached, data);
});
