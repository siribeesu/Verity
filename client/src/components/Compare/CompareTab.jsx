import React, { useState } from 'react'
import DocumentInput from '../DocumentInput/DocumentInput'
import DiffCard from './DiffCard'
import { useCompare } from '../../hooks/useCompare'
import { SAMPLE_COMPARISON_PAIRS } from '../../data/sampleDocuments'
import { GitCompare, ArrowLeftRight, Sparkles, Sliders, CheckCircle2 } from 'lucide-react'
import './CompareTab.css'

const DOC_TYPES = [
  { value: 'general', label: 'General / Other Agreement' },
  { value: 'lease', label: 'Residential / Commercial Lease' },
  { value: 'employment', label: 'Employment Contract' },
  { value: 'NDA', label: 'Non-Disclosure Agreement (NDA)' },
  { value: 'service-agreement', label: 'Service Agreement / SOW' },
  { value: 'terms-of-service', label: 'Terms of Service (ToS)' },
  { value: 'privacy-policy', label: 'Privacy Policy' },
  { value: 'independent-contractor', label: 'Independent Contractor Agreement' },
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

  function handleSwap() {
    const tempText = textA
    const tempFile = fileA
    setTextA(textB)
    setFileA(fileB)
    setTextB(tempText)
    setFileB(tempFile)
  }

  function handleSelectPreset(preset) {
    setTextA(preset.docA)
    setTextB(preset.docB)
    setDocType(preset.docType || 'general')
    setFileA(null)
    setFileB(null)
  }

  const canRun = (textA.trim() || fileA) && (textB.trim() || fileB)

  return (
    <div className="compare-tab">
      <div className="compare-container">
        {/* Preset Selector Banner */}
        <div className="compare-presets-card card">
          <div className="presets-left">
            <Sparkles size={16} className="sparkle-icon" />
            <div>
              <h3>Compare Two Versions of a Document</h3>
              <p>Detect substantive risk shifts, revised terms, or new obligations.</p>
            </div>
          </div>

          <div className="presets-right">
            <span className="preset-label">Try a comparison:</span>
            <div className="preset-buttons">
              {SAMPLE_COMPARISON_PAIRS.map((pair) => (
                <button
                  key={pair.id}
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleSelectPreset(pair)}
                >
                  <span>{pair.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input row */}
        <div className="compare-inputs-grid">
          <div className="compare-input-card card">
            <div className="compare-card-badge doc-a">Document A (Original / Baseline)</div>
            <DocumentInput
              label="Document A"
              value={textA}
              onChange={setTextA}
              onFileChange={setFileA}
              placeholder="Paste original document text or upload file..."
              id="docA"
            />
          </div>

          <div className="compare-center-actions">
            <button
              type="button"
              className="btn btn-secondary btn-swap"
              onClick={handleSwap}
              title="Swap Document A and Document B"
              disabled={!textA && !textB && !fileA && !fileB}
            >
              <ArrowLeftRight size={16} />
              <span>Swap</span>
            </button>
          </div>

          <div className="compare-input-card card">
            <div className="compare-card-badge doc-b">Document B (Revised / Counterparty)</div>
            <DocumentInput
              label="Document B"
              value={textB}
              onChange={setTextB}
              onFileChange={setFileB}
              placeholder="Paste revised document text or upload file..."
              id="docB"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="compare-controls-bar card">
          <div className="control-inline">
            <Sliders size={15} className="control-icon" />
            <label htmlFor="compare-doc-type">Document Type:</label>
            <select
              id="compare-doc-type"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="compare-select"
            >
              {DOC_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <button
            className="btn btn-primary btn-run-compare"
            onClick={handleRun}
            disabled={loading || !canRun}
          >
            {loading ? (
              <>
                <span className="spinner" />
                <span>Analyzing Differences…</span>
              </>
            ) : (
              <>
                <GitCompare size={17} />
                <span>Compare Documents</span>
              </>
            )}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Results */}
        {result && !loading && (
          <div className="compare-results animate-fade-in">
            <div className="compare-overview card">
              <div className="overview-header">
                <span className="ai-label">
                  <Sparkles size={11} />
                  Substantive Comparison Overview
                </span>
                <span className="diff-count-pill">
                  {result.differences?.length || 0} Material Difference
                  {result.differences?.length !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="compare-overview-text">{result.overview}</p>
            </div>

            {result.differences?.length > 0 ? (
              <div className="diffs-list">
                <h2 className="section-title">
                  Detailed Material Differences Breakdown
                </h2>
                {result.differences.map((diff, i) => (
                  <DiffCard key={i} diff={diff} index={i} />
                ))}
              </div>
            ) : (
              <div className="empty-state card">
                <CheckCircle2 size={32} className="text-success" />
                <h3>No Material Differences Detected</h3>
                <p>Both documents appear substantively identical in obligations, risks, and terms.</p>
              </div>
            )}
          </div>
        )}

        {!result && !loading && (
          <div className="empty-state">
            <div className="empty-state-icon-wrap">
              <GitCompare size={28} />
            </div>
            <h3>Compare two versions of an agreement</h3>
            <p>
              Paste or upload both documents to see what materially changed in liability, obligations, or rights.
            </p>
          </div>
        )}

        {loading && (
          <div className="empty-state loading-state">
            <div className="loading-spinner-wrap">
              <span className="spinner loading-lg" />
            </div>
            <h3>Cross-referencing documents…</h3>
            <p>Identifying clause additions, removals, modifications, and substantive risk shifts.</p>
          </div>
        )}
      </div>
    </div>
  )
}
