const test = require('node:test');
const assert = require('node:assert/strict');
const {
  saveDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
  saveComparison,
  getComparisons,
  deleteComparison,
  clearStore,
} = require('./documentStore');

test.beforeEach(() => {
  clearStore();
});

test('saveDocument creates and versions documents persistently', () => {
  const doc1 = saveDocument({
    title: 'Standard Lease',
    docType: 'lease',
    text: 'Agreement v1 text...',
    result: { summary: 'Lease summary', clauses: [{ risk: 'high' }] },
  });

  assert.equal(doc1.title, 'Standard Lease');
  assert.equal(doc1.version, 'v1');
  assert.equal(doc1.metrics.clauseCount, 1);
  assert.equal(doc1.metrics.highRiskCount, 1);

  // Save revision with same title -> increments version to v2
  const doc2 = saveDocument({
    title: 'Standard Lease',
    docType: 'lease',
    text: 'Agreement v2 text...',
    result: { summary: 'Lease summary revision', clauses: [] },
  });

  assert.equal(doc2.title, 'Standard Lease');
  assert.equal(doc2.version, 'v2');

  const list = getDocuments();
  assert.equal(list.length, 2);
  assert.equal(list[0].version, 'v2');
  assert.equal(list[1].version, 'v1');
});

test('getDocumentById and deleteDocument manage single documents', () => {
  const saved = saveDocument({
    title: 'Non-Disclosure Agreement',
    docType: 'NDA',
    text: 'Confidentiality text...',
    result: { summary: 'NDA summary' },
  });

  const fetched = getDocumentById(saved.id);
  assert.equal(fetched.id, saved.id);
  assert.equal(fetched.text, 'Confidentiality text...');

  const deleted = deleteDocument(saved.id);
  assert.equal(deleted, true);
  assert.equal(getDocumentById(saved.id), null);
});

test('saveComparison and getComparisons track comparison records', () => {
  const comp = saveComparison({
    title: 'Lease Revision Comparison',
    docType: 'lease',
    textA: 'Version A',
    textB: 'Version B',
    result: { overview: 'Added early exit clause.', differences: [{ category: 'Exit' }] },
  });

  assert.equal(comp.title, 'Lease Revision Comparison');
  assert.equal(comp.differencesCount, 1);

  const list = getComparisons();
  assert.equal(list.length, 1);
  assert.equal(list[0].id, comp.id);

  deleteComparison(comp.id);
  assert.equal(getComparisons().length, 0);
});
