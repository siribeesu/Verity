import React from 'react'
import DisclaimerBanner from './DisclaimerBanner'
import './Header.css'

export default function Header({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'analyze', label: 'Analyze', icon: '◎' },
    { id: 'compare', label: 'Compare', icon: '⇄' },
    { id: 'ask', label: 'Ask', icon: '◷' },
    { id: 'lawyer-prep', label: 'Lawyer Prep', icon: '⚖' },
  ]

  return (
    <header className="app-header">
      <DisclaimerBanner />
      <div className="header-inner">
        <div className="header-brand">
          <span className="brand-logo">⚖</span>
          <div>
            <h1 className="brand-name">Verity</h1>
            <p className="brand-tagline">Legal document clarity assistant</p>
          </div>
        </div>

        <nav className="tab-nav" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
