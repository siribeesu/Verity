import React, { useState, useRef, useEffect } from 'react'
import DocumentInput from '../DocumentInput/DocumentInput'
import ChatMessage from './ChatMessage'
import { useAsk } from '../../hooks/useAsk'
import './AskTab.css'

const SAMPLE_QUESTIONS = [
  'What happens if I want to end this agreement early?',
  'Who is responsible if something goes wrong?',
  'Are there any automatic renewal clauses?',
  'What can the other party do without my consent?',
]

export default function AskTab({ preloadedText }) {
  const [docText, setDocText] = useState(preloadedText || '')
  const [docFile, setDocFile] = useState(null)
  const [resolvedText, setResolvedText] = useState(preloadedText || '')
  const [question, setQuestion] = useState('')
  const [docLoaded, setDocLoaded] = useState(!!preloadedText)
  const messagesEndRef = useRef(null)

  // If a file is uploaded, we need to read it client-side or just send it
  // For Ask, we need the text, so we'll send it to a quick parse endpoint
  // Simple approach: just use the pasted text for now (file upload resolves to text via analyze)

  const { messages, streaming, error, ask, clearMessages } = useAsk(resolvedText)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // If preloadedText changes (from Analyze tab), update
  useEffect(() => {
    if (preloadedText && !docLoaded) {
      setDocText(preloadedText)
      setResolvedText(preloadedText)
      setDocLoaded(true)
    }
  }, [preloadedText])

  function handleLoadDoc() {
    if (docText.trim()) {
      setResolvedText(docText)
      setDocLoaded(true)
      clearMessages()
    }
  }

  function handleSend() {
    if (!question.trim() || streaming || !resolvedText) return
    ask(question)
    setQuestion('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="ask-tab">
      {/* Left: document panel */}
      <div className="ask-doc-panel">
        <div className="panel-header">
          <h2>Document</h2>
          {docLoaded && (
            <span className="doc-loaded-badge">✓ Loaded</span>
          )}
        </div>
        <div className="panel-body">
          {!docLoaded ? (
            <>
              <DocumentInput
                label="Legal Document"
                value={docText}
                onChange={setDocText}
                onFileChange={setDocFile}
                placeholder="Paste the document you want to ask questions about..."
              />
              <button
                className="btn btn-primary"
                onClick={handleLoadDoc}
                disabled={!docText.trim()}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Load Document
              </button>
              {preloadedText && (
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  ✓ Document from Analyze tab is ready — click Load Document.
                </p>
              )}
            </>
          ) : (
            <div className="doc-preview">
              <p className="doc-preview-text">{resolvedText.slice(0, 600)}{resolvedText.length > 600 ? '…' : ''}</p>
              <button
                className="btn btn-ghost"
                onClick={() => { setDocLoaded(false); clearMessages() }}
              >
                ← Replace document
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right: chat panel */}
      <div className="ask-chat-panel">
        <div className="panel-header">
          <h2>Ask Verity</h2>
          {messages.length > 0 && (
            <button className="btn btn-ghost" style={{ fontSize: '0.8rem' }} onClick={clearMessages}>
              Clear chat
            </button>
          )}
        </div>

        <div className="chat-messages-area">
          {!docLoaded && (
            <div className="empty-state">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>◷</div>
              <h3>Load a document to start</h3>
              <p>Every answer will be grounded in your document's actual text.</p>
            </div>
          )}

          {docLoaded && messages.length === 0 && (
            <div className="chat-welcome">
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>◷</div>
              <p>Ask anything about your document. Try:</p>
              <div className="sample-questions">
                {SAMPLE_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    className="sample-question-btn"
                    onClick={() => { setQuestion(q); }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="messages-list">
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="chat-input-area">
          {error && <div className="error-message" style={{ marginBottom: '0.5rem', fontSize: '0.82rem' }}>{error}</div>}
          <div className="chat-input-row">
            <textarea
              className="chat-textarea"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={docLoaded ? 'Ask a question about your document… (Enter to send)' : 'Load a document first'}
              disabled={!docLoaded || streaming}
              rows={2}
            />
            <button
              className="btn btn-primary send-btn"
              onClick={handleSend}
              disabled={!question.trim() || streaming || !docLoaded}
            >
              {streaming ? <span className="spinner" /> : '→'}
            </button>
          </div>
          <p className="chat-disclaimer">
            Answers are grounded in your document. Verity may make mistakes — consult a lawyer for anything consequential.
          </p>
        </div>
      </div>
    </div>
  )
}
