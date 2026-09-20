import React, { useState, useRef, useEffect } from 'react'
import DocumentInput from '../DocumentInput/DocumentInput'
import ChatMessage from './ChatMessage'
import { useAsk } from '../../hooks/useAsk'
import { SAMPLE_DOCUMENTS } from '../../data/sampleDocuments'
import {
  MessageSquareQuote,
  Send,
  Trash2,
  FileText,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Download,
  Search,
  CheckCircle2,
  HelpCircle
} from 'lucide-react'
import './AskTab.css'

const QUESTION_CATEGORIES = [
  {
    category: 'Risks & Penalties',
    icon: ShieldAlert,
    questions: [
      'What are the penalties if I terminate or breach early?',
      'Are there any automatic renewals or surprise fee escalations?',
      'What liabilities or risks am I agreeing to take on?',
    ],
  },
  {
    category: 'Rights & Obligations',
    icon: HelpCircle,
    questions: [
      'What can the other party do without my advance notice or consent?',
      'Who owns any intellectual property, deliverables, or derivatives?',
      'What are the mandatory notice and dispute resolution procedures?',
    ],
  },
]

export default function AskTab({ preloadedText, initialQuestion }) {
  const [docText, setDocText] = useState(preloadedText || '')
  const [docFile, setDocFile] = useState(null)
  const [resolvedText, setResolvedText] = useState(preloadedText || '')
  const [question, setQuestion] = useState(initialQuestion || '')
  const [docLoaded, setDocLoaded] = useState(!!preloadedText)
  const [docSearchQuery, setDocSearchQuery] = useState('')
  const messagesEndRef = useRef(null)

  const { messages, streaming, error, ask, clearMessages } = useAsk(resolvedText)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Sync if preloadedText or initialQuestion changes
  useEffect(() => {
    if (preloadedText) {
      setDocText(preloadedText)
      setResolvedText(preloadedText)
      setDocLoaded(true)
    }
  }, [preloadedText])

  useEffect(() => {
    if (initialQuestion) {
      setQuestion(initialQuestion)
    }
  }, [initialQuestion])

  function handleLoadDoc() {
    if (docText.trim()) {
      setResolvedText(docText)
      setDocLoaded(true)
      clearMessages()
    }
  }

  function handleSelectSample(sample) {
    setDocText(sample.text)
    setResolvedText(sample.text)
    setDocLoaded(true)
    clearMessages()
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

  function handleExportChat() {
    if (!messages.length) return
    const formatted = messages
      .map((m) => {
        const role = m.role === 'user' ? 'USER' : 'LEGALASSIST ASSISTANT'
        let text = `[${role}]:\n${m.content}\n`
        if (m.excerpt) {
          text += `(Cited Excerpt: "${m.excerpt}")\n`
        }
        return text
      })
      .join('\n---\n\n')

    const blob = new Blob([formatted], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `legalassist-document-chat-${new Date().toISOString().slice(0, 10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const wordCount = resolvedText ? resolvedText.trim().split(/\s+/).filter(Boolean).length : 0

  return (
    <div className="ask-tab">
      {/* Left: document panel */}
      <div className="ask-doc-panel">
        <div className="panel-header">
          <div className="panel-title-group">
            <FileText size={18} className="panel-header-icon" />
            <h2>Document Context</h2>
          </div>
          {docLoaded && (
            <span className="doc-loaded-badge">
              <CheckCircle2 size={12} />
              Loaded ({wordCount.toLocaleString()} words)
            </span>
          )}
        </div>

        <div className="panel-body">
          {!docLoaded ? (
            <div className="doc-load-form">
              <DocumentInput
                label="Document to Question"
                value={docText}
                onChange={setDocText}
                onFileChange={setDocFile}
                placeholder="Paste the document text to enable grounded Q&A with citations..."
                samples={SAMPLE_DOCUMENTS}
                onSelectSample={handleSelectSample}
              />
              <button
                className="btn btn-primary btn-load-doc"
                onClick={handleLoadDoc}
                disabled={!docText.trim()}
              >
                <span>Load Document for Q&A</span>
                <ArrowRight size={15} />
              </button>
            </div>
          ) : (
            <div className="doc-preview-container">
              <div className="doc-preview-search">
                <Search size={14} className="preview-search-icon" />
                <input
                  type="text"
                  placeholder="Filter or search in document text..."
                  value={docSearchQuery}
                  onChange={(e) => setDocSearchQuery(e.target.value)}
                  className="preview-search-input"
                />
              </div>

              <div className="doc-preview-box">
                <p className="doc-preview-text">
                  {docSearchQuery
                    ? resolvedText
                        .split('\n')
                        .filter((line) => line.toLowerCase().includes(docSearchQuery.toLowerCase()))
                        .join('\n') || 'No matching lines found.'
                    : resolvedText}
                </p>
              </div>

              <button
                className="btn btn-secondary btn-sm replace-doc-btn"
                onClick={() => {
                  setDocLoaded(false)
                  clearMessages()
                }}
              >
                <span>Change / Replace Document</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right: chat panel */}
      <div className="ask-chat-panel">
        <div className="panel-header">
          <div className="panel-title-group">
            <MessageSquareQuote size={18} className="panel-header-icon highlight" />
            <h2>Ask LegalAssist (Grounded Q&A)</h2>
          </div>
          <div className="chat-header-actions">
            {messages.length > 0 && (
              <>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={handleExportChat}
                  title="Export conversation as text"
                >
                  <Download size={13} />
                  <span>Export</span>
                </button>
                <button
                  className="btn btn-ghost btn-sm text-muted"
                  onClick={clearMessages}
                  title="Clear chat messages"
                >
                  <Trash2 size={13} />
                  <span>Clear</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="chat-messages-area">
          {!docLoaded && (
            <div className="empty-state">
              <div className="empty-state-icon-wrap">
                <MessageSquareQuote size={28} />
              </div>
              <h3>Load a document to start asking questions</h3>
              <p>
                Every answer will cite verbatim excerpts directly from your agreement to ensure maximum accuracy and transparency.
              </p>
            </div>
          )}

          {docLoaded && messages.length === 0 && (
            <div className="chat-welcome animate-fade-in">
              <div className="welcome-hero-circle">
                <Sparkles size={24} />
              </div>
              <h3>What would you like to know about this agreement?</h3>
              <p>
                Select a common legal question below or type your own question into the prompt bar.
              </p>

              <div className="question-category-groups">
                {QUESTION_CATEGORIES.map((cat, i) => {
                  const CatIcon = cat.icon
                  return (
                    <div key={i} className="category-group-card">
                      <div className="category-group-title">
                        <CatIcon size={14} className="cat-group-icon" />
                        <span>{cat.category}</span>
                      </div>
                      <div className="sample-question-chips">
                        {cat.questions.map((q, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="sample-chip"
                            onClick={() => {
                              setQuestion(q)
                            }}
                          >
                            <span>{q}</span>
                            <ArrowRight size={12} className="chip-arrow" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
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
          {error && (
            <div className="error-message" style={{ marginBottom: '0.65rem' }}>
              {error}
            </div>
          )}
          <div className="chat-input-row">
            <textarea
              className="chat-textarea"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                docLoaded
                  ? 'Ask anything about your document… (Enter to send, Shift+Enter for new line)'
                  : 'Please load a document on the left first'
              }
              disabled={!docLoaded || streaming}
              rows={2}
            />
            <button
              className="btn btn-primary send-btn"
              onClick={handleSend}
              disabled={!question.trim() || streaming || !docLoaded}
              title="Send question"
            >
              {streaming ? <span className="spinner" /> : <Send size={16} />}
            </button>
          </div>
          <div className="chat-disclaimer-bar">
            <span>
              ℹ Answers are strictly grounded in the document text and include verbatim quotes where available.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
