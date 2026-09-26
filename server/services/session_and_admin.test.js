const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const express = require('express');

const { sessionMiddleware, switchRole, ROLES, SESSION_COOKIE_NAME } = require('../middleware/session');
const authRoute = require('../routes/auth');
const documentsRoute = require('../routes/documents');
const adminRoute = require('../routes/admin');
const { clearStore } = require('../services/documentStore');

const app = express();
app.use(express.json());
app.use(sessionMiddleware);
app.use('/api/auth', authRoute);
app.use('/api/documents', documentsRoute);
app.use('/api/admin', adminRoute);

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
});

test.beforeEach(() => {
  clearStore();
});

test('sessionMiddleware establishes HttpOnly cookie and provides default user session', async () => {
  const res = await fetch(`${baseUrl}/api/auth/me`);
  assert.equal(res.status, 200);

  const cookie = res.headers.get('set-cookie');
  assert.ok(cookie);
  assert.match(cookie, new RegExp(SESSION_COOKIE_NAME));
  assert.match(cookie, /HttpOnly/i);

  const body = await res.json();
  assert.equal(body.authenticated, true);
  assert.ok(body.user.role);
});

test('RBAC switch-role allows changing roles and enforces access boundaries', async () => {
  // 1. Establish session
  const initRes = await fetch(`${baseUrl}/api/auth/me`);
  const cookie = initRes.headers.get('set-cookie');

  // 2. Switch to admin
  const switchAdminRes = await fetch(`${baseUrl}/api/auth/switch-role`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ role: ROLES.ADMIN }),
  });
  assert.equal(switchAdminRes.status, 200);

  // 3. Admin can access /api/admin/metrics
  const adminRes = await fetch(`${baseUrl}/api/admin/metrics`, {
    headers: { Cookie: cookie },
  });
  assert.equal(adminRes.status, 200);
  const metrics = await adminRes.json();
  assert.equal(metrics.status, 'ok');
  assert.ok(metrics.operationalKPIs);

  // 4. Switch to viewer (read-only)
  await fetch(`${baseUrl}/api/auth/switch-role`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ role: ROLES.VIEWER }),
  });

  // 5. Viewer is forbidden from admin metrics
  const forbiddenRes = await fetch(`${baseUrl}/api/admin/metrics`, {
    headers: { Cookie: cookie },
  });
  assert.equal(forbiddenRes.status, 403);
  const forbiddenBody = await forbiddenRes.json();
  assert.match(forbiddenBody.error, /Forbidden/);
});

test('documents API provides persistent CRUD operations for analyzed contracts', async () => {
  // 1. Save document
  const saveRes = await fetch(`${baseUrl}/api/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Commercial Lease Agreement',
      docType: 'lease',
      text: 'Sample contract body...',
      result: { summary: 'Commercial lease summary', clauses: [{ title: 'Rent', risk: 'medium' }] },
    }),
  });
  assert.equal(saveRes.status, 201);
  const savedDoc = await saveRes.json();
  assert.equal(savedDoc.document.title, 'Commercial Lease Agreement');
  assert.equal(savedDoc.document.version, 'v1');

  // 2. List documents
  const listRes = await fetch(`${baseUrl}/api/documents`);
  const list = await listRes.json();
  assert.equal(list.count, 1);
  assert.equal(list.documents[0].id, savedDoc.document.id);

  // 3. Fetch single document
  const singleRes = await fetch(`${baseUrl}/api/documents/${savedDoc.document.id}`);
  assert.equal(singleRes.status, 200);
  const single = await singleRes.json();
  assert.equal(single.document.text, 'Sample contract body...');

  // 4. Delete document
  const delRes = await fetch(`${baseUrl}/api/documents/${savedDoc.document.id}`, { method: 'DELETE' });
  assert.equal(delRes.status, 200);

  const listAfter = await fetch(`${baseUrl}/api/documents`).then((r) => r.json());
  assert.equal(listAfter.count, 0);
});
