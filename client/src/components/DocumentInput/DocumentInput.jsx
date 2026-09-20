import React, { useState, useRef } from 'react'
import { FileText, UploadCloud, File, Trash2, Clipboard, Sparkles, Check } from 'lucide-react'
import './DocumentInput.css'

export default function DocumentInput({
  label = 'Document',
  value,
  onChange,
  onFileChange,
  placeholder = 'Paste your legal document text here...',
  id = 'document',
  samples = null,
  onSelectSample = null,
}) {
  const [mode, setMode] = useState('paste') // 'paste' | 'upload'
  const [fileName, setFileName] = useState(null)
  const [fileSize, setFileSize] = useState(null)
  const [copied, setCopied] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileRef = useRef(null)

  function formatBytes(bytes) {
    if (!bytes) return ''
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setFileSize(formatBytes(file.size))
    onFileChange?.(file)
  }

  function handleDrag(e) {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    setFileName(file.name)
    setFileSize(formatBytes(file.size))
    onFileChange?.(file)
  }

  function clearFile() {
    setFileName(null)
    setFileSize(null)
    onFileChange?.(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handlePasteClipboard() {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        onChange?.(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }
    } catch {
      // Clipboard access denied or unsupported
    }
  }

  const wordCount = value ? value.trim().split(/\s+/).filter(Boolean).length : 0
  const charCount = value ? value.length : 0
  const estReadTime = Math.ceil(wordCount / 200)

  return (
    <div className="document-input">
      <div className="doc-input-header">
        <label className="doc-input-label" htmlFor={id}>
          <FileText size={15} className="doc-label-icon" />
          <span>{label}</span>
        </label>

        <div className="input-header-actions">
          {samples && samples.length > 0 && onSelectSample && (
            <div className="sample-select-wrap">
              <Sparkles size={13} className="sparkle-icon" />
              <select
                className="sample-dropdown"
                onChange={(e) => {
                  if (e.target.value) {
                    const sample = samples.find((s) => s.id === e.target.value)
                    if (sample) {
                      onSelectSample(sample)
                      setMode('paste')
                      clearFile()
                    }
                    e.target.value = ''
                  }
                }}
                defaultValue=""
                aria-label="Load a sample document"
              >
                <option value="" disabled>Try a sample document...</option>
                {samples.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mode-toggle">
            <button
              className={`mode-btn ${mode === 'paste' ? 'active' : ''}`}
              onClick={() => { setMode('paste'); clearFile() }}
              type="button"
            >
              <FileText size={13} />
              <span>Paste text</span>
            </button>
            <button
              className={`mode-btn ${mode === 'upload' ? 'active' : ''}`}
              onClick={() => setMode('upload')}
              type="button"
            >
              <UploadCloud size={13} />
              <span>Upload file</span>
            </button>
          </div>
        </div>
      </div>

      {mode === 'paste' ? (
        <div className="textarea-container">
          <textarea
            id={id}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            spellCheck={false}
            className="doc-textarea"
          />

          <div className="textarea-toolbar">
            <div className="text-stats">
              {wordCount > 0 ? (
                <>
                  <span><strong>{wordCount.toLocaleString()}</strong> words</span>
                  <span className="stats-dot">•</span>
                  <span>{charCount.toLocaleString()} chars</span>
                  <span className="stats-dot">•</span>
                  <span>~{estReadTime} min read</span>
                </>
              ) : (
                <span className="stats-empty">Ready for document text</span>
              )}
            </div>

            <div className="textarea-quick-actions">
              {navigator.clipboard && !value && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-quick"
                  onClick={handlePasteClipboard}
                  title="Paste from clipboard"
                >
                  {copied ? <Check size={13} /> : <Clipboard size={13} />}
                  <span>{copied ? 'Pasted!' : 'Paste Clipboard'}</span>
                </button>
              )}
              {value && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-quick text-muted"
                  onClick={() => onChange?.('')}
                  title="Clear document text"
                >
                  <Trash2 size={13} />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`upload-zone ${fileName ? 'has-file' : ''} ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => !fileName && fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            onChange={handleFile}
            className="sr-only"
            id={`${id}-file`}
          />
          {fileName ? (
            <div className="file-selected-card">
              <div className="file-icon-wrap">
                <File size={24} className="file-card-icon" />
              </div>
              <div className="file-details">
                <span className="file-name" title={fileName}>{fileName}</span>
                {fileSize && <span className="file-meta">{fileSize} · Ready for analysis</span>}
              </div>
              <button
                className="btn btn-ghost btn-sm file-remove-btn"
                onClick={(e) => { e.stopPropagation(); clearFile() }}
                type="button"
                title="Remove file"
              >
                <Trash2 size={14} />
                <span>Remove</span>
              </button>
            </div>
          ) : (
            <div className="upload-prompt">
              <div className="upload-icon-circle">
                <UploadCloud size={24} />
              </div>
              <p className="upload-main-text">
                Drag and drop your file here, or <span className="browse-link">browse files</span>
              </p>
              <div className="upload-badges">
                <span className="upload-badge">PDF</span>
                <span className="upload-badge">DOCX</span>
                <span className="upload-badge">TXT</span>
                <span className="upload-meta-note">Up to 20 MB</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
