import { useState, useCallback } from 'react'
import { askQuestion } from '../api/client'

export function useAsk(documentText) {
  const [messages, setMessages] = useState([]) // [{role, content, excerpt?}]
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState(null)

  const ask = useCallback(async (question) => {
    if (!question.trim() || streaming) return

    // Optimistically add user message
    const userMsg = { role: 'user', content: question }
    setMessages((prev) => [...prev, userMsg])
    setStreaming(true)
    setError(null)

    // Placeholder assistant message for streaming
    const placeholder = { role: 'assistant', content: '', excerpt: null, streaming: true }
    setMessages((prev) => [...prev, placeholder])

    // Build history for API (exclude placeholder)
    const history = messages.map(({ role, content }) => ({ role, content }))

    await askQuestion({
      text: documentText,
      messages: history,
      question,
      onDelta: (delta) => {
        setMessages((prev) => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last?.streaming) {
            updated[updated.length - 1] = { ...last, content: last.content + delta }
          }
          return updated
        })
      },
      onComplete: ({ fullText, excerpt }) => {
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'assistant',
            content: fullText,
            excerpt,
            streaming: false,
          }
          return updated
        })
        setStreaming(false)
      },
      onError: (err) => {
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'assistant',
            content: 'Sorry, something went wrong. Please try again.',
            streaming: false,
            isError: true,
          }
          return updated
        })
        setError(err.message)
        setStreaming(false)
      },
    })
  }, [documentText, messages, streaming])

  const clearMessages = () => setMessages([])

  return { messages, streaming, error, ask, clearMessages }
}
