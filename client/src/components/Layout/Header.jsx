import React from 'react'
import {
  FileSearch,
  GitCompare,
  MessageSquareQuote,
  Scale,
  ShieldCheck,
  Home,
  Sparkles
} from 'lucide-react'
import DisclaimerBanner from './DisclaimerBanner'
import './Header.css'

export default function Header({ activeTab, onTabChange, hasAnalyzedDoc }) {
  const tabs = [
    { id: 'landing', label: 'Home', icon: Home, desc: 'Overview & Capabilities', colorClass: 'icon-cyan' },
    { id: 'analyze', label: 'Analyze', icon: FileSearch, desc: 'Plain-English breakdown', colorClass: 'icon-indigo' },
    { id: 'compare', label: 'Compare', icon: GitCompare, desc: 'Material differences', colorClass: 'icon-purple' },
    { id: 'ask', label: 'Ask Verity', icon: MessageSquareQuote, desc: 'Citations & Q&A', colorClass: 'icon-emerald' },
    { id: 'lawyer-prep', label: 'Lawyer Prep', icon: Scale, desc: 'Consultation questions', colorClass: 'icon-amber' },
  ]

  return (
    <header className="app-header">
      <DisclaimerBanner />
      <div className="header-inner">
        <div
          className="header-brand clickable"
          onClick={() => onTabChange('landing')}
          title="Go to Verity Home"
          role="button"
          tabIndex={0}
        >
          <div className="brand-icon-wrap">
            <ShieldCheck className="brand-logo-icon" size={24} />
          </div>
          <div className="brand-text-block">
            <div className="brand-title-row">
              <h1 className="brand-name">Verity</h1>
              <span className="brand-badge">
                <Sparkles size={10} className="badge-sparkle" />
                Legal Clarity AI
              </span>
            </div>
            <p className="brand-tagline">Understand, compare & challenge contracts with verifiable source citations</p>
          </div>
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
                  <Icon size={16} className={`tab-icon ${tab.colorClass}`} />
                  <span className="tab-label">{tab.label}</span>
                  {tab.id === 'lawyer-prep' && hasAnalyzedDoc && (
                    <span className="tab-pill-dot animate-pulse-glow" title="Questions ready" />
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
