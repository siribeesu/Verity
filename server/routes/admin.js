const express = require('express');
const router = express.Router();
const { getDocuments, getComparisons } = require('../services/documentStore');
const { getAuditLogs } = require('../services/auditLogger');
const { checkProviderHealth } = require('../services/providerHealth');
const { requireRole, ROLES } = require('../middleware/session');

// Protect admin metrics route with RBAC (admin only)
router.get('/metrics', requireRole([ROLES.ADMIN]), async (_req, res) => {
  const documents = getDocuments(500);
  const comparisons = getComparisons(200);
  const auditLogs = getAuditLogs(100);
  const providerHealth = await checkProviderHealth();

  // Metrics aggregation
  const totalAnalyzed = documents.length;
  const analysisAudits = auditLogs.filter((l) => l.action === 'DOCUMENT_ANALYSIS');
  const cacheAudits = auditLogs.filter((l) => l.action === 'DOCUMENT_ANALYSIS' && l.metadata?.fromCache);

  const estimatedTokensSaved = (cacheAudits.length * 3500) + (comparisons.length * 2000);
  const estimatedCostAvoided = (estimatedTokensSaved / 1000000) * 0.15; // Gemini Flash pricing approx

  const memUsage = process.memoryUsage();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    operationalKPIs: {
      totalContractsAnalyzed: totalAnalyzed,
      activeComparisonsCount: comparisons.length,
      auditEventsLogged: auditLogs.length,
      cacheHitRatePercent: analysisAudits.length > 0 ? Math.round((cacheAudits.length / analysisAudits.length) * 100) : 0,
      estimatedTokensAvoided: estimatedTokensSaved,
      estimatedDollarsSaved: `$${estimatedCostAvoided.toFixed(4)}`,
    },
    systemHealth: {
      nodeVersion: process.version,
      platform: process.platform,
      memoryRssMb: Math.round(memUsage.rss / 1024 / 1024),
      heapUsedMb: Math.round(memUsage.heapUsed / 1024 / 1024),
    },
    providerStatus: providerHealth,
  });
});

module.exports = router;
