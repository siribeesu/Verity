import { useState } from 'react'
import { lawyerPrep } from '../api/client'

export function useLawyerPrep() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function run(analyzeResult) {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await lawyerPrep(analyzeResult)
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  return { result, loading, error, run }
}
