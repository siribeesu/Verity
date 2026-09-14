import React, { useState } from 'react'
import './DiffCard.css'

export default function DiffCard({ diff, index }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="diff-card card">
      <button className="diff-header" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <div className="diff-topic-row">
          <span className="diff-number">{index + 1}</span>
          <h3 className="diff-topic">{diff.topic}</h3>
        </div>
        <span className="diff-toggle">{open ? '▾' : '▸'}</span>
      </button>

      {open && (
        <div className="diff-body">
          <div className="diff-columns">
            <div className="diff-col diff-col-a">
              <div className="diff-col-label">Document A</div>
              <blockquote className="excerpt-block">{diff.doc_a}</blockquote>
            </div>
            <div className="diff-divider-v" />
            <div className="diff-col diff-col-b">
              <div className="diff-col-label">Document B</div>
              <blockquote className="excerpt-block">{diff.doc_b}</blockquote>
            </div>
          </div>
          {diff.significance && (
            <div className="diff-significance">
              <span className="significance-label">Why it matters in practice</span>
              <p>{diff.significance}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
