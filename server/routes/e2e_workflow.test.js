const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const express = require('express');

// Mock LLM Client to verify complete end-to-end integration contracts
const servicePath = require.resolve('../services/claudeClient');
const originalServiceModule = require.cache[servicePath];

let capturedStructuredCalls = [];
let capturedStreamCalls = [];

require.cache[servicePath] = {
  id: servicePath,
  filename: servicePath,
  loaded: true,
  exports: {
    async structuredCompletion(args) {
      capturedStructuredCalls.push(args);
      if (args.userContent.includes('generate attorney consultation questions')) {
        return {
          questions: [
            { question: 'Does Section 2 automatic renewal allow early termination without 15% penalty?', why_it_matters: 'Prevents unintended financial commitment.' }
          ]
        };
      }
      if (args.userContent.includes('Compare these two documents')) {
        return {
          overview: 'Document B adds a 30-day early termination right.',
          differences: [
            { category: 'Termination', docA: 'Strict 12-month lock-in', docB: '30-day notice permitted', significance: 'Tenant gains exit flexibility.' }
          ]
        };
      }
      // Analyze route default
      return {
        summary: 'A 12-month residential lease with strict renewal and indemnity terms.',
        clauses: [
          { title: 'Automatic Renewal', category: 'Term', explanation: 'Renews automatically with 15% rent increase.', risk: 'high', original_excerpt: 'shall automatically renew' },
          { title: 'Indemnification', category: 'Liability', explanation: 'Broad tenant liability for landlord negligence.', risk: 'high', original_excerpt: 'indemnify, defend, and hold harmless' }
        ],
        key_terms: [{ term: 'Premises', meaning: 'The rented property' }],
        action_items: ['Provide written notice 90 days before lease end']
      };
    },
    async streamCompletion({ onDelta, onComplete }) {
      capturedStreamCalls.push(true);
      onDelta('Yes, Section 2 states the lease automatically renews for 12 months.');
      onComplete('Yes, Section 2 states the lease automatically renews for 12 months.\n```source\n{"excerpt":"shall automatically renew for an additional twelve (12) month term"}\n```');
    }
  }
};

const app = express();
app.use(express.json());
app.use('/api/analyze', require('./analyze'));
app.use('/api/compare', require('./compare'));
app.use('/api/ask', require('./ask'));
app.use('/api/lawyer-prep', require('./lawyerPrep'));

let server;
let baseUrl;

test.before(async () => {
  server = app.listen(0);
  await once(server, 'listening');
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
  if (originalServiceModule) require.cache[servicePath] = originalServiceModule;
  else delete require.cache[servicePath];
});

test.beforeEach(() => {
  capturedStructuredCalls = [];
  capturedStreamCalls = [];
});

test('E2E Full Workflow: Analyze -> Grounded Q&A -> Lawyer Prep Agenda -> Contract Comparison', async () => {
  const leaseDocument = `
    RESIDENTIAL LEASE AGREEMENT
    Term: 12 months commencing Nov 1. Unless Tenant provides notice at least 90 days prior,
    this lease shall automatically renew with a 15% rent increase.
    Tenant covenants to indemnify, defend, and hold harmless Landlord even for landlord negligence.
  `.trim();

  // 1. Step 1: User analyzes contract
  const analyzeRes = await fetch(`${baseUrl}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: leaseDocument, docType: 'lease', readingLevel: 'informed' })
  });
  assert.equal(analyzeRes.status, 200);
  const analyzeData = await analyzeRes.json();
  assert.equal(analyzeData.clauses.length, 2);
  assert.equal(analyzeData.clauses[0].risk, 'high');
  assert.equal(analyzeData.action_items[0], 'Provide written notice 90 days before lease end');

  // 2. Step 2: User asks a specific question about renewal grounded in the document
  const askRes = await fetch(`${baseUrl}/api/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: leaseDocument,
      question: 'Does this lease automatically renew?'
    })
  });
  assert.equal(askRes.status, 200);
  const sseBody = await askRes.text();
  assert.match(sseBody, /automatically renews/);
  assert.match(sseBody, /"excerpt":"shall automatically renew/);

  // 3. Step 3: User transitions to Lawyer Prep to generate consultation questions
  const prepRes = await fetch(`${baseUrl}/api/lawyer-prep`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ analyzeResult: analyzeData })
  });
  assert.equal(prepRes.status, 200);
  const prepData = await prepRes.json();
  assert.ok(prepData.questions.length > 0);
  assert.match(prepData.questions[0].question, /automatic renewal/);

  // 4. Step 4: Landlord sends Revision B; User compares original vs modified lease
  const revisedLease = `${leaseDocument}\nTenant may terminate early upon 30 days written notice.`;
  const compareRes = await fetch(`${baseUrl}/api/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      textA: leaseDocument,
      textB: revisedLease,
      docType: 'lease'
    })
  });
  assert.equal(compareRes.status, 200);
  const compareData = await compareRes.json();
  assert.match(compareData.overview, /30-day early termination/);
  assert.equal(compareData.differences[0].category, 'Termination');
});
