const STORAGE_KEY = 'legalassist_document_history'
const COMPARISON_STORAGE_KEY = 'legalassist_comparison_history'
const MAX_HISTORY = 10

function getStorage() {
  try {
    if (typeof globalThis.localStorage !== 'undefined' && globalThis.localStorage) {
      return globalThis.localStorage
    }
  } catch {}
  return globalThis.sessionStorage
}

export function saveAnalysisToHistory(title, docType, docText, result) {
  try {
    const storage = getStorage()
    const existing = getAnalysisHistory()
    const newEntry = {
      id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      title: title || (result?.summary ? result.summary.slice(0, 45) + '...' : 'Legal Document Analysis'),
      docType: docType || 'general',
      date: new Date().toISOString(),
      docText,
      result,
      clauseCount: result?.clauses?.length || 0,
      highRiskCount: result?.clauses?.filter((c) => c.risk === 'high').length || 0,
    }

    // Filter out duplicates with identical text
    const filtered = existing.filter((item) => item.docText !== docText)
    const updated = [newEntry, ...filtered].slice(0, MAX_HISTORY)
    storage.setItem(STORAGE_KEY, JSON.stringify(updated))
    return newEntry
  } catch (err) {
    console.warn('Failed to save to storage', err)
    return null
  }
}

export function getAnalysisHistory() {
  try {
    const storage = getStorage()
    const data = storage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function deleteAnalysisFromHistory(id) {
  try {
    const storage = getStorage()
    const existing = getAnalysisHistory()
    const updated = existing.filter((item) => item.id !== id)
    storage.setItem(STORAGE_KEY, JSON.stringify(updated))
    return updated
  } catch {
    return []
  }
}

export function clearAllHistory() {
  try {
    const storage = getStorage()
    storage.removeItem(STORAGE_KEY)
  } catch {}
}

export function saveComparisonToHistory(title, docType, textA, textB, result) {
  try {
    const storage = getStorage()
    const existing = getComparisonHistory()
    const newEntry = {
      id: `comp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      title: title || (result?.overview ? result.overview.slice(0, 45) + '...' : 'Contract Comparison'),
      docType: docType || 'general',
      date: new Date().toISOString(),
      textA,
      textB,
      result,
      differencesCount: result?.differences?.length || 0,
    }
    const updated = [newEntry, ...existing].slice(0, MAX_HISTORY)
    storage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(updated))
    return newEntry
  } catch (err) {
    console.warn('Failed to save comparison', err)
    return null
  }
}

export function getComparisonHistory() {
  try {
    const storage = getStorage()
    const data = storage.getItem(COMPARISON_STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function deleteComparisonFromHistory(id) {
  try {
    const storage = getStorage()
    const existing = getComparisonHistory()
    const updated = existing.filter((item) => item.id !== id)
    storage.setItem(COMPARISON_STORAGE_KEY, JSON.stringify(updated))
    return updated
  } catch {
    return []
  }
}

export function purgeAllUserData() {
  try {
    const storages = [globalThis.localStorage, globalThis.sessionStorage].filter(Boolean)
    for (const s of storages) {
      s.removeItem(STORAGE_KEY)
      s.removeItem(COMPARISON_STORAGE_KEY)
    }
    return true
  } catch {
    return false
  }
}

export function exportAnalysisToJson(analysis, filename = 'legalassist-analysis.json') {
  const jsonStr = JSON.stringify(analysis, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportAnalysisToMarkdown(analysis, filename = 'legalassist-report.md') {
  let md = `# LegalAssist Contract Analysis Report\nGenerated: ${new Date().toLocaleDateString()}\n\n`
  md += `## Document Summary\n${analysis.summary || 'N/A'}\n\n`
  md += `## Analyzed Clauses (${analysis.clauses?.length || 0})\n\n`
  for (const c of analysis.clauses || []) {
    md += `### [${(c.risk || 'low').toUpperCase()} RISK] ${c.title || 'Untitled'}\n`
    md += `* **Category**: ${c.category || 'General'}\n`
    if (c.section_ref) md += `* **Reference**: ${c.section_ref}\n`
    md += `* **Explanation**: ${c.explanation || ''}\n`
    md += `* **Excerpt**: "${c.original_excerpt || ''}"\n`
    md += `* **Risk Note**: ${c.risk_reason || ''}\n\n`
  }
  if (analysis.action_items?.length) {
    md += `## Recommended Action Checklist\n`
    for (const item of analysis.action_items) {
      md += `- [ ] ${item}\n`
    }
  }
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function exportAnalysisToWord(analysis, filename = 'legalassist-report.doc') {
  let docContent = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head>
    <meta charset='utf-8'>
    <title>LegalAssist Clarity Report</title>
    <style>
      body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; color: #1e293b; line-height: 1.5; }
      h1 { color: #0f172a; font-size: 20pt; border-bottom: 2px solid #2563eb; padding-bottom: 6px; }
      h2 { color: #1e293b; font-size: 14pt; margin-top: 18pt; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
      .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 9pt; }
      .risk-high { background-color: #fee2e2; color: #991b1b; }
      .risk-medium { background-color: #fef3c7; color: #92400e; }
      .risk-low { background-color: #dcfce7; color: #166534; }
      .clause-card { border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 12px; background: #f8fafc; }
      .excerpt { background: #ffffff; border-left: 3px solid #2563eb; padding: 6px 12px; font-style: italic; color: #334155; margin: 8px 0; }
    </style>
  </head>
  <body>
    <h1>LegalAssist Contract Clarity Report</h1>
    <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
    <h2>Executive Summary</h2>
    <p>${analysis.summary || 'N/A'}</p>
    <h2>Clause Analysis & Risk Flags (${analysis.clauses?.length || 0})</h2>`

  for (const c of analysis.clauses || []) {
    const risk = c.risk || 'low'
    docContent += `
    <div class='clause-card'>
      <h3>${c.title || 'Untitled'} <span class='badge risk-${risk}'>${risk.toUpperCase()} RISK</span></h3>
      <p><strong>Category:</strong> ${c.category || 'General'}${c.section_ref ? ` | <strong>Reference:</strong> ${c.section_ref}` : ''}</p>
      <p><strong>Explanation:</strong> ${c.explanation || ''}</p>
      <div class='excerpt'>&ldquo;${c.original_excerpt || ''}&rdquo;</div>
      <p><strong>Risk Note:</strong> ${c.risk_reason || ''}</p>
    </div>`
  }

  if (analysis.action_items?.length) {
    docContent += `<h2>Action Checklist & Recommendations</h2><ul>`
    for (const item of analysis.action_items) {
      docContent += `<li><strong>[ ]</strong> ${item}</li>`
    }
    docContent += `</ul>`
  }

  docContent += `
    <hr style='margin-top: 24pt;'>
    <p style='font-size: 9pt; color: #64748b;'><em>Notice: LegalAssist is an informational clarity tool, not a licensed law firm. Always consult a qualified attorney for legal determinations.</em></p>
  </body></html>`

  const blob = new Blob([docContent], { type: 'application/msword;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

