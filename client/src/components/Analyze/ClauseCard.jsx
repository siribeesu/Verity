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
  Sparkles,
  Lightbulb,
  Crosshair,
  Mail
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

function generateCounterProposal(clause) {
  const cat = (clause.category || '').toLowerCase()
  const title = (clause.title || '').toLowerCase()

  if (cat.includes('auto-renewal') || title.includes('renewal')) {
    return {
      counterText: `Upon expiration of the initial term, this Agreement shall convert to a month-to-month tenancy (or require affirmative mutual written agreement to renew for an additional term), with at least thirty (30) days advance written notice required to terminate.`,
      tip: `Ask to eliminate automatic 12-month lock-ins and automatic price escalations.`
    }
  }
  if (cat.includes('liability') || cat.includes('indemnification') || title.includes('indemn')) {
    return {
      counterText: `Each party agrees to indemnify and hold harmless the other party against third-party claims arising solely from its own gross negligence, intentional misconduct, or material breach of this Agreement. Neither party shall be liable for the other's own negligence.`,
      tip: `Ensure indemnification is strictly mutual and explicitly excludes claims caused by the other party's own negligence.`
    }
  }
  if (cat.includes('repair') || title.includes('maintenance') || title.includes('access') || title.includes('entry')) {
    return {
      counterText: `Landlord shall provide at least twenty-four (24) hours advance written notice prior to entering the Premises, with entry permitted only during reasonable business hours (9:00 AM - 5:00 PM), except in cases of verified emergency. Landlord remains responsible for all building systems and appliance maintenance.`,
      tip: `Ensure 24-hour advance written notice is mandatory for non-emergencies.`
    }
  }
  if (cat.includes('termination') || title.includes('cancel')) {
    return {
      counterText: `Either party may terminate this Agreement for material breach, provided the non-breaching party gives written notice specifying the breach and a thirty (30) day period to cure such breach before termination takes effect.`,
      tip: `Request a mandatory 30-day written notice and right-to-cure period before termination or penalty.`
    }
  }
  if (cat.includes('non-compete') || title.includes('compete') || cat.includes('ip') || title.includes('intellectual')) {
    return {
      counterText: `Contractor retains all pre-existing IP, tools, and general knowledge. Client owns final delivered work product upon payment in full. Any restrictive covenant shall be strictly limited to direct competitive solicitation for a duration not exceeding six (6) months within the immediate metropolitan area.`,
      tip: `Narrow non-compete scope to direct competitors only and ensure IP transfers only upon full payment.`
    }
  }
  return {
    counterText: `The parties agree that all obligations under this clause shall be mutual, reasonable, and subject to standard industry terms with reasonable notice and opportunity to cure any alleged deficiency.`,
    tip: `Propose mutual standard language that balances rights and liabilities equally between both parties.`
  }
}

