import React, { useState } from 'react'
import { BookOpen, ChevronDown, ChevronRight, Search, Copy, Check } from 'lucide-react'
import './GlossarySection.css'

export default function GlossarySection({ terms }) {
  const [open, setOpen] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [copiedIndex, setCopiedIndex] = useState(null)

  if (!terms?.length) return null

  const filteredTerms = terms.filter(
    (t) =>
      t.term?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.meaning?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  function handleCopy(item, index) {
    navigator.clipboard.writeText(`${item.term}: ${item.meaning}`)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 1500)
  }

  return (
    <section className="glossary-section card animate-fade-in">
      <div className="glossary-header-row">
        <button
          type="button"
          className="glossary-toggle-btn"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          <div className="glossary-title-group">
            <BookOpen size={18} className="glossary-icon" />
            <h2 className="section-title">Key Legal Terms Glossary</h2>
            <span className="count-badge">{terms.length} terms</span>
          </div>
          <span className="toggle-chevron">
            {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </span>
        </button>
      </div>

      {open && (
        <div className="glossary-content-body animate-fade-in">
          {terms.length > 3 && (
            <div className="glossary-search-wrap">
              <Search size={14} className="glossary-search-icon" />
              <input
                type="text"
                placeholder="Search defined legal terms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glossary-search-input"
              />
            </div>
          )}

          <div className="glossary-grid">
            {filteredTerms.map((item, i) => (
              <div key={i} className="glossary-card">
                <div className="glossary-card-header">
                  <dt className="glossary-term">{item.term}</dt>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm glossary-copy-btn"
                    onClick={() => handleCopy(item, i)}
                    title="Copy definition"
                  >
                    {copiedIndex === i ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
                <dd className="glossary-meaning">{item.meaning}</dd>
              </div>
            ))}
          </div>

          {filteredTerms.length === 0 && (
            <p className="glossary-no-results">No legal terms match "{searchTerm}"</p>
          )}
        </div>
      )}
    </section>
  )
}
