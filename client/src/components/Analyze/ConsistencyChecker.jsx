import React, { useState } from 'react'
import {
  FileCheck,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react'
import './ConsistencyChecker.css'

export default function ConsistencyChecker({ docText, clauses = [] }) {
  const [isOpen, setIsOpen] = useState(false)

  if (!docText || clauses.length === 0) return null

  const textLower = docText.toLowerCase()

  // 1. Ambiguous timeframe analysis
  const ambiguousPatterns = [
    { phrase: 'promptly', explanation: 'Undefined time window. Suggest specifying "within five (5) business days".' },
    { phrase: 'reasonable time', explanation: 'Subjective standard prone to litigation. Suggest specifying a firm calendar day limit (e.g. 14 or 30 days).' },
    { phrase: 'as soon as practicable', explanation: 'Vague operational timeframe that permits unilateral delay.' },
    { phrase: 'sole discretion', explanation: 'Grants counterparty unfettered authority without requiring reasonableness or good faith.' },
    { phrase: 'from time to time', explanation: 'Allows counterparty to modify policies or fees arbitrarily without prior agreement.' }
  ]

  const detectedAmbiguities = ambiguousPatterns.filter((p) => textLower.includes(p.phrase))

  // 2. Essential protective boilerplate audit
  const boilerplateChecks = [
    {
      name: 'Governing Law & Jurisdiction',
      present: textLower.includes('governing law') || textLower.includes('jurisdiction') || textLower.includes('venue'),
      whyNeeded: 'Prevents counterparty from hauling you into distant out-of-state courts.'
    },
    {
      name: 'Severability Clause',
      present: textLower.includes('severab') || textLower.includes('invalidity') || textLower.includes('unenforceable'),
      whyNeeded: 'Ensures the contract remains valid even if a single line is struck down.'
    },
    {
      name: 'Entire Agreement (Integration)',
      present: textLower.includes('entire agreement') || textLower.includes('supersedes') || textLower.includes('merger clause'),
      whyNeeded: 'Protects against outside verbal representations that contradict the written terms.'
    },
    {
      name: 'Force Majeure (Act of God)',
      present: textLower.includes('force majeure') || textLower.includes('acts of god') || textLower.includes('unforeseen event'),
      whyNeeded: 'Suspends performance obligations during disasters, war, or government shutdowns.'
    }
  ]

  const missingBoilerplate = boilerplateChecks.filter((b) => !b.present)

  // 3. Asymmetric obligations check
  const highRiskClauses = clauses.filter((c) => c.risk === 'high')
  const hasUnilateralIndemnity = clauses.some(
    (c) =>
      c.title?.toLowerCase().includes('indemn') &&
      (c.risk === 'high' || (c.explanation || '').toLowerCase().includes('one-sided'))
  )

  // Calculate consistency score (0 - 100)
  let score = 100
  score -= detectedAmbiguities.length * 5
  score -= missingBoilerplate.length * 8
  if (hasUnilateralIndemnity) score -= 12
  score = Math.max(45, Math.min(100, score))

  return (
    <div className="consistency-checker-card card" role="region" aria-label="Contract Consistency and Ambiguity Audit">
      <div
        className="consistency-header clickable"
        onClick={() => setIsOpen((o) => !o)}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
      >
        <div className="consistency-title-row">
          <div className="consistency-icon-wrap">
            <FileCheck size={18} className="consistency-icon" />
          </div>
          <div className="consistency-title-info">
            <div className="title-score-line">
              <h3 className="consistency-title">Contract Consistency & Ambiguity Audit</h3>
              <span className={`consistency-score-badge ${score >= 80 ? 'good' : score >= 65 ? 'warning' : 'danger'}`}>
                {score}/100 Clarity Index
              </span>
            </div>
            <p className="consistency-sub">
              {detectedAmbiguities.length} ambiguous timeframes, {missingBoilerplate.length} missing boilerplate clauses identified.
            </p>
          </div>
        </div>
        <div className="consistency-toggle">
          {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
        </div>
      </div>

      {isOpen && (
        <div className="consistency-body animate-fade-in">
          {/* Ambiguities */}
          <div className="audit-section">
            <div className="audit-section-header">
              <AlertTriangle size={15} className="text-warning" />
              <h4>Subjective & Ambiguous Timeframes</h4>
            </div>
            {detectedAmbiguities.length === 0 ? (
              <div className="audit-pass-note">
                <ShieldCheck size={14} className="text-success" />
                <span>No common ambiguous timeframes detected. Timelines appear firmly defined.</span>
              </div>
            ) : (
              <div className="audit-findings-list">
                {detectedAmbiguities.map((item, idx) => (
                  <div key={idx} className="finding-row">
                    <span className="finding-term font-mono">"{item.phrase}"</span>
                    <span className="finding-exp">{item.explanation}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Boilerplate Check */}
          <div className="audit-section">
            <div className="audit-section-header">
              <Info size={15} className="text-primary" />
              <h4>Standard Boilerplate Protections</h4>
            </div>
            <div className="boilerplate-grid">
              {boilerplateChecks.map((b, idx) => (
                <div key={idx} className={`boilerplate-pill ${b.present ? 'present' : 'missing'}`}>
                  <span className="bp-status-icon">{b.present ? '✓' : '✗'}</span>
                  <div className="bp-info">
                    <span className="bp-name">{b.name}</span>
                    {!b.present && <span className="bp-hint">Missing: {b.whyNeeded}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Asymmetry Assessment */}
          <div className="audit-section">
            <div className="audit-section-header">
              <Sparkles size={15} className="text-secondary" />
              <h4>Structural Balance Summary</h4>
            </div>
            <p className="balance-summary-text">
              {hasUnilateralIndemnity
                ? '⚠️ Asymmetric Indemnity Detected: The agreement places defense and indemnification liabilities primarily on one party without reciprocal protection.'
                : '✓ Indemnity obligations appear reasonably balanced or handled under standard commercial limits.'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
