import test from 'node:test'
import assert from 'node:assert/strict'
import { sanitizePII } from './piiSanitizer.js'

test('sanitizePII returns empty output for empty input', () => {
  assert.deepEqual(sanitizePII(''), { sanitizedText: '', redactionsCount: 0 })
})

test('sanitizePII redacts SSNs, card numbers, email addresses, and phone numbers', () => {
  const result = sanitizePII(
    'SSN 123-45-6789, card 4111 1111 1111 1111, email alex@example.com, phone (212) 555-0199.'
  )

  assert.equal(
    result.sanitizedText,
    'SSN [REDACTED SSN], card [REDACTED ACCOUNT/CARD], email [REDACTED EMAIL], phone [REDACTED PHONE].'
  )
  assert.equal(result.redactionsCount, 4)
})

test('sanitizePII preserves text without recognized personal information', () => {
  const text = 'The agreement begins on the first day of the month.'

  assert.deepEqual(sanitizePII(text), { sanitizedText: text, redactionsCount: 0 })
})

test('sanitizePII strips executable script tags to prevent XSS and prompt injection', () => {
  const text = 'Clause: Comply with terms. <script>alert(1)</script>'
  const result = sanitizePII(text)
  assert.equal(result.redactionsCount, 1)
  assert.match(result.sanitizedText, /\[REDACTED SCRIPT\]/)
  assert.doesNotMatch(result.sanitizedText, /<script>/)
})