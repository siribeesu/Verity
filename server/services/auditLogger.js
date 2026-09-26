/**
 * LegalAssist Audit & Compliance Logger
 * Provides structured, privacy-preserving event logging for compliance,
 * GDPR auditability, and operational visibility without recording raw PII or secrets.
 */

const crypto = require('crypto');

// In-memory circular buffer for the most recent 100 audit events
const MAX_LOGS = 100;
const auditTrail = [];

/**
 * Hash an IP address for privacy-compliant traceability
 */
function hashIdentifier(id) {
  if (!id) return 'anonymous';
  return crypto.createHash('sha256').update(String(id)).digest('hex').slice(0, 12);
}

/**
 * Record a compliance/audit event
 * @param {object} event - { action, ip, details, piiCount, status }
 */
function logAuditEvent({ action, ip, details = {}, piiCount = 0, status = 'success' }) {
  const entry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    action,
    clientHash: hashIdentifier(ip),
    piiRedactionsCount: piiCount,
    status,
    metadata: {
      ...details,
      // Ensure no raw document content or API keys leak into logs
      content: undefined,
      text: undefined,
      key: undefined,
    },
  };

  if (auditTrail.length >= MAX_LOGS) {
    auditTrail.shift();
  }
  auditTrail.push(entry);

  if (process.env.NODE_ENV !== 'test') {
    console.log(`[AUDIT] ${entry.timestamp} | ${entry.action} | Status: ${entry.status} | Client: ${entry.clientHash} | PII Scrubbed: ${entry.piiRedactionsCount}`);
  }

  return entry;
}

/**
 * Retrieve the audit trail (newest first)
 */
function getAuditLogs(limit = 50) {
  return [...auditTrail].reverse().slice(0, limit);
}

/**
 * Clear audit logs (used for data purging / privacy deletion requests)
 */
function purgeAuditLogs() {
  const count = auditTrail.length;
  auditTrail.length = 0;
  return { purgedCount: count, timestamp: new Date().toISOString() };
}

module.exports = {
  logAuditEvent,
  getAuditLogs,
  purgeAuditLogs,
  hashIdentifier,
};
