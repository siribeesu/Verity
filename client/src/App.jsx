import React, { useState } from 'react'
import Header from './components/Layout/Header'
import AnalyzeTab from './components/Analyze/AnalyzeTab'
import CompareTab from './components/Compare/CompareTab'
import AskTab from './components/Ask/AskTab'
import LawyerPrepTab from './components/LawyerPrep/LawyerPrepTab'
import './App.css'

export default function App() {
  const [activeTab, setActiveTab] = useState('analyze')
  // Shared state: analysis result flows into Ask and LawyerPrep
  const [analyzeResult, setAnalyzeResult] = useState(null)
  const [analyzedDocText, setAnalyzedDocText] = useState('')

  function handleAnalysisComplete(result, docText) {
    setAnalyzeResult(result)
    setAnalyzedDocText(docText)
  }

  function handleGoToLawyerPrep() {
    setActiveTab('lawyer-prep')
  }

  return (
    <div className="app">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="app-main" role="main">
        {activeTab === 'analyze' && (
          <AnalyzeTab
            onAnalysisComplete={handleAnalysisComplete}
            onGoToLawyerPrep={handleGoToLawyerPrep}
          />
        )}
        {activeTab === 'compare' && <CompareTab />}
        {activeTab === 'ask' && (
          <AskTab preloadedText={analyzedDocText} />
        )}
        {activeTab === 'lawyer-prep' && (
          <LawyerPrepTab analyzeResult={analyzeResult} />
        )}
      </main>
    </div>
  )
}
