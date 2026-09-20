import React from 'react'
import { Scale, ShieldAlert, ShieldCheck, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react'
import './FairnessMeter.css'

export default function FairnessMeter({ clauses = [], docType = 'general' }) {
  const highCount = clauses.filter((c) => c.risk === 'high').length
  const medCount = clauses.filter((c) => c.risk === 'medium').length
  const lowCount = clauses.filter((c) => c.risk === 'low').length

  // Calculate fairness score from 0 to 100
  let rawScore = 100 - (highCount * 18 + medCount * 7)
  if (clauses.length === 0) rawScore = 50
  const score = Math.max(15, Math.min(95, rawScore))

  let tier = {
    label: 'Balanced & Standard',
    colorClass: 'fairness-good',
    desc: 'Contract terms appear reasonably reciprocal and within customary industry bounds.',
    icon: ShieldCheck
  }
  if (score < 55) {
    tier = {
      label: 'Heavily One-Sided Risk',
      colorClass: 'fairness-poor',
      desc: 'Multiple aggressive clauses shift liability, penalties, or obligations heavily onto you.',
      icon: ShieldAlert
    }
  } else if (score < 75) {
    tier = {
      label: 'Moderate Leverage Shift',
      colorClass: 'fairness-moderate',
      desc: 'Notable clauses require negotiation to balance notice windows, liabilities, or cure rights.',
      icon: AlertTriangle
    }
  }

  const TierIcon = tier.icon

  // Leverage ratio estimates based on docType
  let partyA = 'Counterparty'
  let partyB = 'You'
  if (docType === 'lease') { partyA = 'Landlord'; partyB = 'Tenant' }
  else if (docType === 'employment') { partyA = 'Employer'; partyB = 'Employee' }
  else if (docType === 'NDA') { partyA = 'Disclosing Party'; partyB = 'Receiving Party' }
  else if (docType === 'independent-contractor' || docType === 'service-agreement') { partyA = 'Client'; partyB = 'Contractor' }

  // Imbalance calculation
  const counterpartyLeverage = Math.min(85, Math.max(45, Math.round(100 - (score * 0.6))))
  const userLeverage = 100 - counterpartyLeverage

  // Standard protection audits
  const hasNoticeCure = clauses.some((c) => (c.title + c.explanation).toLowerCase().includes('notice') || (c.title + c.explanation).toLowerCase().includes('cure'))
  const hasLiabilityLimit = clauses.some((c) => (c.title + c.explanation).toLowerCase().includes('liability') || (c.title + c.explanation).toLowerCase().includes('indemn'))
  const hasTerminationRight = clauses.some((c) => (c.title + c.explanation).toLowerCase().includes('terminat') || (c.title + c.explanation).toLowerCase().includes('cancel'))

  return (
    <div className="fairness-meter-card card animate-fade-in">
      <div className="fairness-header">
        <div className="fairness-title-wrap">
          <Scale size={18} className="fairness-icon" />
          <h3>Contract Fairness & Balance Score</h3>
        </div>
        <span className={`fairness-score-badge ${tier.colorClass}`}>
          <TierIcon size={14} />
          <span>{score} / 100</span>
        </span>
      </div>

      <div className="fairness-gauge-container">
        <div className="fairness-bar-track">
          <div
            className={`fairness-bar-fill ${tier.colorClass}`}
            style={{ width: `${score}%` }}
          />
        </div>
        <div className="fairness-scale-labels">
          <span>0 (High One-Sided Risk)</span>
          <span>50 (Moderate)</span>
          <span>100 (Fully Mutual)</span>
        </div>
      </div>

      <div className="fairness-status-box">
        <div className="status-top">
          <strong className="status-label">{tier.label}</strong>
          <span className="status-desc">{tier.desc}</span>
        </div>

        {/* Leverage split bar */}
        <div className="leverage-breakdown">
          <div className="leverage-labels">
            <span className="leverage-party">{partyA}: <strong>{counterpartyLeverage}%</strong> leverage</span>
            <span className="leverage-party">{partyB}: <strong>{userLeverage}%</strong> leverage</span>
          </div>
          <div className="leverage-split-bar">
            <div className="leverage-fill-a" style={{ width: `${counterpartyLeverage}%` }} title={`${partyA} leverage`} />
            <div className="leverage-fill-b" style={{ width: `${userLeverage}%` }} title={`${partyB} leverage`} />
          </div>
        </div>

        {/* Core protections checklist */}
        <div className="protections-audit">
          <span className="protections-title">Key Protections Found in Document:</span>
          <div className="protections-grid">
            <div className={`protection-pill ${hasTerminationRight ? 'present' : 'absent'}`}>
              {hasTerminationRight ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
              <span>{hasTerminationRight ? 'Defined Termination Procedure' : 'Vague / Asymmetric Termination'}</span>
            </div>
            <div className={`protection-pill ${hasNoticeCure ? 'present' : 'absent'}`}>
              {hasNoticeCure ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
              <span>{hasNoticeCure ? 'Notice & Cure Period Included' : 'No Explicit Cure Period Mentioned'}</span>
            </div>
            <div className={`protection-pill ${hasLiabilityLimit ? 'present' : 'absent'}`}>
              {hasLiabilityLimit ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
              <span>{hasLiabilityLimit ? 'Liability / Indemnity Clause Reviewed' : 'Uncapped Liability Risk'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