export default function ClauseCard({ clause, onAskAboutClause, onHighlightExcerpt }) {
  const [excerptOpen, setExcerptOpen] = useState(false)
  const [counterOpen, setCounterOpen] = useState(false)
  const [copiedExcerpt, setCopiedExcerpt] = useState(false)
  const [copiedExplanation, setCopiedExplanation] = useState(false)
  const [copiedCounter, setCopiedCounter] = useState(false)
  const [copiedEmail, setCopiedEmail] = useState(false)

  const riskLevel = clause.risk || 'low'
  const config = RISK_CONFIG[riskLevel] || RISK_CONFIG.low
  const RiskIcon = config.icon
  const counterProposal = (riskLevel === 'high' || riskLevel === 'medium') ? generateCounterProposal(clause) : null

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

  function handleCopyCounter() {
    if (!counterProposal) return
    navigator.clipboard.writeText(counterProposal.counterText)
    setCopiedCounter(true)
    setTimeout(() => setCopiedCounter(false), 1500)
  }

  function handleCopyNegotiationEmail() {
    if (!counterProposal) return
    const emailBody = `Hello,\n\nThank you for sharing the proposed agreement. Upon review of Section regarding "${clause.title}", I noticed the current wording:\n"${clause.original_excerpt || clause.title}"\n\nTo ensure balanced terms and mutual clarity, I would like to propose the following revision:\n"${counterProposal.counterText}"\n\nRationale: ${counterProposal.tip}\n\nPlease let me know if this adjustment is acceptable so we can proceed.\n\nBest regards,\n[Your Name]`
    navigator.clipboard.writeText(emailBody)
    setCopiedEmail(true)
    setTimeout(() => setCopiedEmail(false), 1500)
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
            {clause.section_ref && (
              <span className="section-ref-badge" title="Referenced in document text">
                § {clause.section_ref}
              </span>
            )}
            {clause.confidence_score !== undefined && (
              <span className="confidence-badge" title="Model grounding confidence">
                {Math.round(clause.confidence_score * 100)}% Confidence
              </span>
            )}
          </div>
          <h3 className="clause-title">{clause.title}</h3>
        </div>

        <div className="clause-quick-actions">
          {clause.original_excerpt && onHighlightExcerpt && (
            <button
              type="button"
              className="btn btn-ghost btn-sm clause-action-btn"
              onClick={() => onHighlightExcerpt(clause.original_excerpt)}
              title="Locate and highlight this clause in document text"
              aria-label="Locate and highlight this clause in document text"
            >
              <Crosshair size={13} />
            </button>
          )}
          <button
            type="button"
            className="btn btn-ghost btn-sm clause-action-btn"
            onClick={handleCopyExplanation}
            title="Copy plain-English explanation"
            aria-label="Copy plain-English explanation"
          >
            {copiedExplanation ? <Check size={13} className="text-success" /> : <Copy size={13} />}
          </button>
          {onAskAboutClause && (
            <button
              type="button"
              className="btn btn-secondary btn-sm clause-ask-btn"
              onClick={() => onAskAboutClause(clause)}
              title="Ask AI questions about this specific clause"
              aria-label={`Ask AI questions about ${clause.title || 'this clause'}`}
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

        {/* Counter-proposal suggestion toggle */}
        {counterProposal && (
          <div className="counter-proposal-section">
            <button
              type="button"
              className="counter-proposal-toggle-btn"
              onClick={() => setCounterOpen((o) => !o)}
              aria-expanded={counterOpen}
            >
              <Lightbulb size={13} className="lightbulb-icon" />
              <span>{counterOpen ? 'Hide Suggested Counter-Clause' : '💡 Suggest Fair Replacement Clause'}</span>
              <span className="toggle-arrow">{counterOpen ? '▴' : '▾'}</span>
            </button>

            {counterOpen && (
              <div className="counter-proposal-box animate-fade-in">
                <div className="counter-header">
                  <span className="counter-label">Proposed Balanced Language:</span>
                  <div className="counter-btn-group">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm copy-counter-btn"
                      onClick={handleCopyCounter}
                      title="Copy counter-clause to clipboard"
                    >
                      {copiedCounter ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                      <span>{copiedCounter ? 'Copied' : 'Copy Replacement'}</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm copy-counter-btn"
                      onClick={handleCopyNegotiationEmail}
                      title="Copy formal counter-proposal email draft"
                    >
                      {copiedEmail ? <Check size={12} className="text-success" /> : <Mail size={12} />}
                      <span>{copiedEmail ? 'Copied Email' : 'Copy Email Draft'}</span>
                    </button>
                  </div>
                </div>
                <blockquote className="counter-quote-text">
                  "{counterProposal.counterText}"
                </blockquote>
                <p className="counter-tip-text">
                  <strong>Negotiation Strategy:</strong> {counterProposal.tip}
                </p>
              </div>
            )}
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
                aria-label="Copy verbatim excerpt to clipboard"
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
