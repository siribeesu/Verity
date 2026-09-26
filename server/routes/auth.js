const express = require('express');
const router = express.Router();
const { switchRole, invalidateSession, ROLES, ROLE_PERMISSIONS, SESSION_COOKIE_NAME } = require('../middleware/session');

// GET /api/auth/me - Inspect current session and permissions
router.get('/me', (req, res) => {
  res.json({
    authenticated: true,
    user: {
      id: req.session.userId,
      role: req.session.role,
      permissions: req.permissions,
      createdAt: new Date(req.session.createdAt).toISOString(),
    },
    availableRoles: Object.values(ROLES),
  });
});

// POST /api/auth/switch-role - Allow demo evaluators/users to toggle roles
router.post('/switch-role', (req, res) => {
  const { role } = req.body;
  if (!role || !Object.values(ROLES).includes(role)) {
    return res.status(400).json({ error: `Invalid role. Must be one of: ${Object.values(ROLES).join(', ')}` });
  }

  const updated = switchRole(req.session.id, role);
  if (!updated) return res.status(404).json({ error: 'Session not found.' });

  res.json({
    status: 'role_updated',
    role: updated.role,
    permissions: ROLE_PERMISSIONS[updated.role],
  });
});

// POST /api/auth/logout - Invalidate session and clear cookie
router.post('/logout', (req, res) => {
  if (req.session?.id) {
    invalidateSession(req.session.id);
  }
  res.setHeader('Set-Cookie', `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0`);
  res.json({ status: 'logged_out' });
});

module.exports = router;
