import React, { useState } from 'react'
import DocumentInput from '../DocumentInput/DocumentInput'
import ClauseCard from './ClauseCard'
import GlossarySection from './GlossarySection'
import ActionChecklist from './ActionChecklist'
import { useAnalyze } from '../../hooks/useAnalyze'
import './AnalyzeTab.css'

const DOC_TYPES = [
  'general', 'lease', 'employment', 'NDA', 'service-agreement',
  'terms-of-service', 'privacy-policy', 'independent-contractor',
]

const READING_LEVELS = [
  { value: 'beginner', label: 'Beginner', desc: 'Simple language, no jargon' },
  { value: 'informed', label: 'Informed Adult', desc: 'Clear language, terms explained' },
  { value: 'experienced', label: 'Experienced', desc: 'Standard legal terminology' },
]

export default function AnalyzeTab({ onAnalysisComplete, onGoToLawyerPrep }) {
  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const [readingLevel, setReadingLevel] = useState('informed')
  const [docType, setDocType] = useState('general')
  const [jurisdiction, setJurisdiction] = useState('')
  const [filterRisk, setFilterRisk] = useState('all')

  const { result, loading, error, run } = useAnalyze()

  function handleRun() {
    if (!text.trim() && !file) return
    run({ text, file, readingLevel, docType, jurisdiction: jurisdiction || null })
  }

  // Notify parent of new result
  React.useEffect(() => {
    if (result) onAnalysisComplete?.(result, text || '[uploaded file]')
  }, [result])

  const filteredClauses = result?.clauses?.filter(
    (c) => filterRisk === 'all' || c.risk === filterRisk
  ) || []

  return (
    <div className="analyze-tab">
      {/* Left panel — input */}
      <div className="panel panel-left">
        <div className="panel-header">
          <h2>Document</h2>
        </div>
        <div className="panel-body">
          <DocumentInput
            label="Legal Document"
            value={text}
            onChange={setText}
            onFileChange={setFile}
            placeholder="Paste the full text of your lease, contract, NDA, ToS, or other legal document here..."
          />

          <div className="controls-grid">
            <div className="control-group">
              <label htmlFor="reading-level">Reading Level</label>
              <select
                id="reading-level"
                value={readingLevel}
                onChange={(e) => setReadingLevel(e.target.value)}
              >
                {READING_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label} — {l.desc}</option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label htmlFor="doc-type">Document Type</label>
              <select
                id="doc-type"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
              >
                {DOC_TYPES.map((t) => (
                  <option key={t} value={t}>{t.replace(/-/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label htmlFor="jurisdiction">Jurisdiction (optional)</label>
              <input
                id="jurisdiction"
                type="text"
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                placeholder="e.g. California, UK, New York"
              />
            </div>
          </div>

          <button
            className="btn btn-primary btn-analyze"
            onClick={handleRun}
            disabled={loading || (!text.trim() && !file)}
          >
            {loading ? (
              <><span className="spinner" /> Analyzing…</>
            ) : (
              '◎ Analyze Document'
            )}
          </button>

          {error && <div className="error-message">{error}</div>}
        </div>
      </div>

      {/* Right panel — results */}
      <div className="panel panel-right">
        <div className="panel-header">
          <h2>Analysis</h2>
          {result && (
            <div className="risk-filter">
              {['all', 'high', 'medium', 'low'].map((r) => (
                <button
                  key={r}
                  className={`filter-btn ${filterRisk === r ? 'active' : ''} ${r !== 'all' ? r : ''}`}
                  onClick={() => setFilterRisk(r)}
                >
                  {r === 'all' ? 'All clauses' : r}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="panel-body results-body">
          {!result && !loading && (
            <div className="empty-state">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>◎</div>
              <h3>No analysis yet</h3>
              <p>Paste or upload a document, then click Analyze.</p>
            </div>
          )}

          {loading && (
            <div className="empty-state">
              <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
              <p style={{ marginTop: '1rem' }}>Reading your document…</p>
            </div>
          )}

          {result && !loading && (
            <div className="results-content">
              {/* Summary card */}
              <div className="summary-card card">
                <div className="summary-header">
                  <span className="ai-label">ⓘ AI summary</span>
                  <h2>Document Overview</h2>
                </div>
                <p className="summary-text">{result.summary}</p>
                {result.chunkCount > 1 && (
                  <p className="chunk-note">
                    ⓘ This document was analyzed in {result.chunkCount} sections due to its length.
                  </p>
                )}
              </div>

              {/* Risk summary row */}
              <div className="risk-summary-row">
                {['high', 'medium', 'low'].map((r) => {
                  const count = result.clauses?.filter((c) => c.risk === r).length || 0
                  return (
                    <div key={r} className={`risk-summary-cell risk-${r}`}>
                      <span className="risk-count">{count}</span>
                      <span className="risk-label-text">{r} risk</span>
                    </div>
                  )
                })}
              </div>

              {/* Clauses */}
              {filteredClauses.length > 0 && (
                <section>
                  <h2 className="results-section-title">Clause Breakdown</h2>
                  <div className="clauses-list">
                    {filteredClauses.map((clause, i) => (
                      <ClauseCard key={i} clause={clause} />
                    ))}
                  </div>
                </section>
              )}

              {/* Glossary */}
              <GlossarySection terms={result.key_terms} />

              {/* Action checklist */}
              <ActionChecklist items={result.action_items} />

              {/* Lawyer Prep CTA */}
              <div className="lawyer-prep-cta card">
                <div>
                  <h3>⚖ Ready to talk to a lawyer?</h3>
                  <p>Verity can generate a focused list of questions to bring to your attorney — based on exactly what was flagged in this analysis.</p>
                </div>
                <button
                  className="btn btn-secondary"
                  onClick={() => onGoToLawyerPrep?.()}
                >
                  Generate Questions →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
