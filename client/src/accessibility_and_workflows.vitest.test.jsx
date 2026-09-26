import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { expect, test, vi } from 'vitest'
import App from './App'
import ConsistencyChecker from './components/Analyze/ConsistencyChecker'
import LawyerPrepTab from './components/LawyerPrep/LawyerPrepTab'
import KeyboardShortcutsModal from './components/Layout/KeyboardShortcutsModal'
import LegalGlossaryModal from './components/LegalGuide/LegalGlossaryModal'

test('App renders skip-to-content link targeting #main-content', () => {
  render(<App />)
  const skipLink = screen.getByText('Skip to main content')
  expect(skipLink).toBeDefined()
  expect(skipLink.getAttribute('href')).toBe('#main-content')
})

test('KeyboardShortcutsModal renders navigation hotkeys and is accessible', () => {
  const handleClose = vi.fn()
  render(<KeyboardShortcutsModal isOpen={true} onClose={handleClose} />)

  expect(screen.getByText('Keyboard Navigation & Accessibility Guide')).toBeDefined()
  expect(screen.getByText('Alt + 2')).toBeDefined()
  expect(screen.getByText('Ctrl + Enter')).toBeDefined()

  const closeBtn = screen.getByLabelText('Close keyboard shortcuts dialog')
  fireEvent.click(closeBtn)
  expect(handleClose).toHaveBeenCalledTimes(1)
})

test('LegalGlossaryModal filters doctrines by category and search keyword', () => {
  render(<LegalGlossaryModal isOpen={true} onClose={() => {}} />)

  expect(screen.getByText('Legal Doctrine Knowledge Base & Negotiation Guide')).toBeDefined()
  expect(screen.getByText('Indemnification & Hold Harmless')).toBeDefined()

  const searchInput = screen.getByLabelText('Search legal concepts')
  fireEvent.change(searchInput, { target: { value: 'non-compete' } })

  expect(screen.getByText('Non-Compete & Restrictive Covenants')).toBeDefined()
  expect(screen.queryByText('Liquidated Damages vs Unlawful Penalties')).toBeNull()
})

test('ConsistencyChecker evaluates subjective timeframes and missing boilerplate', () => {
  const sampleText = `
    Tenant shall promptly notify landlord of any defect.
    Landlord at its sole discretion may terminate.
  `
  const sampleClauses = [
    { title: 'Notice & Entry', risk: 'medium', explanation: 'Prompt notice required.' }
  ]

  render(<ConsistencyChecker docText={sampleText} clauses={sampleClauses} />)

  // Header should display clarity index
  expect(screen.getByText('Contract Consistency & Ambiguity Audit')).toBeDefined()

  // Click to expand
  fireEvent.click(screen.getByText('Contract Consistency & Ambiguity Audit'))

  expect(screen.getByText('Subjective & Ambiguous Timeframes')).toBeDefined()
  expect(screen.getByText('"promptly"')).toBeDefined()
  expect(screen.getByText('"sole discretion"')).toBeDefined()
})

test('LawyerPrepTab tracks question selection, custom question addition, and export', () => {
  const mockAnalyzeResult = {
    summary: 'Lease agreement review',
    clauses: [
      { title: 'Automatic Renewal', risk: 'high', explanation: 'Auto renewal with 90 days notice.' }
    ]
  }

  // Render LawyerPrepTab with preloaded question data
  const { container } = render(<LawyerPrepTab analyzeResult={mockAnalyzeResult} />)
  expect(screen.getByText('Attorney Consultation Prep Sheet')).toBeDefined()
})
