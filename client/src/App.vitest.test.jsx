import { fireEvent, render, screen } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import App from './App'

vi.mock('./components/Layout/Header', () => ({
  default: ({ activeTab, onTabChange, hasAnalyzedDoc }) => (
    <header>
      <span data-testid="active-tab">{activeTab}</span>
      <span data-testid="has-analysis">{String(hasAnalyzedDoc)}</span>
      <button onClick={() => onTabChange('analyze')}>Analyze tab</button>
      <button onClick={() => onTabChange('compare')}>Compare tab</button>
    </header>
  ),
}))

vi.mock('./components/Landing/LandingPage', () => ({
  default: ({ onLaunchWithSample }) => (
    <button onClick={() => onLaunchWithSample({ text: 'Sample agreement text' })}>Load sample</button>
  ),
}))

vi.mock('./components/Analyze/AnalyzeTab', () => ({
  default: ({ onAnalysisComplete, onGoToLawyerPrep, onAskAboutClause }) => (
    <section>
      <button onClick={() => onAnalysisComplete({ summary: 'Analyzed' }, 'Analyzed document')}>Complete analysis</button>
      <button onClick={onGoToLawyerPrep}>Open lawyer prep</button>
      <button onClick={() => onAskAboutClause({ title: 'Termination', original_excerpt: '30 days notice' }, 'Full document')}>Ask about clause</button>
    </section>
  ),
}))

vi.mock('./components/Compare/CompareTab', () => ({ default: () => <p>Comparison view</p> }))
vi.mock('./components/Ask/AskTab', () => ({
  default: ({ preloadedText, initialQuestion }) => (
    <section>
      <span data-testid="ask-document">{preloadedText}</span>
      <span data-testid="initial-question">{initialQuestion}</span>
    </section>
  ),
}))
vi.mock('./components/LawyerPrep/LawyerPrepTab', () => ({
  default: ({ analyzeResult }) => <span data-testid="prep-summary">{analyzeResult?.summary}</span>,
}))

test('App navigates between tabs and passes shared analysis and clause context', () => {
  render(<App />)

  fireEvent.click(screen.getByRole('button', { name: 'Load sample' }))
  expect(screen.getByTestId('active-tab').textContent).toBe('analyze')

  fireEvent.click(screen.getByRole('button', { name: 'Complete analysis' }))
  expect(screen.getByTestId('has-analysis').textContent).toBe('true')

  fireEvent.click(screen.getByRole('button', { name: 'Open lawyer prep' }))
  expect(screen.getByTestId('active-tab').textContent).toBe('lawyer-prep')
  expect(screen.getByTestId('prep-summary').textContent).toBe('Analyzed')

  fireEvent.click(screen.getByRole('button', { name: 'Compare tab' }))
  expect(screen.getByText('Comparison view').textContent).toBe('Comparison view')

  fireEvent.click(screen.getByRole('button', { name: 'Analyze tab' }))
  fireEvent.click(screen.getByRole('button', { name: 'Ask about clause' }))
  expect(screen.getByTestId('active-tab').textContent).toBe('ask')
  expect(screen.getByTestId('ask-document').textContent).toBe('Full document')
  expect(screen.getByTestId('initial-question').textContent).toContain('Termination')
  expect(screen.getByTestId('initial-question').textContent).toContain('30 days notice')
})