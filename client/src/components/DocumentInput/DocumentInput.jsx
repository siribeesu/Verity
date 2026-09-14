import React, { useState, useRef } from 'react'
import './DocumentInput.css'

export default function DocumentInput({
  label = 'Document',
  value,
  onChange,
  onFileChange,
  placeholder = 'Paste your legal document text here...',
  id = 'document',
}) {
  const [mode, setMode] = useState('paste') // 'paste' | 'upload'
  const [fileName, setFileName] = useState(null)
  const fileRef = useRef(null)

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setFileName(file.name)
    onFileChange?.(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return
    setFileName(file.name)
    onFileChange?.(file)
  }

  function clearFile() {
    setFileName(null)
    onFileChange?.(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="document-input">
      <div className="doc-input-header">
        <label className="doc-input-label">{label}</label>
        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === 'paste' ? 'active' : ''}`}
            onClick={() => { setMode('paste'); clearFile() }}
            type="button"
          >
            Paste text
          </button>
          <button
            className={`mode-btn ${mode === 'upload' ? 'active' : ''}`}
            onClick={() => setMode('upload')}
            type="button"
          >
            Upload file
          </button>
        </div>
      </div>

      {mode === 'paste' ? (
        <>
          <textarea
            id={id}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            spellCheck={false}
          />
          {value && (
            <p className="char-count">{value.length.toLocaleString()} characters</p>
          )}
        </>
      ) : (
        <div
          className={`upload-zone ${fileName ? 'has-file' : ''}`}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
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
            <div className="file-selected">
              <span className="file-icon">📄</span>
              <span className="file-name">{fileName}</span>
              <button
                className="btn btn-ghost"
                onClick={(e) => { e.stopPropagation(); clearFile() }}
                type="button"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="upload-prompt">
              <span className="upload-icon">⬆</span>
              <p>Drop a file here, or <strong>click to browse</strong></p>
              <p className="upload-hint">PDF, DOCX, or TXT · Max 20 MB</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
