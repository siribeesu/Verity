import React, { useState, useEffect } from 'react'
import Header from './components/Layout/Header'
import LandingPage from './components/Landing/LandingPage'
import AnalyzeTab from './components/Analyze/AnalyzeTab'
import CompareTab from './components/Compare/CompareTab'
import AskTab from './components/Ask/AskTab'
import LawyerPrepTab from './components/LawyerPrep/LawyerPrepTab'
import { AuthProvider, useAuth } from './auth/AuthProvider'
import './App.css'

function AuthenticatedApp() {
  const { state, user, signIn, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('landing')
  // Shared state: analysis result flows into Ask and LawyerPrep
  const [analyzeResult, setAnalyzeResult] = useState(null)
  const [analyzedDocText, setAnalyzedDocText] = useState('')
  const [pendingQuestion, setPendingQuestion] = useState('')

  useEffect(() => {
    function handleKeyDown(e) {
      const tag = e.target.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) {
        return
      }

      if (e.altKey) {
        if (e.key === '1') { e.preventDefault(); setActiveTab('landing'); }
        else if (e.key === '2') { e.preventDefault(); setActiveTab('analyze'); }
        else if (e.key === '3') { e.preventDefault(); setActiveTab('compare'); }
        else if (e.key === '4') { e.preventDefault(); setActiveTab('ask'); }
        else if (e.key === '5') { e.preventDefault(); setActiveTab('lawyer-prep'); }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  function handleAnalysisComplete(result, docText) {
    setAnalyzeResult(result)
    setAnalyzedDocText(docText)
  }

  function handleGoToLawyerPrep() {
    setActiveTab('lawyer-prep')
  }

  function handleAskAboutClause(clause, fullDocText) {
    if (fullDocText) {
      setAnalyzedDocText(fullDocText)
    }
    setPendingQuestion(
      `Please explain the risks and implications of this clause: "${clause.title}" - excerpt: "${clause.original_excerpt}"`
    )
    setActiveTab('ask')
  }

  if (state !== 'disabled' && state !== 'authenticated') {
    return (
      <main className="auth-gate" role="main">
        <section className="auth-panel">
          <h1>LegalAssist</h1>
          {state === 'loading' && <p>Checking your secure session…</p>}
          {state === 'misconfigured' && (
            <p>Sign-in is not configured for this deployment. Contact the site administrator.</p>
          )}
          {(state === 'unauthenticated' || state === 'error') && (
            <>
              <p>{state === 'error' ? 'Sign-in could not be completed. Please try again.' : 'Sign in to use LegalAssist.'}</p>
              <button type="button" className="btn btn-primary" onClick={signIn}>Sign in</button>
            </>
          )}
        </section>
      </main>
    )
  }

  return (
    <div className="app">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasAnalyzedDoc={!!analyzeResult}
        accountLabel={state === 'authenticated'
          ? (user.profile?.email || user.profile?.name || user.profile?.sub)
          : null}
        onSignOut={state === 'authenticated' ? signOut : null}
      />

      <main className="app-main" role="main" id="main-content" tabIndex="-1">
        <div
          id={`tabpanel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className="tabpanel-container"
          style={{ width: '100%', height: '100%' }}
        >
          {activeTab === 'landing' && (
            <LandingPage
              onLaunchApp={setActiveTab}
            />
          )}
          {activeTab === 'analyze' && (
            <AnalyzeTab
              onAnalysisComplete={handleAnalysisComplete}
              onGoToLawyerPrep={handleGoToLawyerPrep}
              onAskAboutClause={handleAskAboutClause}
            />
          )}
          {activeTab === 'compare' && <CompareTab />}
          {activeTab === 'ask' && (
            <AskTab
              preloadedText={analyzedDocText}
              initialQuestion={pendingQuestion}
            />
          )}
          {activeTab === 'lawyer-prep' && (
            <LawyerPrepTab
              analyzeResult={analyzeResult}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  )
}
