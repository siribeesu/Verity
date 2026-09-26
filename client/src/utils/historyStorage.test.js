import test, { afterEach, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import {
  clearAllHistory,
  deleteAnalysisFromHistory,
  getAnalysisHistory,
  saveAnalysisToHistory,
} from './historyStorage.js'

const STORAGE_KEY = 'legalassist_document_history'
let previousStorage

function createStorage() {
  const values = new Map()
  return {
    getItem(key) {
      return values.get(key) ?? null
    },
    setItem(key, value) {
      values.set(key, value)
    },
    removeItem(key) {
      values.delete(key)
    },
  }
}

beforeEach(() => {
  previousStorage = globalThis.sessionStorage
  globalThis.sessionStorage = createStorage()
})

afterEach(() => {
  if (previousStorage === undefined) delete globalThis.sessionStorage
  else globalThis.sessionStorage = previousStorage
})

test('getAnalysisHistory returns an empty list when storage is empty or invalid', () => {
  assert.deepEqual(getAnalysisHistory(), [])
  globalThis.sessionStorage.setItem(STORAGE_KEY, '{invalid json')
  assert.deepEqual(getAnalysisHistory(), [])
})

test('saveAnalysisToHistory applies defaults and derives clause counts', () => {
  const result = {
    summary: 'A summary of the agreement.',
    clauses: [{ risk: 'high' }, { risk: 'medium' }, { risk: 'high' }],
  }

  const saved = saveAnalysisToHistory('', '', 'Agreement text', result)

  assert.equal(saved.title, 'A summary of the agreement....')
  assert.equal(saved.docType, 'general')
  assert.equal(saved.clauseCount, 3)
  assert.equal(saved.highRiskCount, 2)
  assert.deepEqual(getAnalysisHistory(), [saved])
})

test('saveAnalysisToHistory replaces duplicate documents and keeps at most ten entries', () => {
  for (let index = 0; index < 11; index++) {
    saveAnalysisToHistory(`Document ${index}`, 'general', `Text ${index}`, { summary: `Summary ${index}` })
  }
  const replacement = saveAnalysisToHistory('Replacement', 'lease', 'Text 10', { summary: 'Latest' })
  const history = getAnalysisHistory()

  assert.equal(history.length, 10)
  assert.equal(history[0].id, replacement.id)
  assert.equal(history[0].title, 'Replacement')
  assert.equal(history.filter((item) => item.docText === 'Text 10').length, 1)
})

test('deleteAnalysisFromHistory removes only the matching entry', () => {
  const first = saveAnalysisToHistory('First', 'general', 'First text', {})
  saveAnalysisToHistory('Second', 'general', 'Second text', {})

  const remaining = deleteAnalysisFromHistory(first.id)

  assert.equal(remaining.length, 1)
  assert.equal(remaining[0].title, 'Second')
  assert.deepEqual(getAnalysisHistory(), remaining)
})

test('clearAllHistory removes saved analyses', () => {
  saveAnalysisToHistory('First', 'general', 'First text', {})

  clearAllHistory()

  assert.deepEqual(getAnalysisHistory(), [])
})