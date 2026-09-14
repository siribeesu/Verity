import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

/** POST /api/analyze — text or FormData with file */
export async function analyzeDocument(payload) {
  const { data } = await api.post('/analyze', payload, {
    headers: payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
  })
  return data
}

/** POST /api/compare — text or FormData */
export async function compareDocuments(payload) {
  const { data } = await api.post('/compare', payload, {
    headers: payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
  })
  return data
}

/** POST /api/lawyer-prep */
export async function lawyerPrep(analyzeResult) {
  const { data } = await api.post('/lawyer-prep', { analyzeResult })
  return data
}

/**
 * POST /api/ask — SSE streaming
 * Calls onDelta(text) for each chunk, onComplete({ fullText, excerpt }) when done, onError(err)
 */
export async function askQuestion({ text, messages, question, onDelta, onComplete, onError }) {
  try {
    const response = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, messages, question }),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || 'Request failed')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() // keep incomplete line

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const event = JSON.parse(line.slice(6))
            if (event.error) {
              onError?.(new Error(event.error))
              return
            }
            if (event.done) {
              onComplete?.({ fullText: event.fullText, excerpt: event.excerpt })
            } else if (event.delta) {
              onDelta?.(event.delta)
            }
          } catch {
            // Skip malformed events
          }
        }
      }
    }
  } catch (err) {
    onError?.(err)
  }
}
