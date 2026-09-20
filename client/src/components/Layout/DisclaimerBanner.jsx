import React, { useState } from 'react'
import { Info, X } from 'lucide-react'
import './DisclaimerBanner.css'

export default function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="disclaimer-banner" role="note" aria-label="Important legal disclaimer">
      <div className="disclaimer-content">
        <Info size={15} className="disclaimer-icon" />
        <p>
          <strong>Informational clarity only:</strong> LegalAssist explains document text and cites verbatim source excerpts. It does not provide legal advice, is not jurisdiction-certified, and is not a substitute for a licensed attorney.
        </p>
      </div>
      <button
        className="disclaimer-close-btn"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss disclaimer"
        title="Dismiss notice"
      >
        <X size={14} />
      </button>
    </div>
  )
}
