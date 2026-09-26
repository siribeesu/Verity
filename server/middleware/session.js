/**
 * Backend-for-Frontend (BFF) Session & RBAC Middleware
 * Manages secure, HttpOnly session state and role-based access control.
 */

const crypto = require('crypto');

const SESSIONS = new Map();
const SESSION_COOKIE_NAME = 'legalassist_session';
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

const ROLES = {
  ADMIN: 'admin',
  REVIEWER: 'reviewer',
  VIEWER: 'viewer',
};

const ROLE_PERMISSIONS = {
  admin: ['read', 'analyze', 'compare', 'ask', 'save', 'delete', 'metrics', 'audit', 'purge'],
  reviewer: ['read', 'analyze', 'compare', 'ask', 'save', 'delete'],
  viewer: ['read', 'export'],
};

function parseCookies(cookieHeader) {
  const list = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const name = parts.shift().trim();
    const value = decodeURIComponent(parts.join('='));
    list[name] = value;
  });
  return list;
}

function sessionMiddleware(req, res, next) {
  const cookies = parseCookies(req.headers.cookie);
  let sessionId = cookies[SESSION_COOKIE_NAME];
  let session = sessionId ? SESSIONS.get(sessionId) : null;

  if (!session || Date.now() - session.createdAt > SESSION_MAX_AGE_MS) {
    // Generate new session (defaulting to reviewer role)
    sessionId = crypto.randomBytes(24).toString('hex');
    session = {
      id: sessionId,
      userId: `usr_${crypto.randomBytes(4).toString('hex')}`,
      role: process.env.NODE_ENV === 'development' ? ROLES.ADMIN : ROLES.REVIEWER,
      createdAt: Date.now(),
      lastActive: Date.now(),
    };
    SESSIONS.set(sessionId, session);

    // Set HttpOnly cookie
    const isSecure = process.env.NODE_ENV === 'production' && !process.env.DEV_MODE;
    const cookieString = `${SESSION_COOKIE_NAME}=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400${isSecure ? '; Secure' : ''}`;
    res.setHeader('Set-Cookie', cookieString);
  } else {
    session.lastActive = Date.now();
  }

  req.session = session;
  req.userRole = session.role;
  req.permissions = ROLE_PERMISSIONS[session.role] || [];
  next();
}

function requireRole(allowedRoles) {
  return (req, res, next) => {
    const role = req.session?.role || ROLES.VIEWER;
    if (allowedRoles.includes(role)) {
      return next();
    }
    return res.status(403).json({
      error: 'Forbidden: Insufficient privileges for this legal action.',
      requiredRoles: allowedRoles,
      currentRole: role,
    });
  };
}

function switchRole(sessionId, newRole) {
  const session = SESSIONS.get(sessionId);
  if (!session) return null;
  if (!Object.values(ROLES).includes(newRole)) return null;
  session.role = newRole;
  return session;
}

function invalidateSession(sessionId) {
  if (sessionId) SESSIONS.delete(sessionId);
}

module.exports = {
  sessionMiddleware,
  requireRole,
  switchRole,
  invalidateSession,
  ROLES,
  ROLE_PERMISSIONS,
  SESSION_COOKIE_NAME,
};
