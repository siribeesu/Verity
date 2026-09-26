import { afterEach, beforeEach, expect, test, vi } from 'vitest'

const axiosMocks = vi.hoisted(() => {
  const post = vi.fn()
  return { post, create: vi.fn(() => ({ post })) }
})

vi.mock('axios', () => ({ default: { create: axiosMocks.create } }))

import { analyzeDocument, compareDocuments, lawyerPrep } from './client'

beforeEach(() => {
  axiosMocks.post.mockReset()
  axiosMocks.create.mockReturnValue({ post: axiosMocks.post })
  axiosMocks.post.mockResolvedValue({ data: { ok: true } })
})

test('analyzeDocument posts JSON with no multipart headers', async () => {
  const payload = { text: 'Agreement' }

  await expect(analyzeDocument(payload)).resolves.toEqual({ ok: true })
  expect(axiosMocks.post).toHaveBeenCalledWith('/analyze', payload, { headers: {} })
})

test('compareDocuments sets multipart headers for form data', async () => {
  const payload = new FormData()
  payload.append('documentA', new Blob(['Agreement']))

  await compareDocuments(payload)

  expect(axiosMocks.post).toHaveBeenCalledWith('/compare', payload, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
})

test('lawyerPrep wraps the analysis result in the expected request body', async () => {
  const analyzeResult = { clauses: [{ title: 'Termination' }] }

  await lawyerPrep(analyzeResult)

  expect(axiosMocks.post).toHaveBeenCalledWith('/lawyer-prep', { analyzeResult })
})