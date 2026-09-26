const test = require('node:test');
const assert = require('node:assert/strict');
const { sanitizePII } = require('./piiSanitizer');

test('sanitizePII returns empty output for empty or non-string input', () => {
  assert.deepEqual(sanitizePII(''), { sanitizedText: '', redactionsCount: 0 });
  assert.deepEqual(sanitizePII(null), { sanitizedText: '', redactionsCount: 0 });
});

test('sanitizePII redacts SSNs, cards, emails, and phone numbers', () => {
  const text = 'Tenant John Doe (SSN: 123-45-6789, phone: (555) 234-5678, email: john@example.com, card: 4111-2222-3333-4444) agrees to pay rent.';
  const result = sanitizePII(text);

  assert.equal(result.redactionsCount, 4);
  assert.match(result.sanitizedText, /\[REDACTED SSN\]/);
  assert.match(result.sanitizedText, /\[REDACTED PHONE\]/);
  assert.match(result.sanitizedText, /\[REDACTED EMAIL\]/);
  assert.match(result.sanitizedText, /\[REDACTED ACCOUNT\/CARD\]/);
  assert.doesNotMatch(result.sanitizedText, /123-45-6789/);
  assert.doesNotMatch(result.sanitizedText, /john@example\.com/);
});

test('sanitizePII preserves text without personal information', () => {
  const text = 'The lease term shall commence on October 1 and terminate on September 30.';
  const result = sanitizePII(text);
  assert.equal(result.redactionsCount, 0);
  assert.equal(result.sanitizedText, text);
});
