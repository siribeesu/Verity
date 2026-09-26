import React, { useState } from 'react'
import Header from './components/Layout/Header'
import LandingPage from './components/Landing/LandingPage'
import AnalyzeTab from './components/Analyze/AnalyzeTab'
import CompareTab from './components/Compare/CompareTab'
import AskTab from './components/Ask/AskTab'
import LawyerPrepTab from './components/LawyerPrep/LawyerPrepTab'
import './App.css'

export default function App() {
  const [activeTab, setActiveTab] = useState('landing')
  // Shared state: analysis result flows into Ask and LawyerPrep
  const [analyzeResult, setAnalyzeResult] = useState(null)
  const [analyzedDocText, setAnalyzedDocText] = useState('')
  const [pendingQuestion, setPendingQuestion] = useState('')

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

  return (
    <div className="app">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasAnalyzedDoc={!!analyzeResult}
      />

      <main className="app-main" role="main">
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
      </main>
    </div>
  )
}
