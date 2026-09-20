import React from 'react'
import {
  FileSearch,
  GitCompare,
  MessageSquareQuote,
  Scale,
  Home
} from 'lucide-react'
import Logo from './Logo'
import DisclaimerBanner from './DisclaimerBanner'
import './Header.css'

export default function Header({ activeTab, onTabChange, hasAnalyzedDoc }) {
  const tabs = [
    { id: 'landing', label: 'Home', icon: Home, desc: 'Overview & Capabilities' },
    { id: 'analyze', label: 'Analyze', icon: FileSearch, desc: 'Plain-English breakdown' },
    { id: 'compare', label: 'Compare', icon: GitCompare, desc: 'Material differences' },
    { id: 'ask', label: 'Ask LegalAssist', icon: MessageSquareQuote, desc: 'Citations & Q&A' },
    { id: 'lawyer-prep', label: 'Lawyer Prep', icon: Scale, desc: 'Consultation questions' },
  ]

  return (
    <header className="app-header">
      <DisclaimerBanner />
      <div className="header-inner">
        <div
          className="header-brand clickable"
          onClick={() => onTabChange('landing')}
          title="Go to LegalAssist Home"
          role="button"
          tabIndex={0}
        >
          <div className="brand-icon-wrap">
            <Logo size={22} className="brand-logo-icon" />
          </div>
          <h1 className="brand-name">LegalAssist</h1>
        </div>

        <div className="header-right-actions">
          <nav className="tab-nav" role="tablist" aria-label="Main Navigation">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  className={`tab-btn ${isActive ? 'active' : ''}`}
                  onClick={() => onTabChange(tab.id)}
                  title={tab.desc}
                >
                  <Icon size={16} className="tab-icon" />
                  <span className="tab-label">{tab.label}</span>
                  {tab.id === 'lawyer-prep' && hasAnalyzedDoc && (
                    <span className="tab-pill-dot" title="Questions ready" />
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}
