import React, { useState } from 'react'
import './GlossarySection.css'

export default function GlossarySection({ terms }) {
  const [open, setOpen] = useState(true)

  if (!terms?.length) return null

  return (
    <section className="glossary-section card">
      <button
        className="glossary-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <h2 className="section-title">📖 Key Terms Glossary</h2>
        <span>{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <dl className="glossary-list">
          {terms.map((item, i) => (
            <div key={i} className="glossary-item">
              <dt className="glossary-term">{item.term}</dt>
              <dd className="glossary-meaning">{item.meaning}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  )
}
