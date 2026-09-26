const test = require('node:test');
const assert = require('node:assert/strict');

const { chunk, retrieveRelevant } = require('./chunker');

test('chunk leaves short documents unchanged', () => {
  const text = 'First paragraph.\n\nSecond paragraph.';

  assert.deepEqual(chunk(text), [text]);
});

test('chunk splits long documents at paragraph boundaries with overlap', () => {
  const firstParagraph = 'a'.repeat(4000);
  const secondParagraph = 'b'.repeat(4000);
  const thirdParagraph = 'c'.repeat(500);

  const chunks = chunk(`${firstParagraph}\n\n${secondParagraph}\n\n${thirdParagraph}`);

  assert.equal(chunks.length, 2);
  assert.equal(chunks[0], firstParagraph);
  assert.equal(chunks[1], `${firstParagraph.slice(-200)}\n\n${secondParagraph}\n\n${thirdParagraph}`);
});

test('retrieveRelevant returns matching chunks in document order', () => {
  const chunks = [
    'The lease sets out the rent payment date.',
    'The tenant may request termination with notice.',
    'The security deposit is held by the landlord.',
    'Early termination requires written notice.',
  ];

  assert.deepEqual(retrieveRelevant(chunks, 'termination', 2), [chunks[1], chunks[3]]);
});

test('retrieveRelevant returns all chunks when there are no more than k', () => {
  const chunks = ['First section', 'Second section'];

  assert.deepEqual(retrieveRelevant(chunks, 'unmatched query', 2), chunks);
});

test('retrieveRelevant matches case-insensitively and ignores punctuation', () => {
  const chunks = [
    'The lease covers rent increases.',
    'The lease covers repairs.',
    'The lease covers renewal.',
  ];

  assert.deepEqual(retrieveRelevant(chunks, 'RENT!', 1), [chunks[0]]);
});

test('retrieveRelevant keeps the earliest chunk when relevance scores tie', () => {
  const chunks = ['Notice is required.', 'Notice must be written.', 'No notice applies.'];

  assert.deepEqual(retrieveRelevant(chunks, 'notice', 1), [chunks[0]]);
});