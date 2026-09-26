import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

const api = vi.hoisted(() => ({
  analyzeDocument: vi.fn(),
  compareDocuments: vi.fn(),
  askQuestion: vi.fn(),
  lawyerPrep: vi.fn(),
}))

vi.mock('../api/client', () => api)

import { useAnalyze } from './useAnalyze'
import { useAsk } from './useAsk'
import { useCompare } from './useCompare'
import { useLawyerPrep } from './useLawyerPrep'

beforeEach(() => {
  api.analyzeDocument.mockReset()
  api.compareDocuments.mockReset()
  api.askQuestion.mockReset()
  api.lawyerPrep.mockReset()
})

describe('useAnalyze', () => {
  test('submits text and stores the result', async () => {
    const resultData = { summary: 'Analysis complete.' }
    api.analyzeDocument.mockResolvedValue(resultData)
    const { result } = renderHook(() => useAnalyze())

    await act(async () => {
      await result.current.run({ text: 'Agreement', readingLevel: 'beginner', docType: 'lease' })
    })

    expect(api.analyzeDocument).toHaveBeenCalledWith({
      text: 'Agreement', readingLevel: 'beginner', docType: 'lease', jurisdiction: undefined,
    })
    expect(result.current.result).toEqual(resultData)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  test('submits uploaded files as multipart form data', async () => {
    api.analyzeDocument.mockResolvedValue({ summary: 'Uploaded analysis.' })
    const { result } = renderHook(() => useAnalyze())
    const file = new File(['Agreement text'], 'agreement.txt', { type: 'text/plain' })

    await act(async () => {
      await result.current.run({ file, readingLevel: 'informed', docType: 'lease', jurisdiction: 'CA' })
    })

    const payload = api.analyzeDocument.mock.calls[0][0]
    expect(payload).toBeInstanceOf(FormData)
    expect(payload.get('document')).toBe(file)
    expect(payload.get('jurisdiction')).toBe('CA')
  })

  test('exposes API errors and clears loading after failure', async () => {
    api.analyzeDocument.mockRejectedValue({ response: { data: { error: 'Invalid document.' } } })
    const { result } = renderHook(() => useAnalyze())

    await act(async () => {
      await result.current.run({ text: 'bad input' })
    })

    expect(result.current.error).toBe('Invalid document.')
    expect(result.current.loading).toBe(false)
  })
})

describe('useCompare', () => {
  test('submits two text documents and stores the comparison', async () => {
    const comparison = { differences: [] }
    api.compareDocuments.mockResolvedValue(comparison)
    const { result } = renderHook(() => useCompare())

    await act(async () => {
      await result.current.run({ textA: 'First document', textB: 'Second document', docType: 'lease' })
    })

    expect(api.compareDocuments).toHaveBeenCalledWith({
      textA: 'First document', textB: 'Second document', docType: 'lease',
    })
    expect(result.current.result).toEqual(comparison)
    expect(result.current.loading).toBe(false)
  })

  test('mixes a file and text in multipart comparison payloads', async () => {
    api.compareDocuments.mockResolvedValue({ differences: [] })
    const { result } = renderHook(() => useCompare())
    const file = new File(['First document'], 'first.txt', { type: 'text/plain' })

    await act(async () => {
      await result.current.run({ fileA: file, textB: 'Second document', docType: 'lease' })
    })

    const payload = api.compareDocuments.mock.calls[0][0]
    expect(payload).toBeInstanceOf(FormData)
    expect(payload.get('documentA')).toBe(file)
    expect(payload.get('textB')).toBe('Second document')
  })
})

describe('useAsk', () => {
  test('streams an answer into the conversation and clears messages', async () => {
    api.askQuestion.mockImplementation(async ({ onDelta, onComplete }) => {
      onDelta('A response ')
      onDelta('from the document.')
      onComplete({ fullText: 'A response from the document.', excerpt: 'Source excerpt.' })
    })
    const { result } = renderHook(() => useAsk('Document text'))

    await act(async () => {
      await result.current.ask('What does it say?')
    })

    expect(api.askQuestion).toHaveBeenCalledWith(expect.objectContaining({
      text: 'Document text',
      question: 'What does it say?',
      messages: [],
    }))
    expect(result.current.messages).toEqual([
      { role: 'user', content: 'What does it say?' },
      { role: 'assistant', content: 'A response from the document.', excerpt: 'Source excerpt.', streaming: false },
    ])
    expect(result.current.streaming).toBe(false)

    act(() => result.current.clearMessages())
    expect(result.current.messages).toEqual([])
  })

  test('ignores empty questions and records stream errors', async () => {
    const { result } = renderHook(() => useAsk('Document text'))

    await act(async () => {
      await result.current.ask('  ')
    })
    expect(api.askQuestion).not.toHaveBeenCalled()

    api.askQuestion.mockImplementation(async ({ onError }) => onError(new Error('Stream failed.')))
    await act(async () => {
      await result.current.ask('Question?')
    })

    expect(result.current.error).toBe('Stream failed.')
    expect(result.current.messages[1]).toMatchObject({ isError: true, streaming: false })
    expect(result.current.streaming).toBe(false)
  })
})

describe('useLawyerPrep', () => {
  test('submits analysis and exposes preparation questions', async () => {
    const prep = { questions: [{ question: 'Ask about notice.' }] }
    api.lawyerPrep.mockResolvedValue(prep)
    const { result } = renderHook(() => useLawyerPrep())

    await act(async () => {
      await result.current.run({ clauses: [{ risk: 'high' }] })
    })

    expect(api.lawyerPrep).toHaveBeenCalledWith({ clauses: [{ risk: 'high' }] })
    expect(result.current.result).toEqual(prep)
    expect(result.current.loading).toBe(false)
  })

  test('surfaces request errors', async () => {
    api.lawyerPrep.mockRejectedValue(new Error('Preparation failed.'))
    const { result } = renderHook(() => useLawyerPrep())

    await act(async () => {
      await result.current.run({ clauses: [{ risk: 'high' }] })
    })

    expect(result.current.error).toBe('Preparation failed.')
    expect(result.current.loading).toBe(false)
  })
})