import React, { useState } from 'react'
import {
  BookOpen,
  Search,
  X,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  ExternalLink,
  Scale
} from 'lucide-react'
import './LegalGlossaryModal.css'

export const LEGAL_DOCTRINES = [
  {
    id: 'indemnity',
    title: 'Indemnification & Hold Harmless',
    category: 'Risk & Liability',
    plainMeaning:
      'A promise where one party agrees to pay for the legal costs, lawsuits, or damages suffered by the other party if something goes wrong.',
    whyItMatters:
      'Unilateral (one-way) indemnity can make you financially responsible for the other party’s legal defense and lawsuits, even for claims you didn’t cause.',
    redFlags: [
      'Indemnifying the other party against "all claims, including their own negligence".',
      'One-sided obligation where you indemnify them, but they never indemnify you.',
      'Requirement to pay their legal fees up front before any judgment is made.'
    ],
    balancedStandard:
      'Indemnity must be strictly mutual, limited to direct third-party claims arising solely from gross negligence, willful misconduct, or material breach of contract.',
    attorneyQuestions: [
      'Is this indemnity clause mutual or unilateral under local state law?',
      'Does my commercial general liability (CGL) or renter’s insurance cover this indemnity obligation?'
    ]
  },
  {
    id: 'liability-cap',
    title: 'Limitation of Liability & Damage Waivers',
    category: 'Financial Exposure',
    plainMeaning:
      'Sets a hard ceiling on the maximum dollar amount one party can recover from the other in a breach or dispute.',
    whyItMatters:
      'Without an explicit cap, damages could be unlimited. Conversely, if their liability is capped at $100 while yours is unlimited, you carry all the financial risk.',
    redFlags: [
      'Uncapped liability for you while the counterparty is capped at nominal amounts (e.g., $100 or fees paid).',
      'Total waiver of consequential damages that guts your ability to recover foreseeable losses.',
      'Exclusion of liability for gross negligence or data breach.'
    ],
    balancedStandard:
      'Mutual aggregate liability cap equal to total fees paid/payable under the contract in the preceding 12 months, with standard carve-outs for confidentiality and gross negligence.',
    attorneyQuestions: [
      'Does the liability cap protect both parties equally?',
      'Are there critical exceptions (carve-outs) for confidentiality, IP infringement, or gross negligence?'
    ]
  },
  {
    id: 'auto-renewal',
    title: 'Automatic Renewal ("Evergreen") Clause',
    category: 'Contract Term',
    plainMeaning:
      'A term stating that the agreement automatically renews for another full cycle unless you provide written cancellation notice by a strict deadline.',
    whyItMatters:
      'Miss the notice window (often 60–90 days before expiration), and you are locked in for another full year with no right to cancel early without penalty.',
    redFlags: [
      'Narrow notification window (e.g. "between 90 and 60 days before termination").',
      'Automatic price escalation upon renewal without prior written confirmation.',
      'Renewal into multi-year commitments instead of month-to-month.'
    ],
    balancedStandard:
      'Upon term expiration, the agreement should either convert to month-to-month with 30 days notice to cancel, or require affirmative written mutual consent to renew.',
    attorneyQuestions: [
      'Does this jurisdiction have state consumer protection statutes regulating automatic evergreen renewals?',
      'What exact method of written notice (certified mail vs email) is legally valid to stop renewal?'
    ]
  },
  {
    id: 'termination',
    title: 'Termination for Convenience vs For Cause',
    category: 'Exit Rights',
    plainMeaning:
      'Defines how and when either party can end the relationship. "Cause" requires a serious breach; "convenience" allows exit at will without needing a reason.',
    whyItMatters:
      'If the other party can fire you or cancel for convenience on 7 days notice, but you have no right to terminate, they hold complete leverage over your business or lease.',
    redFlags: [
      'Asymmetric exit rights: Counterparty can terminate at will, but you cannot terminate without proving incurable breach.',
      'Zero right-to-cure period before immediate termination and forfeiture of deposits.',
      'Draconian early termination fees or acceleration of all remaining contract payments.'
    ],
    balancedStandard:
      'Either party may terminate for convenience with 30–60 days advance written notice, or for material breach with a mandatory 30-day notice and right-to-cure period.',
    attorneyQuestions: [
      'Are accrued payments and work-in-progress compensable if terminated for convenience?',
      'Is there an unambiguous 30-day right-to-cure period for alleged breaches?'
    ]
  },
  {
    id: 'liquidated-damages',
    title: 'Liquidated Damages vs Unlawful Penalties',
    category: 'Remedies',
    plainMeaning:
      'A fixed dollar amount agreed in advance that one party must pay if a specific violation occurs (e.g., $200 per day of delay).',
    whyItMatters:
      'Courts enforce liquidated damages only if they represent a reasonable pre-estimate of actual harm. Disproportionate amounts are illegal punitive penalties.',
    redFlags: [
      'Absurd daily late fees (e.g. $100/day on a $1,500/month apartment lease).',
      'Full forfeiture of large security deposits for minor technical defaults.',
      'Counterparty retains right to both liquidated damages AND actual damages (double dipping).'
    ],
    balancedStandard:
      'Damages should reflect genuine, difficult-to-calculate administrative costs, with a reasonable cap and grace period before triggering.',
    attorneyQuestions: [
      'Is the proposed liquidated damage amount enforceable or an illegal penalty under our state’s contract law?',
      'Can the clause be modified to require proof of actual out-of-pocket costs?'
    ]
  },
  {
    id: 'severability',
    title: 'Severability & Entire Agreement (Integration)',
    category: 'Legal Boilerplate',
    plainMeaning:
      '"Severability" means if a judge finds one sentence illegal, the rest of the contract survives. "Entire Agreement" means verbal promises not written down do not count.',
    whyItMatters:
      'If a sales agent verbally promised you free parking, discounts, or flexible terms, but it is not written inside this agreement, the integration clause legally erases those promises.',
    redFlags: [
      'Relying on verbal agreements or email assurances that contradict the signed text.',
      'Missing severability clause, meaning an invalid clause might jeopardize the entire agreement.'
    ],
    balancedStandard:
      'Ensure every verbal representation or side promise is explicitly appended as an exhibit or written directly into the agreement.',
    attorneyQuestions: [
      'Have all side letters and verbal representations been incorporated into the final written text?'
    ]
  },
  {
    id: 'governing-law',
    title: 'Governing Law & Dispute Forum',
    category: 'Litigation & Jurisdiction',
    plainMeaning:
      'Specifies which state’s laws govern the contract and which courthouse handles any lawsuits or arbitration.',
    whyItMatters:
      'If you reside in California but agree to exclusive jurisdiction in Delaware or London, you may have to travel across the country or hire out-of-state lawyers just to defend yourself.',
    redFlags: [
      'Exclusive jurisdiction located in an inconvenient, distant jurisdiction.',
      'Mandatory confidential arbitration with fee-shifting that forces you to pay their legal costs.',
      'Waiver of jury trial and class-action participation without reciprocal protections.'
    ],
    balancedStandard:
      'Governing law and venue should be located in the county or state where the services are performed or where the tenant/contractor is domiciled.',
    attorneyQuestions: [
      'Can we negotiate venue to our home state or local county?',
      'Does the arbitration clause require AAA / JAMS commercial rules with fair fee allocation?'
    ]
  },
  {
    id: 'non-compete',
    title: 'Non-Compete & Restrictive Covenants',
    category: 'Employment & Services',
    plainMeaning:
      'Restrictions preventing you from working for competitors, starting a similar business, or soliciting clients after the contract ends.',
    whyItMatters:
      'Overly broad non-competes can legally prevent you from earning a living in your professional field for years.',
    redFlags: [
      'Unreasonable geographic scope (e.g. "worldwide" or "nationwide" for a local business).',
      'Duration exceeding 6–12 months post-termination.',
      'Broad definition of "competing business" that covers any enterprise in the same industry.'
    ],
    balancedStandard:
      'Narrow non-solicitation of active clients for 6 months, with zero restriction on general employment or independent practice.',
    attorneyQuestions: [
      'Is this non-compete enforceable under recent FTC guidelines and state statutory law (e.g., California, New York)?',
      'Can we replace the non-compete with a standard non-disclosure agreement (NDA)?'
    ]
  }
]

