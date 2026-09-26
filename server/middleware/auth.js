const { createRemoteJWKSet, errors, jwtVerify } = require('jose');

function createAuthMiddleware({ issuer, audience, jwksUrl }) {
  const keySet = createRemoteJWKSet(new URL(jwksUrl));

  return async function authenticate(req, res, next) {
    const authorization = req.get('authorization') || '';
    const match = authorization.match(/^Bearer\s+([^\s]+)$/i);

    if (!match) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    try {
      const { payload } = await jwtVerify(match[1], keySet, {
        issuer,
        audience,
        algorithms: ['RS256', 'ES256'],
      });
      if (typeof payload.sub !== 'string' || !payload.sub || payload.sub.length > 256) {
        return res.status(401).json({ error: 'Invalid access token.' });
      }
      req.auth = payload;
      return next();
    } catch (error) {
      const status = error instanceof errors.JOSEError ? 401 : 503;
      return res.status(status).json({
        error: status === 401 ? 'Invalid or expired access token.' : 'Authentication service unavailable.',
      });
    }
  };
}

module.exports = { createAuthMiddleware };