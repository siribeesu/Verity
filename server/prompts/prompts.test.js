const test = require('node:test');
const assert = require('node:assert/strict');

const { buildAnalyzePrompt } = require('./analyze');
const { buildAskPrompt } = require('./ask');
const { buildComparePrompt } = require('./compare');
const { buildLawyerPrepPrompt } = require('./lawyerPrep');

test('buildAnalyzePrompt includes the selected level, document type, and jurisdiction', () => {
  const prompt = buildAnalyzePrompt({
    readingLevel: 'beginner',
    docType: 'lease',
    jurisdiction: 'California',
  });

  assert.match(prompt, /Use very simple language/);
  assert.match(prompt, /DOCUMENT TYPE: lease/);
  assert.match(prompt, /indicated they are in: California/);
  assert.match(prompt, /verbatim excerpt/);
})

test('buildAnalyzePrompt defaults unknown reading levels and missing jurisdiction', () => {
  const prompt = buildAnalyzePrompt({ readingLevel: 'unknown' });

  assert.match(prompt, /Use plain language/);
  assert.match(prompt, /DOCUMENT TYPE: general/);
  assert.match(prompt, /No jurisdiction was specified/);
})

test('buildAskPrompt inserts document context and requires source grounding', () => {
  const prompt = buildAskPrompt({ documentContext: 'Rent is due on the first day.' });

  assert.match(prompt, /Rent is due on the first day\./);
  assert.match(prompt, /Answer ONLY based on the document text above/);
  assert.match(prompt, /```source/);
})

test('buildComparePrompt includes document type and neutral comparison instructions', () => {
  const prompt = buildComparePrompt({ docType: 'NDA' });

  assert.match(prompt, /DOCUMENT TYPE: NDA/);
  assert.match(prompt, /Do NOT declare one document "better" or "worse"/);
  assert.match(prompt, /"differences"/);
})

test('buildLawyerPrepPrompt limits questions to analysis-grounded attorney preparation', () => {
  const prompt = buildLawyerPrepPrompt();

  assert.match(prompt, /SPECIFIC to this document/);
  assert.match(prompt, /not grounded in something actually flagged/);
  assert.match(prompt, /"why_it_matters"/);
})