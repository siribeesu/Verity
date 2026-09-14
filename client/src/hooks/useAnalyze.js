import { useState } from 'react'
import { analyzeDocument } from '../api/client'

export function useAnalyze() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function run({ text, file, readingLevel, docType, jurisdiction }) {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      let payload
      if (file) {
        const form = new FormData()
        form.append('document', file)
        form.append('readingLevel', readingLevel)
        form.append('docType', docType)
        if (jurisdiction) form.append('jurisdiction', jurisdiction)
        payload = form
      } else {
        payload = { text, readingLevel, docType, jurisdiction }
      }
      const data = await analyzeDocument(payload)
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  return { result, loading, error, run, setResult }
}
