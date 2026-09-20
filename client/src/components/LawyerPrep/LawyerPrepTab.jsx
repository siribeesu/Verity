import React, { useEffect, useState } from 'react'
import { useLawyerPrep } from '../../hooks/useLawyerPrep'
import {
  Scale,
  Copy,
  Printer,
  RefreshCw,
  Sparkles,
  HelpCircle,
  FileText,
  Check,
  Edit3,
  ExternalLink,
  ShieldCheck
} from 'lucide-react'
import { SAMPLE_DOCUMENTS } from '../../data/sampleDocuments'
import './LawyerPrepTab.css'

export default function LawyerPrepTab({ analyzeResult, onRunSampleAnalyze }) {
  const { result, loading, error, run } = useLawyerPrep()
  const [copied, setCopied] = useState(false)
  const [notes, setNotes] = useState({})
  const [activeNoteId, setActiveNoteId] = useState(null)

  useEffect(() => {
    if (analyzeResult && !result) {
      run(analyzeResult)
    }
  }, [analyzeResult])

  function handleCopy() {
    if (!result?.questions) return
    const text = result.questions
      .map((q, i) => {
        let entry = `${i + 1}. ${q.question}\n   Why it matters: ${q.why_it_matters}`
        if (notes[i]) {
          entry += `\n   My Consultation Notes: ${notes[i]}`
        }
        return entry
      })
      .join('\n\n')

    navigator.clipboard.writeText(`ATTORNEY CONSULTATION PREPARATION SHEET\n\n${text}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function handlePrint() {
    window.print()
  }

  function handleNoteChange(index, val) {
    setNotes((prev) => ({
      ...prev,
      [index]: val,
    }))
  }

  return (
    <div className="lawyer-prep-tab">
      <div className="lawyer-prep-inner">
        <div className="lawyer-prep-hero card">
          <div className="hero-icon-circle">
            <Scale size={28} />
          </div>
          <div className="hero-content">
            <h1>Attorney Consultation Prep Sheet</h1>
            <p className="hero-desc">
              These customized questions are derived directly from the ambiguities, high-risk terms, and one-sided clauses flagged in your document. Bring this agenda to your attorney consultation to get the most value out of your meeting.
            </p>
          </div>
        </div>

        <div className="lawyer-framing card">
          <div className="framing-header">
            <ShieldCheck size={16} className="framing-icon" />
            <h3>Important Professional Context</h3>
          </div>
          <p>
            Verity is an informational clarity tool, not a law firm or licensed attorney. These questions serve as a structured starting point for your meeting. A licensed lawyer in your jurisdiction is the only professional qualified to evaluate your individual risks and legal strategy.
          </p>
        </div>

        {!analyzeResult && !result && (
          <div className="empty-state card">
            <div className="empty-state-icon-wrap">
              <Scale size={28} />
            </div>
            <h3>No Document Analysis Found</h3>
            <p>
              Run an analysis on a document in the <strong>Analyze tab</strong> first, or load a sample contract to generate an instant consultation agenda.
            </p>
            {onRunSampleAnalyze && (
              <button
                className="btn btn-primary"
                onClick={() => onRunSampleAnalyze(SAMPLE_DOCUMENTS[0])}
                style={{ marginTop: '1rem' }}
              >
                <Sparkles size={14} />
                <span>Analyze Sample Lease & Generate Agenda</span>
              </button>
            )}
          </div>
        )}

        {analyzeResult && loading && (
          <div className="empty-state loading-state card">
            <div className="loading-spinner-wrap">
              <span className="spinner loading-lg" />
            </div>
            <h3>Formulating targeted attorney questions…</h3>
            <p>Synthesizing flagged risks, ambiguous phrasing, and key terms into high-leverage discussion topics.</p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {result?.questions?.length > 0 && (
          <div className="questions-section animate-fade-in">
            <div className="questions-header-bar">
              <div className="questions-title-group">
                <h2>{result.questions.length} Questions for Your Attorney</h2>
                <span className="questions-badge">Prioritized by Risk</span>
              </div>

              <div className="questions-actions">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleCopy}
                  title="Copy formatted questions and notes"
                >
                  {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                  <span>{copied ? 'Copied' : 'Copy All'}</span>
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handlePrint}
                  title="Print consultation sheet"
                >
                  <Printer size={13} />
                  <span>Print Sheet</span>
                </button>
                {analyzeResult && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => run(analyzeResult)}
                    title="Regenerate questions"
                  >
                    <RefreshCw size={13} />
                    <span>Regenerate</span>
                  </button>
                )}
              </div>
            </div>

            <ol className="questions-list">
              {result.questions.map((q, i) => (
                <li key={i} className="question-item card">
                  <div className="question-number-wrap">
                    <span className="question-number">{i + 1}</span>
                  </div>

                  <div className="question-content">
                    <p className="question-text">{q.question}</p>

                    <div className="why-matters-box">
                      <span className="why-label">Why this is critical to ask</span>
                      <p>{q.why_it_matters}</p>
                    </div>

                    {/* Interactive meeting note */}
                    <div className="question-notes-section">
                      {activeNoteId === i || notes[i] ? (
                        <div className="notes-editor animate-fade-in">
                          <label className="notes-label" htmlFor={`note-${i}`}>
                            <Edit3 size={12} />
                            <span>Attorney's Advice / Your Notes:</span>
                          </label>
                          <textarea
                            id={`note-${i}`}
                            value={notes[i] || ''}
                            onChange={(e) => handleNoteChange(i, e.target.value)}
                            placeholder="Type notes from your conversation here..."
                            rows={2}
                            className="notes-textarea"
                          />
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm add-note-btn"
                          onClick={() => setActiveNoteId(i)}
                        >
                          <Edit3 size={12} />
                          <span>+ Add Consultation Note</span>
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            <div className="lawyer-resources card">
              <div className="resources-header">
                <HelpCircle size={16} className="resources-icon" />
                <h3>Finding Qualified Legal Help</h3>
              </div>
              <p>
                Many state and local bar associations offer low-cost referral programs, and legal aid societies provide assistance for qualifying tenants, employees, and small business owners. When interviewing attorneys, ask if they provide a free 15-minute consultation to review this agenda.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
