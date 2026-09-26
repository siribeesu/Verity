import test, { afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { askQuestion } from './client.js'

const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
})

test('askQuestion streams deltas and reports completion metadata', async () => {
  const events = [
    { delta: 'The lease ', done: false },
    { delta: 'allows renewal.', done: false },
    { done: true, fullText: 'The lease allows renewal.', excerpt: 'The lease renews yearly.' },
  ]
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/ask')
    assert.equal(options.method, 'POST')
    assert.deepEqual(JSON.parse(options.body), {
      text: 'Lease document',
      messages: [],
      question: 'Can it renew?',
    })
    return new Response(events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join(''), {
      status: 200,
    })
  }
  const deltas = []
  let completion

  await askQuestion({
    text: 'Lease document',
    messages: [],
    question: 'Can it renew?',
    onDelta: (delta) => deltas.push(delta),
    onComplete: (result) => { completion = result },
  })

  assert.deepEqual(deltas, ['The lease ', 'allows renewal.'])
  assert.deepEqual(completion, {
    fullText: 'The lease allows renewal.',
    excerpt: 'The lease renews yearly.',
  })
})

test('askQuestion reports HTTP errors through onError', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ error: 'Document is required.' }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  })
  let reportedError

  await askQuestion({ text: '', messages: [], question: 'Question?', onError: (error) => { reportedError = error } })

  assert.equal(reportedError.message, 'Document is required.')
})

test('askQuestion reports streamed server errors through onError', async () => {
  globalThis.fetch = async () => new Response(
    `data: ${JSON.stringify({ error: 'Model unavailable.' })}\n\n`,
    { status: 200 }
  )
  let reportedError

  await askQuestion({ text: 'Document', messages: [], question: 'Question?', onError: (error) => { reportedError = error } })

  assert.equal(reportedError.message, 'Model unavailable.')
})

test('askQuestion reports network failures through onError', async () => {
  globalThis.fetch = async () => { throw new Error('Network unavailable.') }
  let reportedError

  await askQuestion({ text: 'Document', messages: [], question: 'Question?', onError: (error) => { reportedError = error } })

  assert.equal(reportedError.message, 'Network unavailable.')
})