import React, { useState, useEffect } from 'react'
import DocumentInput from '../DocumentInput/DocumentInput'
import ClauseCard from './ClauseCard'
import GlossarySection from './GlossarySection'
import ActionChecklist from './ActionChecklist'
import { useAnalyze } from '../../hooks/useAnalyze'
import { SAMPLE_DOCUMENTS } from '../../data/sampleDocuments'
import {
  FileSearch,
  Sparkles,
  Sliders,
  Scale,
  MapPin,
  FileText,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Search,
  ArrowRight,
  ShieldAlert,
  Layers
} from 'lucide-react'
import './AnalyzeTab.css'

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

const READING_LEVELS = [
  { value: 'beginner', label: 'Beginner', desc: 'Everyday plain English, zero legal jargon' },
  { value: 'informed', label: 'Informed Adult', desc: 'Clear explanations with key legal terms defined' },
  { value: 'experienced', label: 'Experienced', desc: 'Precise terminology for legal & contract professionals' },
]

export default function AnalyzeTab({ onAnalysisComplete, onGoToLawyerPrep, onAskAboutClause }) {
  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const [readingLevel, setReadingLevel] = useState('informed')
  const [docType, setDocType] = useState('general')
  const [jurisdiction, setJurisdiction] = useState('')
  const [filterRisk, setFilterRisk] = useState('all')
  const [clauseSearch, setClauseSearch] = useState('')

  const { result, loading, error, run } = useAnalyze()

  function handleRun() {
    if (!text.trim() && !file) return
    run({ text, file, readingLevel, docType, jurisdiction: jurisdiction || null })
  }

  function handleSelectSample(sample) {
    setText(sample.text)
    setDocType(sample.docType || 'general')
    if (sample.jurisdiction) {
      setJurisdiction(sample.jurisdiction)
    }
  }

  // Notify parent of new result
  useEffect(() => {
    if (result) onAnalysisComplete?.(result, text || '[uploaded file]')
  }, [result])

  const clauses = result?.clauses || []
  const highRiskCount = clauses.filter((c) => c.risk === 'high').length
  const mediumRiskCount = clauses.filter((c) => c.risk === 'medium').length
  const lowRiskCount = clauses.filter((c) => c.risk === 'low').length

  const filteredClauses = clauses.filter((c) => {
    const matchesRisk = filterRisk === 'all' || c.risk === filterRisk
    const matchesSearch =
      !clauseSearch ||
      c.title?.toLowerCase().includes(clauseSearch.toLowerCase()) ||
      c.explanation?.toLowerCase().includes(clauseSearch.toLowerCase()) ||
      c.category?.toLowerCase().includes(clauseSearch.toLowerCase())
    return matchesRisk && matchesSearch
  })

  return (
    <div className="analyze-tab">
      {/* Left panel — input */}
      <div className="panel panel-left">
        <div className="panel-header">
          <div className="panel-title-group">
            <FileText size={18} className="panel-header-icon" />
            <h2>Source Document</h2>
          </div>
          <span className="step-pill">Step 1 & 2</span>
        </div>

        <div className="panel-body">
          <DocumentInput
            label="Legal Document Content"
            value={text}
            onChange={setText}
            onFileChange={setFile}
            placeholder="Paste your lease, NDA, employment agreement, service contract, or terms here..."
            samples={SAMPLE_DOCUMENTS}
            onSelectSample={handleSelectSample}
          />

          <div className="controls-card card">
            <div className="controls-card-header">
              <Sliders size={15} className="controls-icon" />
              <h3>Analysis Options</h3>
            </div>

            <div className="controls-grid">
              <div className="control-group">
                <label htmlFor="reading-level">
                  <span>Reading Level</span>
                </label>
                <select
                  id="reading-level"
                  value={readingLevel}
                  onChange={(e) => setReadingLevel(e.target.value)}
                >
                  {READING_LEVELS.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label} — {l.desc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="control-group">
                <label htmlFor="doc-type">
                  <span>Document Type</span>
                </label>
                <select
                  id="doc-type"
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                >
                  {DOC_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="control-group">
                <label htmlFor="jurisdiction">
                  <MapPin size={12} />
                  <span>Jurisdiction (optional)</span>
                </label>
                <input
                  id="jurisdiction"
                  type="text"
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  placeholder="e.g. California, Delaware, UK, New York"
                />
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary btn-analyze"
            onClick={handleRun}
            disabled={loading || (!text.trim() && !file)}
          >
            {loading ? (
              <>
                <span className="spinner" />
                <span>Analyzing document & verifying citations…</span>
              </>
            ) : (
              <>
                <FileSearch size={18} />
                <span>Analyze Document</span>
              </>
            )}
          </button>

          {error && <div className="error-message">{error}</div>}
        </div>
      </div>

      {/* Right panel — results */}
      <div className="panel panel-right">
        <div className="panel-header">
          <div className="panel-title-group">
            <Sparkles size={18} className="panel-header-icon highlight" />
            <h2>Document Analysis & Breakdown</h2>
          </div>
          {result && (
            <span className="results-badge">
              {clauses.length} clause{clauses.length !== 1 ? 's' : ''} reviewed
            </span>
          )}
        </div>

        <div className="panel-body results-body">
          {!result && !loading && (
            <div className="empty-state">
              <div className="empty-state-icon-wrap">
                <FileSearch size={28} />
              </div>
              <h3>Ready to analyze your document</h3>
              <p>
                Paste your legal text or select a <strong>sample document</strong> from the dropdown to see instant plain-English explanations and risk flags.
              </p>
              <div className="empty-sample-buttons">
                {SAMPLE_DOCUMENTS.map((sample) => (
                  <button
                    key={sample.id}
                    className="btn btn-secondary btn-sm empty-sample-btn"
                    onClick={() => handleSelectSample(sample)}
                  >
                    <Sparkles size={12} />
                    <span>Try {sample.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="empty-state loading-state">
              <div className="loading-spinner-wrap">
                <span className="spinner loading-lg" />
              </div>
              <h3>Reviewing every clause…</h3>
              <p>
                Extracting verbatim excerpts, identifying risk shifts, generating plain-English summaries, and drafting action checklists.
              </p>
            </div>
          )}

          {result && !loading && (
            <div className="results-content animate-fade-in">
              {/* Summary card */}
              <div className="summary-card card">
                <div className="summary-card-top">
                  <span className="ai-label">
                    <Sparkles size={11} />
                    Executive Overview
                  </span>
                  {result.chunkCount > 1 && (
                    <span className="chunk-pill" title="Parsed in parallel chunks for maximum accuracy">
                      <Layers size={12} />
                      {result.chunkCount} document chunks
                    </span>
                  )}
                </div>
                <h2 className="summary-heading">Summary & Key Takeaways</h2>
                <p className="summary-text">{result.summary}</p>
              </div>

              {/* Risk metrics summary row */}
              <div className="risk-dashboard card">
                <div className="risk-dashboard-header">
                  <div className="risk-dash-title">
                    <ShieldAlert size={16} />
                    <span>Risk Severity Breakdown</span>
                  </div>
                  <span className="risk-dash-hint">Filter clauses by clicking a tier:</span>
                </div>

                <div className="risk-summary-row">
                  <button
                    type="button"
                    className={`risk-summary-cell risk-all ${filterRisk === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterRisk('all')}
                  >
                    <span className="risk-count">{clauses.length}</span>
                    <span className="risk-label-text">All Clauses</span>
                  </button>

                  <button
                    type="button"
                    className={`risk-summary-cell risk-high ${filterRisk === 'high' ? 'active' : ''}`}
                    onClick={() => setFilterRisk('high')}
                  >
                    <span className="risk-count">{highRiskCount}</span>
                    <span className="risk-label-text">
                      <AlertTriangle size={12} />
                      High Risk
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`risk-summary-cell risk-medium ${filterRisk === 'medium' ? 'active' : ''}`}
                    onClick={() => setFilterRisk('medium')}
                  >
                    <span className="risk-count">{mediumRiskCount}</span>
                    <span className="risk-label-text">
                      <AlertCircle size={12} />
                      Medium Risk
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`risk-summary-cell risk-low ${filterRisk === 'low' ? 'active' : ''}`}
                    onClick={() => setFilterRisk('low')}
                  >
                    <span className="risk-count">{lowRiskCount}</span>
                    <span className="risk-label-text">
                      <CheckCircle2 size={12} />
                      Standard
                    </span>
                  </button>
                </div>
              </div>

              {/* Clauses Section */}
              <section className="clauses-section">
                <div className="clauses-header-bar">
                  <div className="clauses-title-wrap">
                    <h2 className="section-title">
                      Clause Breakdown ({filteredClauses.length})
                    </h2>
                  </div>

                  <div className="clause-search-wrap">
                    <Search size={14} className="clause-search-icon" />
                    <input
                      type="text"
                      placeholder="Search clauses or topics..."
                      value={clauseSearch}
                      onChange={(e) => setClauseSearch(e.target.value)}
                      className="clause-search-input"
                    />
                  </div>
                </div>

                {filteredClauses.length > 0 ? (
                  <div className="clauses-list">
                    {filteredClauses.map((clause, i) => (
                      <ClauseCard
                        key={i}
                        clause={clause}
                        onAskAboutClause={(c) => onAskAboutClause?.(c, text)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="no-clauses-found card">
                    <p>No clauses match the selected filter or search keyword.</p>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => { setFilterRisk('all'); setClauseSearch('') }}
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </section>

              {/* Glossary */}
              <GlossarySection terms={result.key_terms} />

              {/* Action checklist */}
              <ActionChecklist items={result.action_items} />

              {/* Lawyer Prep CTA */}
              <div className="lawyer-prep-cta card">
                <div className="lawyer-cta-left">
                  <div className="lawyer-cta-icon-wrap">
                    <Scale size={24} />
                  </div>
                  <div>
                    <h3>Ready to consult an attorney?</h3>
                    <p>
                      Verity can transform the {highRiskCount + mediumRiskCount} flagged risk points into a customized question list to bring to your legal consultation.
                    </p>
                  </div>
                </div>
                <button
                  className="btn btn-primary lawyer-cta-btn"
                  onClick={() => onGoToLawyerPrep?.()}
                >
                  <span>Generate Attorney Questions</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