export default function LegalGlossaryModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  if (!isOpen) return null

  const categories = ['all', 'Risk & Liability', 'Financial Exposure', 'Contract Term', 'Exit Rights', 'Remedies', 'Litigation & Jurisdiction', 'Employment & Services']

  const filteredDoctrines = LEGAL_DOCTRINES.filter((doc) => {
    const matchesCategory = activeCategory === 'all' || doc.category === activeCategory
    const matchesSearch =
      !searchTerm.trim() ||
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.plainMeaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.whyItMatters.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div
      className="glossary-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="glossary-title"
    >
      <div className="glossary-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="glossary-modal-header">
          <div className="glossary-header-title">
            <BookOpen size={20} className="glossary-header-icon" />
            <h2 id="glossary-title">Legal Doctrine Knowledge Base & Negotiation Guide</h2>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm close-glossary-btn"
            onClick={onClose}
            aria-label="Close legal guide dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="glossary-search-container">
          <div className="glossary-search-bar">
            <Search size={15} className="glossary-search-icon" />
            <input
              type="text"
              placeholder="Search legal doctrines (e.g. indemnity, liability cap, non-compete, renewal)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search legal concepts"
            />
          </div>

          <div className="glossary-category-chips">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`cat-chip ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === 'all' ? 'All Doctrines' : cat}
              </button>
            ))}
          </div>
        </div>

        <div className="glossary-modal-body">
          <div className="glossary-disclaimer-box">
            <Scale size={16} className="disclaimer-icon" />
            <p>
              <strong>Educational Reference:</strong> This knowledge base explains contract clauses in plain English to help you negotiate and prepare for consultations with qualified attorneys. It does not constitute formal legal advice.
            </p>
          </div>

          <div className="doctrines-list">
            {filteredDoctrines.map((item) => (
              <article key={item.id} className="doctrine-card">
                <div className="doctrine-header">
                  <h3 className="doctrine-title">{item.title}</h3>
                  <span className="doctrine-category-pill">{item.category}</span>
                </div>

                <div className="doctrine-section meaning-section">
                  <span className="section-label">Plain-English Meaning:</span>
                  <p>{item.plainMeaning}</p>
                </div>

                <div className="doctrine-section why-matters-section">
                  <div className="section-title-row">
                    <Lightbulb size={13} className="text-warning" />
                    <span className="section-label font-bold">Why This Matters in Negotiations:</span>
                  </div>
                  <p>{item.whyItMatters}</p>
                </div>

                <div className="doctrine-columns">
                  <div className="column red-flags-column">
                    <div className="col-header">
                      <AlertTriangle size={13} className="text-danger" />
                      <span>Red Flags to Watch For:</span>
                    </div>
                    <ul className="bullet-list">
                      {item.redFlags.map((flag, idx) => (
                        <li key={idx}>{flag}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="column balanced-column">
                    <div className="col-header">
                      <CheckCircle2 size={13} className="text-success" />
                      <span>Fair Balanced Standard:</span>
                    </div>
                    <p className="balanced-text">{item.balancedStandard}</p>
                  </div>
                </div>

                <div className="doctrine-section attorney-section">
                  <div className="section-title-row">
                    <HelpCircle size={13} className="text-primary" />
                    <span className="section-label font-bold">Questions to Ask Your Attorney:</span>
                  </div>
                  <ul className="attorney-questions-list">
                    {item.attorneyQuestions.map((q, idx) => (
                      <li key={idx}>{q}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
