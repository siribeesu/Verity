import React from 'react'
import { Keyboard, X, ArrowRight, CornerDownLeft, Sparkles } from 'lucide-react'
import './KeyboardShortcutsModal.css'

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null

  const navigationShortcuts = [
    { key: 'Alt + 1', desc: 'Navigate to Home / Capabilities tab' },
    { key: 'Alt + 2', desc: 'Navigate to Analyze tab' },
    { key: 'Alt + 3', desc: 'Navigate to Compare tab' },
    { key: 'Alt + 4', desc: 'Navigate to Ask LegalAssist tab' },
    { key: 'Alt + 5', desc: 'Navigate to Lawyer Prep tab' }
  ]

  const actionShortcuts = [
    { key: 'Ctrl + Enter', desc: 'Run document analysis or submit question' },
    { key: 'Escape', desc: 'Dismiss any open modal or dialog' },
    { key: '?', desc: 'Toggle this keyboard shortcuts guide' },
    { key: 'Tab', desc: 'Move focus to next interactive element' },
    { key: 'Shift + Tab', desc: 'Move focus to previous interactive element' }
  ]

  return (
    <div
      className="shortcuts-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div className="shortcuts-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-modal-header">
          <div className="shortcuts-header-title">
            <Keyboard size={20} className="shortcuts-header-icon" />
            <h2 id="shortcuts-title">Keyboard Navigation & Accessibility Guide</h2>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm close-shortcuts-btn"
            onClick={onClose}
            aria-label="Close keyboard shortcuts dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="shortcuts-modal-body">
          <p className="shortcuts-intro">
            LegalAssist is engineered for full WCAG AAA keyboard accessibility. You can navigate, analyze contracts, and manage workflows without touching a mouse.
          </p>

          <div className="shortcuts-section">
            <h3 className="shortcuts-section-heading">Tab Navigation Shortcuts</h3>
            <div className="shortcuts-grid">
              {navigationShortcuts.map((item) => (
                <div key={item.key} className="shortcut-row">
                  <span className="shortcut-desc">{item.desc}</span>
                  <kbd className="shortcut-badge">{item.key}</kbd>
                </div>
              ))}
            </div>
          </div>

          <div className="shortcuts-section">
            <h3 className="shortcuts-section-heading">Operational & Dialog Shortcuts</h3>
            <div className="shortcuts-grid">
              {actionShortcuts.map((item) => (
                <div key={item.key} className="shortcut-row">
                  <span className="shortcut-desc">{item.desc}</span>
                  <kbd className="shortcut-badge">{item.key}</kbd>
                </div>
              ))}
            </div>
          </div>

          <div className="screen-reader-tip-box">
            <Sparkles size={15} className="tip-icon" />
            <div className="tip-content">
              <strong>Screen Reader Compatibility:</strong> Fully compatible with NVDA, JAWS, VoiceOver, and Orca with ARIA landmark regions, live status announcements, and high-contrast visible focus indicators.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
