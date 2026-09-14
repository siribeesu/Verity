import React, { useState } from 'react'
import DocumentInput from '../DocumentInput/DocumentInput'
import DiffCard from './DiffCard'
import { useCompare } from '../../hooks/useCompare'
import './CompareTab.css'

const DOC_TYPES = [
  'general', 'lease', 'employment', 'NDA', 'service-agreement',
  'terms-of-service', 'privacy-policy', 'independent-contractor',
]

export default function CompareTab() {
  const [textA, setTextA] = useState('')
  const [fileA, setFileA] = useState(null)
  const [textB, setTextB] = useState('')
  const [fileB, setFileB] = useState(null)
  const [docType, setDocType] = useState('general')

  const { result, loading, error, run } = useCompare()

  function handleRun() {
    if ((!textA.trim() && !fileA) || (!textB.trim() && !fileB)) return
    run({ textA, fileA, textB, fileB, docType })
  }

  const canRun = (textA.trim() || fileA) && (textB.trim() || fileB)

  return (
    <div className="compare-tab">
      {/* Input row */}
      <div className="compare-inputs">
        <div className="compare-input-panel">
          <DocumentInput
            label="Document A"
            value={textA}
            onChange={setTextA}
            onFileChange={setFileA}
            placeholder="Paste Document A..."
            id="docA"
          />
        </div>
        <div className="compare-vs">⇄</div>
        <div className="compare-input-panel">
          <DocumentInput
            label="Document B"
            value={textB}
            onChange={setTextB}
            onFileChange={setFileB}
            placeholder="Paste Document B..."
            id="docB"
          />
        </div>
      </div>

      <div className="compare-controls">
        <div className="control-group control-inline">
          <label htmlFor="compare-doc-type">Document Type</label>
          <select
            id="compare-doc-type"
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
          >
            {DOC_TYPES.map((t) => (
              <option key={t} value={t}>{t.replace(/-/g, ' ')}</option>
            ))}
          </select>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleRun}
          disabled={loading || !canRun}
        >
          {loading ? <><span className="spinner" /> Comparing…</> : '⇄ Compare Documents'}
        </button>
      </div>

      {error && <div className="error-message" style={{ margin: '0 1.5rem' }}>{error}</div>}

      {/* Results */}
      {result && !loading && (
        <div className="compare-results">
          <div className="compare-overview card">
            <span className="ai-label">ⓘ AI comparison overview</span>
            <p className="compare-overview-text">{result.overview}</p>
          </div>

          {result.differences?.length > 0 ? (
            <div className="diffs-list">
              <h2 className="results-section-title">
                {result.differences.length} Material Difference{result.differences.length !== 1 ? 's' : ''} Found
              </h2>
              {result.differences.map((diff, i) => (
                <DiffCard key={i} diff={diff} index={i} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No material differences found — the two documents appear substantively the same.</p>
            </div>
          )}
        </div>
      )}

      {!result && !loading && (
        <div className="empty-state" style={{ flex: 1 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⇄</div>
          <h3>Compare two documents</h3>
          <p>Paste or upload two versions of a document to see what materially changed.</p>
          <p style={{ fontSize: '0.82rem', marginTop: '0.5rem' }}>
            Verity focuses on changes that shift obligations or risk — not purely stylistic edits.
          </p>
        </div>
      )}

      {loading && (
        <div className="empty-state" style={{ flex: 1 }}>
          <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
          <p style={{ marginTop: '1rem' }}>Comparing documents…</p>
        </div>
      )}
    </div>
  )
}
