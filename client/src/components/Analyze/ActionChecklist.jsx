import React from 'react'
import './ActionChecklist.css'

export default function ActionChecklist({ items }) {
  if (!items?.length) return null

  return (
    <section className="checklist-section card">
      <h2 className="section-title">✓ Suggested Next Steps</h2>
      <ul className="checklist">
        {items.map((item, i) => (
          <li key={i} className="checklist-item">
            <span className="check-icon">◻</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
