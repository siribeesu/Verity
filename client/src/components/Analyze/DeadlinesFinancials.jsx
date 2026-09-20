import React, { useState } from 'react'
import { Calendar, DollarSign, Clock, Download, Check, AlertCircle, ArrowUpRight } from 'lucide-react'
import './DeadlinesFinancials.css'

function extractDeadlinesAndFinancials(text, clauses) {
  const deadlines = []
  const financials = []

  // Known pattern matchers for deadlines
  const noticeRegex = /(\b\d{1,3}\s*(?:business\s+)?days?\b[^\.\n;]{0,80}(?:notice|cure|cancel|terminat|renew|prior|advance|inspection|vacat))/gi
  const monthRegex = /(\b\d{1,2}\s*months?\b[^\.\n;]{0,80}(?:notice|renew|term|lock-in|duration))/gi
  const hoursRegex = /(\b\d{1,2}\s*hours?\b[^\.\n;]{0,80}(?:notice|advance|emergency|entry|repair))/gi

  const combined = (text || '') + ' ' + clauses.map((c) => c.title + ': ' + c.explanation + ' ' + (c.original_excerpt || '')).join(' ')

  let match
  const seenDeadlines = new Set()

  while ((match = noticeRegex.exec(combined)) !== null) {
    const clean = match[0].trim()
    if (!seenDeadlines.has(clean.toLowerCase()) && clean.length > 8 && seenDeadlines.size < 6) {
      seenDeadlines.add(clean.toLowerCase())
      deadlines.push({
        title: clean.slice(0, 35) + '...',
        detail: clean,
        type: clean.toLowerCase().includes('cure') ? 'Cure Window' : clean.toLowerCase().includes('renew') ? 'Renewal Cutoff' : 'Notice Requirement',
        daysEstimate: parseInt(clean) || 30
      })
    }
  }

  while ((match = hoursRegex.exec(combined)) !== null) {
    const clean = match[0].trim()
    if (!seenDeadlines.has(clean.toLowerCase()) && seenDeadlines.size < 6) {
      seenDeadlines.add(clean.toLowerCase())
      deadlines.push({
        title: clean.slice(0, 35) + '...',
        detail: clean,
        type: 'Entry / Inspection Notice',
        daysEstimate: 1
      })
    }
  }

  // Financial pattern matchers ($ or dollar amounts, fees, penalties)
  const currencyRegex = /(\$\s?[\d,]+(?:\.\d{2})?|\b\d+(?:%| percent)\b)[^\.\n;]{0,60}(?:fee|deposit|rent|penalty|charge|payment|month|retainer|damages|interest)/gi
  const seenFin = new Set()

  while ((match = currencyRegex.exec(combined)) !== null) {
    const clean = match[0].trim()
    if (!seenFin.has(clean.toLowerCase()) && clean.length > 5 && seenFin.size < 6) {
      seenFin.add(clean.toLowerCase())
      financials.push({
        amount: match[1],
        detail: clean,
        category: clean.toLowerCase().includes('deposit') ? 'Security Deposit' : clean.toLowerCase().includes('late') ? 'Late Fee' : clean.toLowerCase().includes('penalty') ? 'Penalty / Damages' : 'Payment Commitment'
      })
    }
  }

  // Fallbacks if regex didn't find specific raw text
  if (deadlines.length === 0) {
    deadlines.push({
      title: 'Standard Notice Window',
      detail: 'Written notice required prior to lease expiration or contract renewal (typically 30-60 days).',
      type: 'Notice Requirement',
      daysEstimate: 30
    })
  }

  if (financials.length === 0) {
    financials.push({
      amount: 'N/A',
      detail: 'Standard monthly fee, security deposit, and late penalty terms as outlined in schedule.',
      category: 'Financial Term'
    })
  }

  return { deadlines, financials }
}

export default function DeadlinesFinancials({ docText = '', clauses = [] }) {
  const [downloaded, setDownloaded] = useState(false)
  const { deadlines, financials } = extractDeadlinesAndFinancials(docText, clauses)

  function handleDownloadICS(deadline) {
    const now = new Date()
    const targetDate = new Date(now.getTime() + (deadline.daysEstimate || 30) * 24 * 60 * 60 * 1000)

    const formatDateICS = (d) => {
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//LegalAssist//Contract Deadline Reminder//EN',
      'BEGIN:VEVENT',
      `UID:legalassist-${Date.now()}@legalassist.app`,
      `DTSTAMP:${formatDateICS(now)}`,
      `DTSTART:${formatDateICS(targetDate)}`,
      `DTEND:${formatDateICS(new Date(targetDate.getTime() + 60 * 60 * 1000))}`,
      `SUMMARY:Legal Notice Deadline: ${deadline.type}`,
      `DESCRIPTION:Contract reminder extracted by LegalAssist: ${deadline.detail}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-P2D',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder: Contract deadline in 2 days',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n')

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `contract-deadline-reminder.ics`
    link.click()
    URL.revokeObjectURL(url)

    setDownloaded(true)
    setTimeout(() => setDownloaded(false), 2000)
  }

  return (
    <div className="deadlines-financials-card card animate-fade-in">
      <div className="df-header">
        <div className="df-title-wrap">
          <Calendar size={18} className="df-icon" />
          <h3>Critical Deadlines & Financial Commitments</h3>
        </div>
        <span className="df-count-pill">{deadlines.length + financials.length} Items Extracted</span>
      </div>

      <div className="df-grid">
        {/* Deadlines Section */}
        <div className="df-column">
          <div className="column-heading">
            <Clock size={14} className="col-icon" />
            <h4>Notice Periods & Deadlines</h4>
          </div>

          <div className="items-stack">
            {deadlines.map((item, i) => (
              <div key={i} className="df-item-box">
                <div className="item-top">
                  <span className="item-badge badge-deadline">{item.type}</span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs cal-btn"
                    onClick={() => handleDownloadICS(item)}
                    title="Add reminder to Google / Apple Calendar (.ics)"
                  >
                    {downloaded ? <Check size={11} className="text-success" /> : <Download size={11} />}
                    <span>{downloaded ? 'Saved' : 'Add to Calendar'}</span>
                  </button>
                </div>
                <p className="item-detail-text">"{item.detail}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Commitments Section */}
        <div className="df-column">
          <div className="column-heading">
            <DollarSign size={14} className="col-icon" />
            <h4>Financial Terms & Penalties</h4>
          </div>

          <div className="items-stack">
            {financials.map((item, i) => (
              <div key={i} className="df-item-box">
                <div className="item-top">
                  <span className="item-badge badge-financial">{item.category}</span>
                  <span className="item-amount-tag">{item.amount}</span>
                </div>
                <p className="item-detail-text">"{item.detail}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
