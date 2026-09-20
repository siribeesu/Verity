import React, { useState } from 'react'
import { CheckSquare, Square, CheckCheck, Copy, Check } from 'lucide-react'
import './ActionChecklist.css'

export default function ActionChecklist({ items }) {
  const [checkedState, setCheckedState] = useState({})
  const [copied, setCopied] = useState(false)

  if (!items?.length) return null

  function toggleItem(index) {
    setCheckedState((prev) => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const completedCount = items.filter((_, i) => !!checkedState[i]).length
  const progressPercent = Math.round((completedCount / items.length) * 100)

  function handleCopyChecklist() {
    const text = items
      .map((item, i) => `${checkedState[i] ? '[x]' : '[ ]'} ${item}`)
      .join('\n')
    navigator.clipboard.writeText(`Recommended Next Steps:\n\n${text}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <section className="checklist-section card animate-fade-in">
      <div className="checklist-header-row">
        <div className="checklist-title-wrap">
          <CheckCheck size={18} className="checklist-icon" />
          <h2 className="section-title">Suggested Action Checklist</h2>
          <span className="checklist-progress-pill">
            {completedCount} of {items.length} done
          </span>
        </div>

        <button
          type="button"
          className="btn btn-ghost btn-sm copy-checklist-btn"
          onClick={handleCopyChecklist}
          title="Copy checklist"
        >
          {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
          <span>{copied ? 'Copied' : 'Copy List'}</span>
        </button>
      </div>

      <div className="checklist-progress-bar-wrap">
        <div
          className="checklist-progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <ul className="checklist">
        {items.map((item, i) => {
          const isDone = !!checkedState[i]
          return (
            <li
              key={i}
              className={`checklist-item ${isDone ? 'completed' : ''}`}
              onClick={() => toggleItem(i)}
            >
              <button
                type="button"
                className="check-box-btn"
                aria-label={isDone ? 'Mark as incomplete' : 'Mark as complete'}
              >
                {isDone ? (
                  <CheckSquare size={18} className="check-box-icon checked" />
                ) : (
                  <Square size={18} className="check-box-icon unchecked" />
                )}
              </button>
              <span className="checklist-text">{item}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
