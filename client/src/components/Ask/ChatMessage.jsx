import React, { useState } from 'react'
import { User, ShieldCheck, Quote, ChevronDown, ChevronRight, Copy, Check, Sparkles } from 'lucide-react'
import './ChatMessage.css'

export default function ChatMessage({ message }) {
  const [excerptOpen, setExcerptOpen] = useState(false)
  const [copiedAnswer, setCopiedAnswer] = useState(false)
  const [copiedExcerpt, setCopiedExcerpt] = useState(false)
  const isUser = message.role === 'user'

  function handleCopyAnswer() {
    if (!message.content) return
    navigator.clipboard.writeText(message.content)
    setCopiedAnswer(true)
    setTimeout(() => setCopiedAnswer(false), 1500)
  }

  function handleCopyExcerpt() {
    if (!message.excerpt) return
    navigator.clipboard.writeText(message.excerpt)
    setCopiedExcerpt(true)
    setTimeout(() => setCopiedExcerpt(false), 1500)
  }

  return (
    <div className={`chat-message ${isUser ? 'user' : 'assistant'} ${message.streaming ? 'streaming' : ''} animate-fade-in`}>
      <div className="message-header-row">
        <div className="message-author">
          <div className={`author-avatar ${isUser ? 'user-avatar' : 'assistant-avatar'}`}>
            {isUser ? <User size={13} /> : <ShieldCheck size={13} />}
          </div>
          <span className="author-name">{isUser ? 'You' : 'Verity Assistant'}</span>
          {!isUser && (
            <span className="ai-label">
              <Sparkles size={10} />
              Verified
            </span>
          )}
        </div>

        {!isUser && message.content && !message.streaming && (
          <button
            type="button"
            className="btn btn-ghost btn-sm msg-copy-btn"
            onClick={handleCopyAnswer}
            title="Copy answer"
          >
            {copiedAnswer ? <Check size={12} className="text-success" /> : <Copy size={12} />}
          </button>
        )}
      </div>

      <div className={`message-bubble ${message.isError ? 'error' : ''}`}>
        {message.content ? (
          <div className="message-content-text">{message.content}</div>
        ) : (
          message.streaming && <span className="typing-dot" />
        )}
      </div>

      {!isUser && message.excerpt && (
        <div className="message-excerpt-drawer">
          <div className="excerpt-drawer-header">
            <button
              type="button"
              className="collapse-toggle excerpt-toggle"
              onClick={() => setExcerptOpen((o) => !o)}
              aria-expanded={excerptOpen}
            >
              {excerptOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <Quote size={13} className="quote-icon" />
              <span>Verbatim Source Excerpt</span>
            </button>

            {excerptOpen && (
              <button
                type="button"
                className="btn btn-ghost btn-sm copy-quote-btn"
                onClick={handleCopyExcerpt}
                title="Copy source quote"
              >
                {copiedExcerpt ? <Check size={11} /> : <Copy size={11} />}
                <span>{copiedExcerpt ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          {excerptOpen && (
            <blockquote className="excerpt-block message-excerpt-quote animate-fade-in">
              "{message.excerpt}"
            </blockquote>
          )}
        </div>
      )}

      {!isUser && !message.streaming && !message.excerpt && message.content && (
        <p className="no-excerpt-note">
          Answer synthesized across the broader document context.
        </p>
      )}
    </div>
  )
}
