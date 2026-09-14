import React, { useState } from 'react'
import './ChatMessage.css'

export default function ChatMessage({ message }) {
  const [excerptOpen, setExcerptOpen] = useState(false)
  const isUser = message.role === 'user'

  return (
    <div className={`chat-message ${isUser ? 'user' : 'assistant'} ${message.streaming ? 'streaming' : ''}`}>
      <div className="message-role-label">
        {isUser ? 'You' : 'Verity'}
        {!isUser && <span className="ai-label" style={{ marginLeft: '0.4rem' }}>ⓘ AI</span>}
      </div>

      <div className={`message-bubble ${message.isError ? 'error' : ''}`}>
        {message.content || (message.streaming && <span className="typing-dot" />)}
      </div>

      {!isUser && message.excerpt && (
        <div className="message-excerpt">
          <button
            className="collapse-toggle"
            onClick={() => setExcerptOpen((o) => !o)}
            aria-expanded={excerptOpen}
          >
            {excerptOpen ? '▾' : '▸'} Source in document
          </button>
          {excerptOpen && (
            <blockquote className="excerpt-block" style={{ marginTop: '0.5rem' }}>
              "{message.excerpt}"
            </blockquote>
          )}
        </div>
      )}

      {!isUser && !message.streaming && !message.excerpt && message.content && (
        <p className="no-excerpt-note">
          No single excerpt — answer draws on the full document context.
        </p>
      )}
    </div>
  )
}
