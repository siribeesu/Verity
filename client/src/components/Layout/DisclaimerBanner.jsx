import React from 'react'
import './DisclaimerBanner.css'

export default function DisclaimerBanner() {
  return (
    <div className="disclaimer-banner" role="note" aria-label="Important disclaimer">
      <span className="disclaimer-icon">ⓘ</span>
      <p>
        <strong>Not legal advice.</strong> Verity explains what your document says — it doesn't know
        your jurisdiction's law, can make mistakes, and is not a substitute for a licensed attorney.
        Always consult a lawyer before signing.
      </p>
    </div>
  )
}
