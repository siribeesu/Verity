import { useState } from 'react'
import { compareDocuments } from '../api/client'

export function useCompare() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function run({ textA, fileA, textB, fileB, docType }) {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      let payload
      if (fileA || fileB) {
        const form = new FormData()
        if (fileA) form.append('documentA', fileA)
        else form.append('textA', textA)
        if (fileB) form.append('documentB', fileB)
        else form.append('textB', textB)
        form.append('docType', docType)
        payload = form
      } else {
        payload = { textA, textB, docType }
      }
      const data = await compareDocuments(payload)
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  return { result, loading, error, run }
}
