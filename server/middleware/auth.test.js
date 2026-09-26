const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { createServer } = require('node:http');
const { exportJWK, generateKeyPair, SignJWT } = require('jose');

const { createAuthMiddleware } = require('./auth');

let server;
let issuer;
let privateKey;
let middleware;
const audience = 'legalassist-api';

test.before(async () => {
  const keyPair = await generateKeyPair('RS256');
  privateKey = keyPair.privateKey;
  const publicJwk = await exportJWK(keyPair.publicKey);
  publicJwk.kid = 'test-signing-key';
  publicJwk.alg = 'RS256';
  publicJwk.use = 'sig';

  server = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ keys: [publicJwk] }));
  });
  server.listen(0);
  await once(server, 'listening');
  issuer = `http://127.0.0.1:${server.address().port}/`;
  middleware = createAuthMiddleware({
    issuer,
    audience,
    jwksUrl: `${issuer}.well-known/jwks.json`,
  });
});

test.after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
});

async function issueToken({ tokenIssuer = issuer, tokenAudience = audience, subject = 'user-123' } = {}) {
  return new SignJWT({ scope: 'documents:analyze' })
    .setProtectedHeader({ alg: 'RS256', kid: 'test-signing-key' })
    .setIssuer(tokenIssuer)
    .setAudience(tokenAudience)
    .setSubject(subject)
    .setIssuedAt()
    .setExpirationTime('5m')
    .sign(privateKey);
}

async function invoke(authorization) {
  let status;
  let body;
  let passed = false;
  const req = { get: () => authorization };
  const res = {
    status(code) {
      status = code;
      return this;
    },
    json(value) {
      body = value;
      return this;
    },
  };

  await middleware(req, res, () => { passed = true; });
  return { req, status, body, passed };
}

test('auth middleware rejects missing bearer tokens', async () => {
  const result = await invoke(undefined);

  assert.equal(result.status, 401);
  assert.equal(result.body.error, 'Authentication required.');
  assert.equal(result.passed, false);
});

test('auth middleware verifies issuer and audience before forwarding identity', async () => {
  const token = await issueToken();
  const result = await invoke(`Bearer ${token}`);

  assert.equal(result.passed, true);
  assert.equal(result.req.auth.sub, 'user-123');
  assert.equal(result.req.auth.scope, 'documents:analyze');
});

test('auth middleware rejects tokens issued for another audience', async () => {
  const token = await issueToken({ tokenAudience: 'another-api' });
  const result = await invoke(`Bearer ${token}`);

  assert.equal(result.status, 401);
  assert.equal(result.body.error, 'Invalid or expired access token.');
  assert.equal(result.passed, false);
});

test('auth middleware rejects tokens without a subject claim', async () => {
  const token = await issueToken({ subject: '' });
  const result = await invoke(`Bearer ${token}`);

  assert.equal(result.status, 401);
  assert.equal(result.body.error, 'Invalid access token.');
});