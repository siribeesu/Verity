import React, { useState } from 'react'
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  MessageSquarePlus,
  Quote,
  Sparkles
} from 'lucide-react'
import './ClauseCard.css'

const RISK_CONFIG = {
  high: {
    label: 'High Risk',
    icon: AlertTriangle,
    badgeClass: 'high',
    desc: 'Unusual, one-sided, or significant liability risk'
  },
  medium: {
    label: 'Medium Risk',
    icon: AlertCircle,
    badgeClass: 'medium',
    desc: 'Ambiguous wording or notable obligation'
  },
  low: {
    label: 'Standard / Low',
    icon: CheckCircle2,
    badgeClass: 'low',
    desc: 'Common industry standard term'
  }
}

export default function ClauseCard({ clause, onAskAboutClause }) {
  const [excerptOpen, setExcerptOpen] = useState(false)
  const [copiedExcerpt, setCopiedExcerpt] = useState(false)
  const [copiedExplanation, setCopiedExplanation] = useState(false)

  const riskLevel = clause.risk || 'low'
  const config = RISK_CONFIG[riskLevel] || RISK_CONFIG.low
  const RiskIcon = config.icon

  function handleCopyExcerpt() {
    if (!clause.original_excerpt) return
    navigator.clipboard.writeText(clause.original_excerpt)
    setCopiedExcerpt(true)
    setTimeout(() => setCopiedExcerpt(false), 1500)
  }

  function handleCopyExplanation() {
    const text = `${clause.title} (${clause.category}):\n${clause.explanation}\nRisk note: ${clause.risk_reason || 'N/A'}`
    navigator.clipboard.writeText(text)
    setCopiedExplanation(true)
    setTimeout(() => setCopiedExplanation(false), 1500)
  }

  return (
    <div className={`clause-card risk-${riskLevel} animate-fade-in`}>
      <div className="clause-card-header">
        <div className="clause-meta">
          <div className="clause-tags-row">
            <span className="category-badge">{clause.category || 'General'}</span>
            <span className={`risk-badge ${config.badgeClass}`} title={config.desc}>
              <RiskIcon size={12} />
              <span>{config.label}</span>
            </span>
          </div>
          <h3 className="clause-title">{clause.title}</h3>
        </div>

        <div className="clause-quick-actions">
          <button
            type="button"
            className="btn btn-ghost btn-sm clause-action-btn"
            onClick={handleCopyExplanation}
            title="Copy plain-English explanation"
          >
            {copiedExplanation ? <Check size={13} className="text-success" /> : <Copy size={13} />}
          </button>
          {onAskAboutClause && (
            <button
              type="button"
              className="btn btn-secondary btn-sm clause-ask-btn"
              onClick={() => onAskAboutClause(clause)}
              title="Ask AI questions about this specific clause"
            >
              <MessageSquarePlus size={13} />
              <span>Ask AI</span>
            </button>
          )}
        </div>
      </div>

      <div className="clause-body">
        <div className="explanation-box">
          <div className="explanation-header">
            <Sparkles size={13} className="sparkle-ai-icon" />
            <span className="box-section-label">Plain-English Meaning</span>
          </div>
          <p className="clause-explanation">{clause.explanation}</p>
        </div>

        {clause.risk_reason && (
          <div className={`risk-reason-box risk-${riskLevel}`}>
            <div className="risk-reason-header">
              <RiskIcon size={13} className="risk-reason-icon" />
              <span className="box-section-label">Why It Was Flagged</span>
            </div>
            <p className="clause-risk-reason">{clause.risk_reason}</p>
          </div>
        )}
      </div>

      {clause.original_excerpt && (
        <div className="clause-excerpt-wrapper">
          <div className="excerpt-toggle-row">
            <button
              type="button"
              className="collapse-toggle excerpt-toggle-btn"
              onClick={() => setExcerptOpen((o) => !o)}
              aria-expanded={excerptOpen}
            >
              {excerptOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <Quote size={13} className="quote-icon" />
              <span>Verbatim Source in Document</span>
            </button>

            {excerptOpen && (
              <button
                type="button"
                className="btn btn-ghost btn-sm copy-excerpt-btn"
                onClick={handleCopyExcerpt}
                title="Copy original excerpt"
              >
                {copiedExcerpt ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedExcerpt ? 'Copied' : 'Copy Quote'}</span>
              </button>
            )}
          </div>

          {excerptOpen && (
            <blockquote className="excerpt-block animate-fade-in">
              "{clause.original_excerpt}"
            </blockquote>
          )}
        </div>
      )}
    </div>
  )
}
