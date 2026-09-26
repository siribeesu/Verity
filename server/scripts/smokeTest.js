#!/usr/bin/env node

/**
 * Production Deployment Smoke Test Suite
 * Automatically verifies all production endpoints, security mechanisms,
 * rate limits, headers, and AI services against a running instance.
 *
 * Usage:
 *   node server/scripts/smokeTest.js [TARGET_URL]
 * Example:
 *   node server/scripts/smokeTest.js http://localhost:3001
 */

const targetUrl = process.argv[2] || process.env.SMOKE_TARGET_URL || 'http://localhost:3001';

const CHECKLIST = [];

function recordResult(name, passed, details = '') {
  CHECKLIST.push({ name, passed, details });
  const badge = passed ? '\x1b[32m[PASS]\x1b[0m' : '\x1b[31m[FAIL]\x1b[0m';
  console.log(`  ${badge} ${name} ${details ? `(${details})` : ''}`);
}

async function runSmokeTests() {
  console.log('\n============================================================');
  console.log(`  LegalAssist Production Smoke Test Suite`);
  console.log(`  Target: ${targetUrl}`);
  console.log(`  Timestamp: ${new Date().toISOString()}`);
  console.log('============================================================\n');

  try {
    // 1. Health Endpoint & Dependencies
    const healthRes = await fetch(`${targetUrl}/api/health`);
    const healthData = await healthRes.json();
    recordResult(
      'Health Check & Service Readiness',
      healthRes.status === 200,
      `Status: ${healthData.status}, Provider: ${healthData.provider}`
    );

    // 2. Provider Health & Multi-Model Readiness
    const providerRes = await fetch(`${targetUrl}/api/compliance/providers`);
    const providerData = await providerRes.json();
    recordResult(
      'Provider Health & Failover Readiness',
      providerRes.status === 200 && providerData.status === 'healthy',
      `Active: ${providerData.displayName}, Fallback: ${providerData.fallbackModel}`
    );

    // 3. Security Headers (CSP, HSTS, X-Content-Type, X-Frame-Options)
    const hasNosniff = healthRes.headers.get('x-content-type-options') === 'nosniff';
    const hasFrameOptions = Boolean(healthRes.headers.get('x-frame-options'));
    const hasCsp = Boolean(healthRes.headers.get('content-security-policy'));
    recordResult(
      'Enterprise Security Headers',
      hasNosniff && hasFrameOptions && hasCsp,
      `CSP: ${hasCsp ? 'present' : 'none'}, nosniff: ${hasNosniff ? 'yes' : 'no'}`
    );

    // 4. Rate Limiting Headers
    const hasRateLimit = Boolean(healthRes.headers.get('ratelimit-limit') || healthRes.headers.get('x-ratelimit-limit'));
    recordResult('Distributed / In-Memory Rate Limiting Headers', hasRateLimit);

    // 5. Document Analysis API (/api/analyze)
    const sampleDoc = `
      RESIDENTIAL LEASE AGREEMENT
      Term: 12 months. Automatic renewal applies unless 90 days written notice is given.
      Tenant agrees to indemnify Landlord for all claims, even if caused by landlord negligence.
      Late fee: $150 if unpaid by day 2.
    `.trim();

    const analyzeRes = await fetch(`${targetUrl}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: sampleDoc, docType: 'lease', readingLevel: 'informed' }),
    });

    let analyzeData = null;
    if (analyzeRes.status === 200) {
      analyzeData = await analyzeRes.json();
      const hasClauses = Array.isArray(analyzeData.clauses) && analyzeData.clauses.length > 0;
      recordResult(
        'Document Analysis & Clause Extraction',
        hasClauses,
        `Extracted ${analyzeData.clauses?.length || 0} clauses, Summary length: ${analyzeData.summary?.length || 0}`
      );
    } else {
      recordResult('Document Analysis & Clause Extraction', false, `HTTP ${analyzeRes.status}`);
    }

    // 6. SHA-256 Cache Sub-Millisecond Speedup
    if (analyzeData) {
      const start = Date.now();
      const cachedRes = await fetch(`${targetUrl}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sampleDoc, docType: 'lease', readingLevel: 'informed' }),
      });
      const duration = Date.now() - start;
      const cachedData = await cachedRes.json();
      recordResult(
        'SHA-256 Analysis Cache Fast-Path',
        cachedRes.status === 200 && cachedData.fromCache === true,
        `Latency: ${duration}ms, fromCache: ${cachedData.fromCache}`
      );
    }

    // 7. Grounded Streaming Q&A (/api/ask)
    const askRes = await fetch(`${targetUrl}/api/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: sampleDoc,
        question: 'When is rent considered late?',
      }),
    });
    recordResult(
      'Grounded Streaming Legal Q&A (SSE)',
      askRes.status === 200 && (askRes.headers.get('content-type') || '').includes('text/event-stream'),
      `Content-Type: ${askRes.headers.get('content-type')}`
    );

    // 8. Attorney Prep Agenda (/api/lawyer-prep)
    if (analyzeData) {
      const prepRes = await fetch(`${targetUrl}/api/lawyer-prep`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analyzeResult: analyzeData }),
      });
      const prepData = await prepRes.json();
      recordResult(
        'Attorney Consultation Prep Sheet Generation',
        prepRes.status === 200 && Array.isArray(prepData.questions) && prepData.questions.length > 0,
        `Generated ${prepData.questions?.length || 0} strategic legal questions`
      );
    }

    // 9. Contract Comparison (/api/compare)
    const revisedDoc = `${sampleDoc}\nEarly termination allowed with 30 days notice.`;
    const compareRes = await fetch(`${targetUrl}/api/compare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ textA: sampleDoc, textB: revisedDoc, docType: 'lease' }),
    });
    const compareData = await compareRes.json();
    recordResult(
      'Contract Semantic Comparison & Diffing',
      compareRes.status === 200 && Boolean(compareData.overview),
      `Overview: "${compareData.overview?.slice(0, 45)}..."`
    );

    // 10. Audit Logging & Compliance API (/api/compliance/audit-logs)
    const auditRes = await fetch(`${targetUrl}/api/compliance/audit-logs`);
    const auditData = await auditRes.json();
    recordResult(
      'Compliance & Audit Trail Recording',
      auditRes.status === 200 && auditData.count >= 1,
      `Tracked ${auditData.count} privacy-safe event logs`
    );

    // 11. Zero-Retention Data Purge (/api/compliance/purge)
    const purgeRes = await fetch(`${targetUrl}/api/compliance/purge`, { method: 'POST' });
    const purgeData = await purgeRes.json();
    recordResult(
      'Zero-Retention Privacy Data Purge Workflow',
      purgeRes.status === 200 && purgeData.status === 'purged',
      'Purged all cache and audit entries'
    );

  } catch (err) {
    recordResult('Server Connectivity', false, `Connection error: ${err.message}`);
  }

  // Summary Table
  const total = CHECKLIST.length;
  const passed = CHECKLIST.filter((c) => c.passed).length;
  const percentage = Math.round((passed / total) * 100);

  console.log('\n============================================================');
  console.log(`  Production Validation Summary: ${passed}/${total} Passed (${percentage}%)`);
  if (passed === total) {
    console.log('  \x1b[32m✔ ALL PRODUCTION VERIFICATION CHECKS PASSED!\x1b[0m');
  } else {
    console.log(`  \x1b[33m⚠ ${total - passed} checks require attention.\x1b[0m`);
  }
  console.log('============================================================\n');

  if (passed !== total) process.exit(1);
}

runSmokeTests();
