const STORAGE_KEY = 'legalassist_document_history'
const MAX_HISTORY = 10

export function saveAnalysisToHistory(title, docType, docText, result) {
  try {
    const existing = getAnalysisHistory()
    const newEntry = {
      id: 'doc_' + Date.now(),
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    return newEntry
  } catch (err) {
    console.warn('Failed to save to localStorage', err)
    return null
  }
}

export function getAnalysisHistory() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function deleteAnalysisFromHistory(id) {
  try {
    const existing = getAnalysisHistory()
    const updated = existing.filter((item) => item.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    return updated
  } catch {
    return []
  }
}

export function clearAllHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}
