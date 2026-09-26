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

