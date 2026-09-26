const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { createServer } = require('node:http');
const { exportJWK, generateKeyPair, SignJWT } = require('jose');

const originalEnvironment = {
  NODE_ENV: process.env.NODE_ENV,
  VERCEL: process.env.VERCEL,
  AUTH_ISSUER: process.env.AUTH_ISSUER,
  AUTH_AUDIENCE: process.env.AUTH_AUDIENCE,
  AUTH_JWKS_URL: process.env.AUTH_JWKS_URL,
  REDIS_URL: process.env.REDIS_URL,
  API_USER_RATE_LIMIT_MAX: process.env.API_USER_RATE_LIMIT_MAX,
};

let identityServer;
let apiServer;
let app;
let issuer;
let audience;
let privateKey;
let baseUrl;

test.before(async () => {
  const keyPair = await generateKeyPair('RS256');
  privateKey = keyPair.privateKey;
  const jwk = await exportJWK(keyPair.publicKey);
  Object.assign(jwk, { kid: 'integration-key', alg: 'RS256', use: 'sig' });

  identityServer = createServer((_req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ keys: [jwk] }));
  });
  identityServer.listen(0);
  await once(identityServer, 'listening');

  issuer = `http://127.0.0.1:${identityServer.address().port}/`;
  audience = 'legalassist-api';
  Object.assign(process.env, {
    NODE_ENV: 'test',
    VERCEL: '1',
    AUTH_ISSUER: issuer,
    AUTH_AUDIENCE: audience,
    AUTH_JWKS_URL: `${issuer}.well-known/jwks.json`,
    REDIS_URL: '',
    API_USER_RATE_LIMIT_MAX: '1',
  });

  app = require('./index');
  apiServer = app.listen(0);
  await once(apiServer, 'listening');
  baseUrl = `http://127.0.0.1:${apiServer.address().port}`;
});

test.after(async () => {
  await Promise.all([
    new Promise((resolve, reject) => apiServer.close((error) => error ? reject(error) : resolve())),
    new Promise((resolve, reject) => identityServer.close((error) => error ? reject(error) : resolve())),
  ]);
  for (const [key, value] of Object.entries(originalEnvironment)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

async function makeToken() {
  return new SignJWT({ scope: 'legalassist' })
    .setProtectedHeader({ alg: 'RS256', kid: 'integration-key' })
    .setIssuer(issuer)
    .setAudience(audience)
    .setSubject('integration-user')
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(privateKey);
}

test('health remains public while feature API routes require a verified bearer token', async () => {
  const health = await fetch(`${baseUrl}/api/health`);
  assert.equal(health.status, 200);

  const unauthenticated = await fetch(`${baseUrl}/api/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert.equal(unauthenticated.status, 401);

  const token = await makeToken();
  const authenticated = await fetch(`${baseUrl}/api/compare`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  });
  assert.equal(authenticated.status, 400);
  assert.match((await authenticated.json()).error, /Document A/);

  const overQuota = await fetch(`${baseUrl}/api/compare`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({}),
  });
  assert.equal(overQuota.status, 429);
  assert.match((await overQuota.json()).error, /Too many requests for this account/);
});