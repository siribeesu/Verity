import {
  FileSearch,
  GitCompare,
  MessageSquareQuote,
  Scale,
  Home,
  LogOut,
  ShieldCheck,
  BarChart3,
  BookOpen,
  Keyboard
} from 'lucide-react'
import Logo from './Logo'
import DisclaimerBanner from './DisclaimerBanner'
import ComplianceModal from './ComplianceModal'
import AdminModal from './AdminModal'
import LegalGlossaryModal from '../LegalGuide/LegalGlossaryModal'
import KeyboardShortcutsModal from './KeyboardShortcutsModal'
import './Header.css'

export default function Header({ activeTab, onTabChange, hasAnalyzedDoc, accountLabel, onSignOut }) {
  const [showCompliance, setShowCompliance] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [showLegalGuide, setShowLegalGuide] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
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
          {accountLabel && (
            <div className="account-actions">
              <span className="account-label" title={accountLabel}>{accountLabel}</span>
              <button type="button" className="sign-out-btn" onClick={onSignOut} title="Sign out" aria-label="Sign out">
                <LogOut size={16} />
              </button>
            </div>
          )}
          <nav className="tab-nav" role="tablist" aria-label="Main Navigation">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`tabpanel-${tab.id}`}
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

          <button
            type="button"
            className="btn btn-ghost btn-sm guide-nav-btn"
            onClick={() => setShowLegalGuide(true)}
            title="Legal Doctrine Knowledge Base & Negotiation Guide"
            aria-label="Legal Doctrine Knowledge Base & Negotiation Guide"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginLeft: '0.3rem', color: 'var(--color-primary)' }}
          >
            <BookOpen size={15} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Legal Guide</span>
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-sm compliance-nav-btn"
            onClick={() => setShowCompliance(true)}
            title="Privacy, zero-retention policy, and audit trail"
            aria-label="Privacy and Trust Center"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginLeft: '0.2rem', color: 'var(--color-primary)' }}
          >
            <ShieldCheck size={15} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Trust</span>
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-sm admin-nav-btn"
            onClick={() => setShowAdmin(true)}
            title="Admin Observability, Performance Metrics & RBAC"
            aria-label="Admin Observability & Metrics"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginLeft: '0.2rem', color: 'var(--color-text-secondary)' }}
          >
            <BarChart3 size={15} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Admin</span>
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-sm shortcuts-nav-btn"
            onClick={() => setShowShortcuts(true)}
            title="Keyboard Navigation Shortcuts (Press ?)"
            aria-label="Keyboard Shortcuts"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginLeft: '0.2rem', color: 'var(--color-text-secondary)' }}
          >
            <Keyboard size={15} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>?</span>
          </button>
        </div>
      </div>

      <ComplianceModal isOpen={showCompliance} onClose={() => setShowCompliance(false)} />
      <AdminModal isOpen={showAdmin} onClose={() => setShowAdmin(false)} />
      <LegalGlossaryModal isOpen={showLegalGuide} onClose={() => setShowLegalGuide(false)} />
      <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </header>
  )
}
