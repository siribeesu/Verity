import React, { useState } from 'react'
import './ClauseCard.css'

const RISK_LABELS = { low: 'Low', medium: 'Medium', high: 'High' }
const RISK_ICONS = { low: '●', medium: '◆', high: '▲' }

export default function ClauseCard({ clause }) {
  const [excerptOpen, setExcerptOpen] = useState(false)

  return (
    <div className={`clause-card risk-${clause.risk}`}>
      <div className="clause-card-header">
        <div className="clause-meta">
          <span className="category-badge">{clause.category}</span>
          <h3 className="clause-title">{clause.title}</h3>
        </div>
        <span className={`risk-badge ${clause.risk}`}>
          {RISK_ICONS[clause.risk]} {RISK_LABELS[clause.risk]}
        </span>
      </div>

      <p className="clause-explanation">
        <span className="ai-label">ⓘ AI explanation</span>
        {clause.explanation}
      </p>

      {clause.risk_reason && (
        <p className="clause-risk-reason">
          {clause.risk_reason}
        </p>
      )}

      <div className="clause-excerpt-section">
        <button
          className="collapse-toggle"
          onClick={() => setExcerptOpen((o) => !o)}
          aria-expanded={excerptOpen}
        >
          {excerptOpen ? '▾' : '▸'} Source in document
        </button>
        {excerptOpen && (
          <blockquote className="excerpt-block">
            "{clause.original_excerpt}"
          </blockquote>
        )}
      </div>
    </div>
  )
}
