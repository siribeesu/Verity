import React, { useState } from 'react'
import { ChevronDown, ChevronRight, Scale, Copy, Check, FileText } from 'lucide-react'
import './DiffCard.css'

export default function DiffCard({ diff, index }) {
  const [open, setOpen] = useState(true)
  const [copied, setCopied] = useState(false)

  function handleCopyDiff() {
    const text = `Difference #${index + 1}: ${diff.topic}\n\nDocument A:\n"${diff.doc_a}"\n\nDocument B:\n"${diff.doc_b}"\n\nWhy it matters: ${diff.significance || 'N/A'}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="diff-card card animate-fade-in">
      <div className="diff-header-container">
        <button
          type="button"
          className="diff-header-btn"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          <div className="diff-topic-row">
            <span className="diff-number">{index + 1}</span>
            <h3 className="diff-topic">{diff.topic}</h3>
          </div>
          <span className="diff-toggle">
            {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </span>
        </button>

        <button
          type="button"
          className="btn btn-ghost btn-sm diff-copy-btn"
          onClick={handleCopyDiff}
          title="Copy this comparison"
        >
          {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {open && (
        <div className="diff-body animate-fade-in">
          <div className="diff-columns">
            <div className="diff-col diff-col-a">
              <div className="diff-col-label">
                <FileText size={12} />
                <span>Document A</span>
              </div>
              <blockquote className="excerpt-block diff-excerpt a">
                "{diff.doc_a}"
              </blockquote>
            </div>

            <div className="diff-col diff-col-b">
              <div className="diff-col-label">
                <FileText size={12} />
                <span>Document B</span>
              </div>
              <blockquote className="excerpt-block diff-excerpt b">
                "{diff.doc_b}"
              </blockquote>
            </div>
          </div>

          {diff.significance && (
            <div className="diff-significance">
              <div className="significance-header">
                <Scale size={14} className="significance-icon" />
                <span className="significance-label">Practical Impact & Why It Matters</span>
              </div>
              <p className="significance-text">{diff.significance}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
