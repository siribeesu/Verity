const express = require('express');
const router = express.Router();
const { getAuditLogs, purgeAuditLogs, logAuditEvent } = require('../services/auditLogger');
const { clearCache } = require('../services/analysisCache');
const { checkProviderHealth } = require('../services/providerHealth');

// GET /api/compliance/audit-logs
router.get('/audit-logs', (_req, res) => {
  const logs = getAuditLogs(50);
  res.json({
    status: 'ok',
    count: logs.length,
    logs,
  });
});

// POST /api/compliance/purge
// Triggers an immediate zero-retention data purge for the session/server
router.post('/purge', (req, res) => {
  const auditPurge = purgeAuditLogs();
  clearCache();
  logAuditEvent({
    action: 'DATA_PURGE_REQUESTED',
    ip: req.ip,
    details: { reason: 'User requested zero-retention purge' },
    status: 'completed',
  });

  res.json({
    status: 'purged',
    message: 'All temporary cache, session analysis indices, and audit records have been permanently cleared.',
    timestamp: new Date().toISOString(),
    details: auditPurge,
  });
});

// GET /api/compliance/providers
router.get('/providers', async (_req, res) => {
  const health = await checkProviderHealth();
  res.json(health);
});

module.exports = router;
