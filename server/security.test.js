const test = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');

const previousVercel = process.env.VERCEL;
const previousCorsOrigins = process.env.CORS_ORIGINS;
const previousNodeEnv = process.env.NODE_ENV;
const previousRedisUrl = process.env.REDIS_URL;
const previousRateLimitMax = process.env.API_RATE_LIMIT_MAX;
const previousAuthIssuer = process.env.AUTH_ISSUER;
const previousAuthAudience = process.env.AUTH_AUDIENCE;
const previousAuthJwksUrl = process.env.AUTH_JWKS_URL;
process.env.VERCEL = '1';
process.env.CORS_ORIGINS = 'https://app.example.com, https://admin.example.com';
process.env.NODE_ENV = 'test';
process.env.REDIS_URL = '';
process.env.API_RATE_LIMIT_MAX = '2';
delete process.env.AUTH_ISSUER;
delete process.env.AUTH_AUDIENCE;
delete process.env.AUTH_JWKS_URL;

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
  if (previousNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = previousNodeEnv;
  if (previousRedisUrl === undefined) delete process.env.REDIS_URL;
  else process.env.REDIS_URL = previousRedisUrl;
  if (previousRateLimitMax === undefined) delete process.env.API_RATE_LIMIT_MAX;
  else process.env.API_RATE_LIMIT_MAX = previousRateLimitMax;
  if (previousAuthIssuer === undefined) delete process.env.AUTH_ISSUER;
  else process.env.AUTH_ISSUER = previousAuthIssuer;
  if (previousAuthAudience === undefined) delete process.env.AUTH_AUDIENCE;
  else process.env.AUTH_AUDIENCE = previousAuthAudience;
  if (previousAuthJwksUrl === undefined) delete process.env.AUTH_JWKS_URL;
  else process.env.AUTH_JWKS_URL = previousAuthJwksUrl;
});

test('CORS allows configured origins without enabling credentialed requests', async () => {
  const response = await fetch(`${baseUrl}/api/health`, {
    headers: { Origin: 'https://app.example.com' },
  });

  assert.equal(response.headers.get('access-control-allow-origin'), 'https://app.example.com');
  assert.equal(response.headers.get('access-control-allow-credentials'), null);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('x-frame-options'), 'SAMEORIGIN');
  assert.equal(response.headers.get('ratelimit-limit'), '2');
});

test('CORS omits permission headers for origins outside the allowlist', async () => {
  const response = await fetch(`${baseUrl}/api/health`, {
    headers: { Origin: 'https://untrusted.example' },
  });

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('access-control-allow-origin'), null);
});

test('API rate limiter rejects requests after the configured quota', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  const body = await response.json();

  assert.equal(response.status, 429);
  assert.match(body.error, /Too many requests/);
});

test('production startup fails without shared Redis rate limiting', () => {
  const { spawnSync } = require('node:child_process');
  const path = require('node:path');
  const result = spawnSync(process.execPath, ['-e', "require('./server/index')"], {
    cwd: path.resolve(__dirname, '..'),
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PROVIDER: 'anthropic',
      ANTHROPIC_API_KEY: 'test-key',
      REDIS_URL: '',
    },
    encoding: 'utf8',
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /REDIS_URL must be configured in production/);
});

test('production startup fails when the selected provider key is missing', () => {
  const { spawnSync } = require('node:child_process');
  const path = require('node:path');
  const result = spawnSync(process.execPath, ['-e', "require('./server/index')"], {
    cwd: path.resolve(__dirname, '..'),
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PROVIDER: 'anthropic',
      ANTHROPIC_API_KEY: '',
      REDIS_URL: 'redis://localhost:6379',
    },
    encoding: 'utf8',
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /ANTHROPIC_API_KEY must be configured in production/);
});

test('Vercel preview startup also requires production credentials', () => {
  const { spawnSync } = require('node:child_process');
  const path = require('node:path');
  const result = spawnSync(process.execPath, ['-e', "require('./server/index')"], {
    cwd: path.resolve(__dirname, '..'),
    env: {
      ...process.env,
      NODE_ENV: 'preview',
      VERCEL: '1',
      PROVIDER: 'anthropic',
      ANTHROPIC_API_KEY: '',
      REDIS_URL: '',
      AUTH_ISSUER: '',
      AUTH_AUDIENCE: '',
      AUTH_JWKS_URL: '',
    },
    encoding: 'utf8',
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /ANTHROPIC_API_KEY must be configured in production/);
});

test('production startup rejects example placeholder provider keys', () => {
  const { spawnSync } = require('node:child_process');
  const path = require('node:path');
  const result = spawnSync(process.execPath, ['-e', "require('./server/index')"], {
    cwd: path.resolve(__dirname, '..'),
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PROVIDER: 'anthropic',
      ANTHROPIC_API_KEY: 'replace_with_anthropic_api_key',
      REDIS_URL: 'redis://localhost:6379',
      AUTH_ISSUER: 'https://identity.example.com/',
      AUTH_AUDIENCE: 'legalassist-api',
      AUTH_JWKS_URL: 'https://identity.example.com/.well-known/jwks.json',
    },
    encoding: 'utf8',
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /ANTHROPIC_API_KEY must be configured in production/);
});

test('production startup fails when OIDC verification settings are missing', () => {
  const { spawnSync } = require('node:child_process');
  const path = require('node:path');
  const result = spawnSync(process.execPath, ['-e', "require('./server/index')"], {
    cwd: path.resolve(__dirname, '..'),
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PROVIDER: 'anthropic',
      ANTHROPIC_API_KEY: 'test-key',
      REDIS_URL: 'redis://localhost:6379',
      REQUIRE_AUTH: 'true',
      AUTH_ISSUER: '',
      AUTH_AUDIENCE: '',
      AUTH_JWKS_URL: '',
    },
    encoding: 'utf8',
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /AUTH_ISSUER, AUTH_AUDIENCE, and AUTH_JWKS_URL must be configured/);
});