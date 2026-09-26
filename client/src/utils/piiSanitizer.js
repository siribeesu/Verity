/**
 * Client-Side PII Sanitizer / Privacy Shield
 * Masks sensitive personal identifying data strictly in the browser before sending to AI servers.
 */

export function sanitizePII(text) {
  if (!text) return { sanitizedText: '', redactionsCount: 0 }

  let count = 0
  let sanitized = text

  // 1. Social Security Numbers (SSN): 000-00-0000 or 000 00 0000
  const ssnRegex = /\b\d{3}[-\s]\d{2}[-\s]\d{4}\b/g
  sanitized = sanitized.replace(ssnRegex, () => {
    count++
    return '[REDACTED SSN]'
  })

  // 2. Credit Card / Account numbers (16 digits separated by spaces or dashes)
  const ccRegex = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g
  sanitized = sanitized.replace(ccRegex, () => {
    count++
    return '[REDACTED ACCOUNT/CARD]'
  })

  // 3. Email addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g
  sanitized = sanitized.replace(emailRegex, () => {
    count++
    return '[REDACTED EMAIL]'
  })

  // 4. US/International Phone Numbers
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?[2-9]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g
  sanitized = sanitized.replace(phoneRegex, () => {
    count++
    return '[REDACTED PHONE]'
  })

  // 5. Script and dangerous executable HTML tags
  const scriptRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi
  sanitized = sanitized.replace(scriptRegex, () => {
    count++
    return '[REDACTED SCRIPT]'
  })

  return {
    sanitizedText: sanitized,
    redactionsCount: count
  }
}
