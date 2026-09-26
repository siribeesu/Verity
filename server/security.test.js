const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');

const previousVercel = process.env.VERCEL;
const previousCorsOrigins = process.env.CORS_ORIGINS;
process.env.VERCEL = '1';
process.env.CORS_ORIGINS = 'https://app.example.com, https://admin.example.com';

const app = require('./index');
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
  if (previousVercel === undefined) delete process.env.VERCEL;
  else process.env.VERCEL = previousVercel;
  if (previousCorsOrigins === undefined) delete process.env.CORS_ORIGINS;
  else process.env.CORS_ORIGINS = previousCorsOrigins;
});

test('CORS allows configured origins without enabling credentialed requests', async () => {
  const response = await fetch(`${baseUrl}/api/health`, {
    headers: { Origin: 'https://app.example.com' },
  });

  assert.equal(response.headers.get('access-control-allow-origin'), 'https://app.example.com');
  assert.equal(response.headers.get('access-control-allow-credentials'), null);
});

test('CORS omits permission headers for origins outside the allowlist', async () => {
  const response = await fetch(`${baseUrl}/api/health`, {
    headers: { Origin: 'https://untrusted.example' },
  });

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('access-control-allow-origin'), null);
});