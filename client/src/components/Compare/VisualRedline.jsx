import React, { useState } from 'react'
import { Eye, Columns, AlignLeft, Check, Copy } from 'lucide-react'
import './VisualRedline.css'

// Fast word-level diff computation
function computeWordDiff(str1 = '', str2 = '') {
  const words1 = str1.split(/(\s+)/).filter(Boolean)
  const words2 = str2.split(/(\s+)/).filter(Boolean)

  const diff = []
  let i = 0
  let j = 0

  while (i < words1.length || j < words2.length) {
    if (i < words1.length && j < words2.length && words1[i] === words2[j]) {
      diff.push({ type: 'same', value: words1[i] })
      i++
      j++
    } else {
      // Look ahead up to 10 words to find sync point
      let foundJ = -1
      let foundI = -1
      for (let look = 1; look < 12; look++) {
        if (j + look < words2.length && words1[i] === words2[j + look]) {
          foundJ = j + look
          break
        }
        if (i + look < words1.length && words1[i + look] === words2[j]) {
          foundI = i + look
          break
        }
      }

      if (foundJ !== -1) {
        while (j < foundJ) {
          diff.push({ type: 'added', value: words2[j] })
          j++
        }
      } else if (foundI !== -1) {
        while (i < foundI) {
          diff.push({ type: 'removed', value: words1[i] })
          i++
        }
      } else {
        if (i < words1.length) {
          diff.push({ type: 'removed', value: words1[i] })
          i++
        }
        if (j < words2.length) {
          diff.push({ type: 'added', value: words2[j] })
          j++
        }
      }
    }
  }
  return diff
}

export default function VisualRedline({ textA = '', textB = '' }) {
  const [viewMode, setViewMode] = useState('inline') // 'inline' | 'split'
  const [copied, setCopied] = useState(false)

  const diffWords = computeWordDiff(textA, textB)
  const addedCount = diffWords.filter((w) => w.type === 'added' && w.value.trim()).length
  const removedCount = diffWords.filter((w) => w.type === 'removed' && w.value.trim()).length

  return (
    <div className="visual-redline-card card animate-fade-in">
      <div className="redline-header">
        <div className="redline-title-group">
          <Eye size={18} className="text-primary" />
          <div>
            <h3>Visual Redline / Track-Changes Diff</h3>
            <span className="redline-counts">
              <span className="count-added">+{addedCount} additions</span>
              <span>•</span>
              <span className="count-removed">-{removedCount} deletions</span>
            </span>
          </div>
        </div>

        <div className="redline-view-controls">
          <button
            type="button"
            className={`btn btn-xs ${viewMode === 'inline' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('inline')}
          >
            <AlignLeft size={12} />
            <span>Inline Redline</span>
          </button>
          <button
            type="button"
            className={`btn btn-xs ${viewMode === 'split' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('split')}
          >
            <Columns size={12} />
            <span>Side-by-Side</span>
          </button>
        </div>
      </div>

      {viewMode === 'inline' ? (
        <div className="redline-content-inline">
          {diffWords.map((item, i) => {
            if (item.type === 'added') {
              return <ins key={i} className="diff-ins">{item.value}</ins>
            }
            if (item.type === 'removed') {
              return <del key={i} className="diff-del">{item.value}</del>
            }
            return <span key={i}>{item.value}</span>
          })}
        </div>
      ) : (
        <div className="redline-split-grid">
          <div className="split-column original-col">
            <div className="split-col-header">Original (Document A)</div>
            <div className="split-col-body">
              {diffWords.map((item, i) => {
                if (item.type === 'added') return null
                if (item.type === 'removed') {
                  return <del key={i} className="diff-del">{item.value}</del>
                }
                return <span key={i}>{item.value}</span>
              })}
            </div>
          </div>
          <div className="split-column revised-col">
            <div className="split-col-header">Revised (Document B)</div>
            <div className="split-col-body">
              {diffWords.map((item, i) => {
                if (item.type === 'removed') return null
                if (item.type === 'added') {
                  return <ins key={i} className="diff-ins">{item.value}</ins>
                }
                return <span key={i}>{item.value}</span>
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
