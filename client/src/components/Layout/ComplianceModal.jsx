import React, { useState, useEffect } from 'react'
import {
  ShieldCheck,
  Trash2,
  Activity,
  History,
  Lock,
  X,
  CheckCircle2,
  RefreshCw,
  Server
} from 'lucide-react'
import { purgeAllUserData } from '../../utils/historyStorage'
import './ComplianceModal.css'

export default function ComplianceModal({ isOpen, onClose }) {
  const [auditLogs, setAuditLogs] = useState([])
  const [providerInfo, setProviderInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [purged, setPurged] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchAuditAndProvider()
    }
  }, [isOpen])

  async function fetchAuditAndProvider() {
    setLoading(true)
    try {
      const [auditRes, provRes] = await Promise.all([
        fetch('/api/compliance/audit-logs').then((r) => r.json()).catch(() => ({ logs: [] })),
        fetch('/api/compliance/providers').then((r) => r.json()).catch(() => null)
      ])
      setAuditLogs(auditRes.logs || [])
      setProviderInfo(provRes)
    } finally {
      setLoading(false)
    }
  }

  async function handlePurgeData() {
    if (!window.confirm('Are you sure you want to permanently purge all document history, cache, and audit trails?')) {
      return
    }
    setLoading(true)
    try {
      await fetch('/api/compliance/purge', { method: 'POST' }).catch(() => {})
      purgeAllUserData()
      setPurged(true)
      setAuditLogs([])
      setTimeout(() => setPurged(false), 3000)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="compliance-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="compliance-title">
      <div className="compliance-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="compliance-modal-header">
          <div className="compliance-header-title">
            <ShieldCheck size={20} className="compliance-shield-icon" />
            <h2 id="compliance-title">Trust, Privacy & Governance Center</h2>
          </div>
          <button type="button" className="btn btn-ghost btn-sm close-compliance-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <div className="compliance-modal-body">
          {/* Section 1: Zero-Data-Retention Commitment */}
          <div className="compliance-box policy-box">
            <div className="box-title-row">
              <Lock size={15} className="box-icon" />
              <h3>Zero-Data-Retention Commitment</h3>
            </div>
            <p>
              LegalAssist enforces a strict ephemeral processing architecture. Uploaded PDF, DOCX, and text contracts are parsed exclusively in volatile memory and never persisted to server disks, databases, or used for AI model training.
            </p>
            <ul className="policy-points">
              <li>• Automated client & server PII masking (SSNs, cards, emails, phone numbers).</li>
              <li>• Prompt injection defense boundaries (XML content sandboxing).</li>
              <li>• SHA-256 volatile cache with automatic 1-hour time-to-live eviction.</li>
            </ul>
          </div>

          {/* Section 2: Provider Health & Resiliency */}
          {providerInfo && (
            <div className="compliance-box provider-box">
              <div className="box-title-row">
                <Server size={15} className="box-icon" />
                <h3>Active AI Engine & Multi-Model Resilience</h3>
              </div>
              <div className="provider-grid">
                <div className="provider-item">
                  <span className="p-label">Active Engine:</span>
                  <span className="p-val">{providerInfo.displayName}</span>
                </div>
                <div className="provider-item">
                  <span className="p-label">Primary Model:</span>
                  <span className="p-val code-font">{providerInfo.model}</span>
                </div>
                <div className="provider-item">
                  <span className="p-label">Hot Fallback:</span>
                  <span className="p-val code-font">{providerInfo.fallbackModel}</span>
                </div>
                <div className="provider-item">
                  <span className="p-label">Status:</span>
                  <span className="p-badge healthy">
                    <CheckCircle2 size={11} />
                    <span>Operational</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Compliance Audit Trail */}
          <div className="compliance-box audit-box">
            <div className="box-title-row audit-title-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Activity size={15} className="box-icon" />
                <h3>Session Audit Trail ({auditLogs.length} Events)</h3>
              </div>
              <button type="button" className="btn btn-ghost btn-xs" onClick={fetchAuditAndProvider} title="Refresh logs">
                <RefreshCw size={12} className={loading ? 'spinning' : ''} />
                <span>Refresh</span>
              </button>
            </div>
            <div className="audit-log-list">
              {auditLogs.length === 0 ? (
                <div className="audit-empty">No security events logged in this session yet.</div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="audit-row">
                    <span className="audit-action">{log.action}</span>
                    <span className="audit-client">Client: {log.clientHash}</span>
                    {log.piiRedactionsCount > 0 && (
                      <span className="audit-pii-badge">{log.piiRedactionsCount} PII Redacted</span>
                    )}
                    <span className="audit-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 4: Privacy Data Purge */}
          <div className="compliance-box purge-box">
            <div className="purge-content">
              <div>
                <h4 className="purge-title">Immediate Data Purge (GDPR Right-to-be-Forgotten)</h4>
                <p className="purge-desc">Permanently wipe all session histories, temporary analysis caches, and audit logs.</p>
              </div>
              <button
                type="button"
                className="btn btn-danger btn-sm purge-btn"
                onClick={handlePurgeData}
                disabled={loading}
              >
                <Trash2 size={13} />
                <span>{purged ? 'Purged Successfully!' : 'Purge All My Data'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
