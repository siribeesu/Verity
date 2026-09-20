import React from 'react'
import {
  Printer,
  X,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  FileText,
  Calendar,
  Check
} from 'lucide-react'
import Logo from '../Layout/Logo'
import './AnalysisReportModal.css'

export default function AnalysisReportModal({ result, docText, docType, jurisdiction, onClose }) {
  if (!result) return null

  const clauses = result.clauses || []
  const highRiskCount = clauses.filter((c) => c.risk === 'high').length
  const mediumRiskCount = clauses.filter((c) => c.risk === 'medium').length
  const lowRiskCount = clauses.filter((c) => c.risk === 'low').length
  const wordCount = docText ? docText.trim().split(/\s+/).filter(Boolean).length : 0

  function handlePrint() {
    window.print()
  }

  return (
    <div className="report-modal-overlay" onClick={onClose}>
      <div className="report-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Toolbar (hidden on print) */}
        <div className="report-modal-toolbar no-print">
          <div className="toolbar-left">
            <span className="toolbar-title">Document Clarity Report Preview</span>
          </div>
          <div className="toolbar-actions">
            <button type="button" className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={15} />
              <span>Print / Save as PDF</span>
            </button>
            <button type="button" className="btn btn-ghost btn-sm close-modal-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Report Document */}
        <div className="report-sheet">
          {/* Header */}
          <div className="report-header">
            <div className="report-brand">
              <div className="report-logo-wrap">
                <Logo size={24} />
              </div>
              <div>
                <h1 className="report-brand-name">LegalAssist</h1>
                <span className="report-doc-subtitle">Contract Clarity & Risk Assessment Report</span>
              </div>
            </div>
            <div className="report-meta">
              <div className="meta-line">
                <Calendar size={12} />
                <span>Date: {new Date().toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
              </div>
              <div className="meta-line">
                <span>Category: {docType.replace(/-/g, ' ').toUpperCase()}</span>
              </div>
              {jurisdiction && (
                <div className="meta-line">
                  <span>Jurisdiction: {jurisdiction}</span>
                </div>
              )}
            </div>
          </div>

          <div className="report-divider" />

          {/* Executive Summary */}
          <section className="report-section">
            <h2 className="report-section-heading">1. Executive Overview</h2>
            <div className="report-summary-box">
              <p>{result.summary}</p>
            </div>
            <div className="report-stats-grid">
              <div className="report-stat-card">
                <span className="stat-num">{wordCount.toLocaleString()}</span>
                <span className="stat-lbl">Word Count</span>
              </div>
              <div className="report-stat-card">
                <span className="stat-num">{clauses.length}</span>
                <span className="stat-lbl">Clauses Reviewed</span>
              </div>
              <div className="report-stat-card high-risk">
                <span className="stat-num">{highRiskCount}</span>
                <span className="stat-lbl">High Risk Flags</span>
              </div>
              <div className="report-stat-card medium-risk">
                <span className="stat-num">{mediumRiskCount}</span>
                <span className="stat-lbl">Medium Risk Flags</span>
              </div>
            </div>
          </section>

          {/* Clause Breakdown */}
          <section className="report-section">
            <h2 className="report-section-heading">2. Detailed Clause Analysis ({clauses.length})</h2>
            <div className="report-clauses-list">
              {clauses.map((clause, i) => (
                <div key={i} className={`report-clause-item risk-${clause.risk}`}>
                  <div className="report-clause-header">
                    <span className="clause-idx">#{i + 1}</span>
                    <h3 className="clause-name">{clause.title}</h3>
                    <span className={`report-risk-tag ${clause.risk}`}>
                      {clause.risk.toUpperCase()} RISK
                    </span>
                  </div>

                  <p className="report-clause-meaning">
                    <strong>Plain Meaning:</strong> {clause.explanation}
                  </p>

                  {clause.risk_reason && (
                    <p className="report-clause-reason">
                      <strong>Risk Note:</strong> {clause.risk_reason}
                    </p>
                  )}

                  {clause.original_excerpt && (
                    <blockquote className="report-clause-quote">
                      "{clause.original_excerpt}"
                    </blockquote>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Key Legal Terms */}
          {result.key_terms?.length > 0 && (
            <section className="report-section page-break-inside-avoid">
              <h2 className="report-section-heading">3. Key Terms Glossary</h2>
              <div className="report-terms-grid">
                {result.key_terms.map((item, i) => (
                  <div key={i} className="report-term-card">
                    <strong className="term-name">{item.term}</strong>
                    <span className="term-meaning">{item.meaning}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Action Items */}
          {result.action_items?.length > 0 && (
            <section className="report-section page-break-inside-avoid">
              <h2 className="report-section-heading">4. Recommended Action Items</h2>
              <ul className="report-checklist">
                {result.action_items.map((action, i) => (
                  <li key={i} className="report-check-item">
                    <span className="check-box">◻</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Disclaimer Footer */}
          <div className="report-footer">
            <p>
              <strong>Notice:</strong> LegalAssist is an informational AI clarity assistant, not a law firm. This report is generated to assist your review and is not legal advice. Always consult a licensed attorney in your jurisdiction prior to signing binding agreements.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
