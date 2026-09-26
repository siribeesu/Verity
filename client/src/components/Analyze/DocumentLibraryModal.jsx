import React, { useState, useEffect } from 'react'
import {
  FolderArchive,
  Search,
  Trash2,
  Download,
  X,
  FileText,
  AlertTriangle,
  Clock,
  Layers,
  Sparkles,
  RefreshCw
} from 'lucide-react'
import './DocumentLibraryModal.css'

export default function DocumentLibraryModal({ isOpen, onClose, onLoadDocument }) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState(null)
  const [loadingId, setLoadingId] = useState(null)

  useEffect(() => {
    if (isOpen) {
      fetchDocuments()
    }
  }, [isOpen])

  async function fetchDocuments() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/documents')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setDocuments(data.documents || [])
    } catch (err) {
      setError('Could not load contract library. ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleLoad(docSummary) {
    setLoadingId(docSummary.id)
    try {
      // Fetch full document with complete text and analysis result
      const res = await fetch(`/api/documents/${docSummary.id}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      if (data.document) {
        onLoadDocument(data.document)
        onClose()
      }
    } catch (err) {
      alert('Failed to load contract: ' + err.message)
    } finally {
      setLoadingId(null)
    }
  }

  async function handleDelete(e, id) {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to remove this contract from the persistent library?')) return
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id))
      }
    } catch (err) {
      alert('Failed to delete contract: ' + err.message)
    }
  }

  if (!isOpen) return null

  const filtered = documents.filter((d) => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    return (
      d.title?.toLowerCase().includes(term) ||
      d.docType?.toLowerCase().includes(term) ||
      d.jurisdiction?.toLowerCase().includes(term)
    )
  })

  return (
    <div
      className="library-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="library-modal-title"
    >
      <div className="library-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="library-modal-header">
          <div className="library-header-title">
            <FolderArchive size={20} className="library-icon" />
            <h2 id="library-modal-title">Contract Library & Version History</h2>
            <span className="library-count-badge">{documents.length} Saved</span>
          </div>
          <div className="library-header-actions">
            <button
              type="button"
              className="btn btn-ghost btn-xs refresh-library-btn"
              onClick={fetchDocuments}
              title="Refresh contract list"
            >
              <RefreshCw size={13} className={loading ? 'spinning' : ''} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm close-library-btn"
              onClick={onClose}
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="library-search-bar">
          <Search size={15} className="library-search-icon" />
          <input
            type="text"
            placeholder="Search saved contracts by title, type, or jurisdiction..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="library-modal-body">
          {error && <div className="library-error-banner">{error}</div>}

          {loading && documents.length === 0 && (
            <div className="library-empty-state">
              <div className="loading-spinner-wrap">
                <span className="spinner loading-md" />
              </div>
              <p>Accessing persistent contract storage...</p>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="library-empty-state">
              <FileText size={32} className="text-muted" />
              <p>
                {searchTerm ? 'No contracts match your search filter.' : 'No contracts in library yet.'}
              </p>
              <span className="library-hint">
                Analyze any agreement in the workspace and click "Save to Library" to store it with automatic version tracking.
              </span>
            </div>
          )}

          {filtered.length > 0 && (
            <div className="library-list">
              {filtered.map((doc) => (
                <div key={doc.id} className="library-item-card" onClick={() => handleLoad(doc)}>
                  <div className="library-item-left">
                    <div className="library-item-topline">
                      <h4 className="library-item-title">{doc.title}</h4>
                      <span className="version-pill">v{doc.version || 1}</span>
                      <span className="doc-type-pill">{(doc.docType || 'general').toUpperCase()}</span>
                      {doc.jurisdiction && (
                        <span className="jurisdiction-pill">{doc.jurisdiction}</span>
                      )}
                    </div>
                    <div className="library-item-metrics">
                      <span className="metric-tag">
                        <Layers size={11} /> {doc.clauseCount || 0} Clauses
                      </span>
                      {doc.highRiskCount > 0 ? (
                        <span className="metric-tag high-risk">
                          <AlertTriangle size={11} /> {doc.highRiskCount} High Risk
                        </span>
                      ) : (
                        <span className="metric-tag low-risk">
                          <Sparkles size={11} /> Low Exposure
                        </span>
                      )}
                      <span className="metric-tag date">
                        <Clock size={11} /> {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="library-item-actions">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm load-workspace-btn"
                      onClick={() => handleLoad(doc)}
                      disabled={loadingId === doc.id}
                      title="Load into workspace for analysis and Q&A"
                    >
                      <Download size={13} />
                      <span>{loadingId === doc.id ? 'Loading...' : 'Load'}</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm delete-contract-btn"
                      onClick={(e) => handleDelete(e, doc.id)}
                      title="Permanently remove contract from library"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
