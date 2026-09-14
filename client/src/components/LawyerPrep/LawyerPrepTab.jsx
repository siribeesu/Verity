import React, { useEffect } from 'react'
import { useLawyerPrep } from '../../hooks/useLawyerPrep'
import './LawyerPrepTab.css'

export default function LawyerPrepTab({ analyzeResult }) {
  const { result, loading, error, run } = useLawyerPrep()

  useEffect(() => {
    if (analyzeResult && !result) {
      run(analyzeResult)
    }
  }, [analyzeResult])

  function handleCopy() {
    if (!result?.questions) return
    const text = result.questions
      .map((q, i) => `${i + 1}. ${q.question}\n   Why it matters: ${q.why_it_matters}`)
      .join('\n\n')
    navigator.clipboard.writeText(text)
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className="lawyer-prep-tab">
      <div className="lawyer-prep-inner">
        <div className="lawyer-prep-hero">
          <span className="hero-icon">⚖</span>
          <div>
            <h1>Attorney Consultation Prep</h1>
            <p className="hero-desc">
              These questions are derived from what Verity flagged as ambiguous, high-risk, or unusual
              in your document. Bring this list to your first attorney meeting to focus the conversation
              on what matters most.
            </p>
          </div>
        </div>

        <div className="lawyer-framing card">
          <p>
            <strong>Remember:</strong> Verity is not your lawyer. These questions are a starting
            point for a professional conversation — not a substitute for legal advice. A licensed
            attorney in your jurisdiction is the only one who can advise you on your specific situation.
          </p>
        </div>

        {!analyzeResult && (
          <div className="empty-state">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚖</div>
            <h3>No analysis yet</h3>
            <p>Run Analyze on a document first, then come back here to generate your attorney questions.</p>
          </div>
        )}

        {analyzeResult && loading && (
          <div className="empty-state">
            <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
            <p style={{ marginTop: '1rem' }}>Preparing your questions…</p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {result?.questions?.length > 0 && (
          <>
            <div className="questions-header">
              <h2>{result.questions.length} Questions for Your Attorney</h2>
              <div className="questions-actions">
                <button className="btn btn-secondary" onClick={handleCopy}>
                  ⎘ Copy
                </button>
                <button className="btn btn-secondary" onClick={handlePrint}>
                  ⎙ Print
                </button>
                {analyzeResult && (
                  <button className="btn btn-ghost" onClick={() => run(analyzeResult)}>
                    ↻ Regenerate
                  </button>
                )}
              </div>
            </div>

            <ol className="questions-list">
              {result.questions.map((q, i) => (
                <li key={i} className="question-item card">
                  <div className="question-number">{i + 1}</div>
                  <div className="question-content">
                    <p className="question-text">{q.question}</p>
                    <div className="why-matters">
                      <span className="why-label">Why it matters</span>
                      <p>{q.why_it_matters}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            <div className="lawyer-footer-note">
              <p>
                <strong>Finding an attorney:</strong> Many state bar associations have free or low-cost
                referral services. Legal aid organizations can help if cost is a concern. Some attorneys
                offer a free first consultation.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
