import React, { useState, useEffect } from 'react'
import {
  BarChart3,
  X,
  Server,
  TrendingUp,
  Cpu,
  Shield,
  RefreshCw,
  Coins,
  CheckCircle2,
  Lock
} from 'lucide-react'
import './AdminModal.css'

export default function AdminModal({ isOpen, onClose }) {
  const [metrics, setMetrics] = useState(null)
  const [userInfo, setUserInfo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [switchingRole, setSwitchingRole] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  async function loadData() {
    setLoading(true)
    setError(null)
    try {
      const [metRes, userRes] = await Promise.all([
        fetch('/api/admin/metrics').then(async (r) => {
          if (!r.ok) {
            const errJson = await r.json().catch(() => ({}))
            throw new Error(errJson.error || `HTTP ${r.status}`)
          }
          return r.json()
        }),
        fetch('/api/auth/me').then((r) => r.json()).catch(() => null)
      ])
      setMetrics(metRes)
      setUserInfo(userRes)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRoleSwitch(role) {
    setSwitchingRole(true)
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      })
      if (res.ok) {
        await loadData()
      }
    } finally {
      setSwitchingRole(false)
    }
  }

  if (!isOpen) return null

  const kpis = metrics?.operationalKPIs || {}
  const sys = metrics?.systemHealth || {}

  return (
    <div className="admin-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="admin-title">
      <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div className="admin-header-title">
            <BarChart3 size={20} className="admin-header-icon" />
            <h2 id="admin-title">Admin Observability & Cost Governance</h2>
          </div>
          <button type="button" className="btn btn-ghost btn-sm close-admin-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <div className="admin-modal-body">
          {error && (
            <div className="admin-error-box">
              <Lock size={16} />
              <span>{error}</span>
              <div style={{ marginTop: '0.4rem', fontSize: '0.78rem' }}>
                Tip: Switch your role to <strong>Admin</strong> below to unlock this observability dashboard.
              </div>
            </div>
          )}

          {/* RBAC Role Switcher */}
          <div className="admin-section rbac-section">
            <div className="section-title-row">
              <Shield size={16} className="section-icon" />
              <h3>Role-Based Access Control (RBAC) Simulator</h3>
            </div>
            <p className="section-desc">Toggle your active session role to evaluate authorization boundaries across features.</p>
            <div className="role-btn-group">
              {['admin', 'reviewer', 'viewer'].map((r) => {
                const isCurrent = userInfo?.user?.role === r
                return (
                  <button
                    key={r}
                    type="button"
                    className={`role-btn ${isCurrent ? 'active' : ''}`}
                    onClick={() => handleRoleSwitch(r)}
                    disabled={switchingRole}
                  >
                    <span className="role-name">{r.toUpperCase()}</span>
                    {isCurrent && <span className="current-badge">Active</span>}
                  </button>
                )
              })}
            </div>
          </div>

          {metrics && (
            <>
              {/* Operational KPIs */}
              <div className="metrics-grid">
                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-label">Cache Hit Ratio</span>
                    <TrendingUp size={14} className="metric-icon green" />
                  </div>
                  <div className="metric-value">{kpis.cacheHitRatePercent}%</div>
                  <span className="metric-sub">Fast-path &lt;10ms queries</span>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-label">Cost Avoidance</span>
                    <Coins size={14} className="metric-icon yellow" />
                  </div>
                  <div className="metric-value">{kpis.estimatedDollarsSaved || '$0.00'}</div>
                  <span className="metric-sub">{kpis.estimatedTokensAvoided?.toLocaleString()} tokens saved</span>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-label">Contracts Analyzed</span>
                    <Server size={14} className="metric-icon blue" />
                  </div>
                  <div className="metric-value">{kpis.totalContractsAnalyzed}</div>
                  <span className="metric-sub">{kpis.activeComparisonsCount} comparisons stored</span>
                </div>

                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-label">Memory & Uptime</span>
                    <Cpu size={14} className="metric-icon purple" />
                  </div>
                  <div className="metric-value">{sys.memoryRssMb} MB</div>
                  <span className="metric-sub">{metrics.uptimeSeconds}s uptime ({sys.heapUsedMb} MB heap)</span>
                </div>
              </div>

              {/* Provider Status */}
              <div className="admin-section provider-status-section">
                <div className="section-title-row">
                  <CheckCircle2 size={16} className="text-success" />
                  <h3>Active LLM Engine Telemetry</h3>
                  <button type="button" className="btn btn-ghost btn-xs refresh-metrics-btn" onClick={loadData} title="Refresh metrics">
                    <RefreshCw size={12} className={loading ? 'spinning' : ''} />
                    <span>Refresh</span>
                  </button>
                </div>
                <div className="telemetry-table">
                  <div className="telemetry-row">
                    <span className="t-key">Provider:</span>
                    <span className="t-val">{metrics.providerStatus?.displayName}</span>
                  </div>
                  <div className="telemetry-row">
                    <span className="t-key">Primary Model:</span>
                    <span className="t-val code-font">{metrics.providerStatus?.model}</span>
                  </div>
                  <div className="telemetry-row">
                    <span className="t-key">Fallback Candidate:</span>
                    <span className="t-val code-font">{metrics.providerStatus?.fallbackModel}</span>
                  </div>
                  <div className="telemetry-row">
                    <span className="t-key">Retry Strategy:</span>
                    <span className="t-val">Exponential Backoff (3 retries, jittered)</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
