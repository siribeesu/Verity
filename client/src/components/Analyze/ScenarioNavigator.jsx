import React, { useState } from 'react'
import { Compass, Sparkles, HelpCircle, CheckCircle2, AlertTriangle, MessageSquare, Copy, Check } from 'lucide-react'
import './ScenarioNavigator.css'

const SCENARIOS_BY_TYPE = {
  lease: [
    {
      id: 'repair',
      title: '🛠️ Landlord Ignores Urgent Maintenance',
      question: 'The heating or plumbing is broken and the landlord is unresponsive. What can I do?',
      position: 'Most jurisdictions enforce an implied warranty of habitability. Landlords must repair essential services within reasonable time after written notice.',
      actionSteps: [
        'Send a formal dated written notice specifying the exact defect (email + certified mail).',
        'Check local municipal tenant ordinances for rent withholding or "repair and deduct" remedy rules.',
        'Do not unilaterally stop paying rent without legal guidance or municipal escrow deposit.'
      ],
      script: 'Dear [Landlord/Property Manager],\n\nI am writing to provide formal notice regarding the unresolved [heating/plumbing] issue in Unit [Number], first reported on [Date]. Under our lease and local habitability standards, this requires prompt repair. Please confirm when a technician will be dispatched within the next 24 to 48 hours.\n\nThank you,\n[Your Name]'
    },
    {
      id: 'entry',
      title: '🚪 Landlord Entering Without Notice',
      question: 'Can my landlord enter my apartment whenever they want without advance warning?',
      position: 'Tenants have a legal right to quiet enjoyment. Standard law requires at least 24 to 48 hours advance written notice, except in true emergencies (e.g. active flooding or fire).',
      actionSteps: [
        'Politely remind landlord in writing of the mandatory 24-hour advance notice requirement.',
        'Document dates, times, and circumstances of any unauthorized entry.',
        'If entries continue, consult local tenant rights board regarding breach of quiet enjoyment.'
      ],
      script: 'Dear [Landlord],\n\nI noticed entry into my apartment today without prior notice. As a reminder, Section [X] of our lease and local law require at least 24 hours advance written notice prior to non-emergency visits. Please notify me in advance for future scheduling.\n\nBest regards,\n[Your Name]'
    },
    {
      id: 'break',
      title: '📦 Breaking the Lease Early',
      question: 'I need to relocate before the lease ends. What are my options and liabilities?',
      position: 'You may be liable for rent until a replacement tenant is found, but landlords in most jurisdictions have a mandatory legal duty to "mitigate damages" by actively seeking a replacement.',
      actionSteps: [
        'Provide as much advance written notice as possible to trigger the landlord\'s mitigation duty.',
        'Offer qualified replacement candidates or request permission to sublet/assign.',
        'Negotiate a mutual early lease termination agreement with a fixed termination fee.'
      ],
      script: 'Dear [Landlord],\n\nDue to unforeseen [relocation/job] circumstances, I need to conclude my tenancy on [Target Date]. I would like to cooperate with you on advertising the unit immediately or presenting qualified replacement applicants to minimize any vacancy.\n\nSincerely,\n[Your Name]'
    }
  ],
  employment: [
    {
      id: 'noncompete',
      title: '🚫 Non-Compete & Moving to Competitor',
      question: 'My contract has a non-compete clause. Can my former employer stop me from taking a new job?',
      position: 'Non-competes are heavily restricted or outright void in several jurisdictions (e.g. California, Minnesota, FTC rulemakings), and must be reasonable in geographic and temporal scope.',
      actionSteps: [
        'Check if your jurisdiction prohibits or strictly limits post-employment non-compete enforcement.',
        'Ensure you do not use or take proprietary trade secrets or customer lists to the new employer.',
        'Have an employment attorney review the geographic boundary and duration.'
      ],
      script: 'I am transitioning to a new role that relies exclusively on my general professional knowledge and pre-existing skillset, without utilizing any proprietary trade secrets from my prior employment.'
    },
    {
      id: 'ip',
      title: '💡 Ownership of Side Projects & Inventions',
      question: 'Does my employer own side projects I build on my own time?',
      position: 'Inventions created entirely on personal time, using personal equipment, unrelated to company business or R&D, are typically exempt by statute in many states.',
      actionSteps: [
        'Ensure zero company equipment, repos, or work hours were used in developing your project.',
        'Document your project\'s commit logs, timestamps, and independence from employer IP.'
      ],
      script: 'The project was developed strictly outside of working hours, utilizing personal hardware and software licenses, and is entirely unrelated to the company\'s business operations or intellectual property.'
    }
  ],
  general: [
    {
      id: 'breach',
      title: '⚠️ Counterparty Fails to Deliver',
      question: 'The other party missed their milestone or deadline. What should I do first?',
      position: 'Check if your agreement contains a mandatory "Notice and Right to Cure" clause before claiming breach or terminating.',
      actionSteps: [
        'Send a formal Notice of Deficiency specifying the exact missed deliverable.',
        'Grant the contractual cure period (usually 14 to 30 days) before terminating.',
        'Preserve all communications and deliverables in a chronological folder.'
      ],
      script: 'Dear [Party Name],\n\nThis letter serves as formal notice that deliverable [X] under Section [Y] of our Agreement dated [Date] was due on [Due Date] and remains outstanding. Please cure this deficiency within the contractual [14/30]-day cure window.\n\nSincerely,\n[Your Name]'
    },
    {
      id: 'dispute',
      title: '⚖️ Resolving a Disagreement Without Lawsuit',
      question: 'We have a dispute over payment or terms. Do we have to go to court?',
      position: 'Most modern contracts mandate informal good-faith negotiation or mediation before any arbitration or litigation can be filed.',
      actionSteps: [
        'Check the Governing Law and Dispute Resolution clause in your contract.',
        'Request a structured 30-day informal mediation or executive escalation call.'
      ],
      script: 'Dear [Party],\n\nIn accordance with the Dispute Resolution procedures in our Agreement, I propose a good-faith executive discussion next week to reach an amicable mutual resolution regarding [Issue].\n\nBest regards,\n[Your Name]'
    }
  ]
}

export default function ScenarioNavigator({ docType = 'general', onAskScenario }) {
  const [selectedScenario, setSelectedScenario] = useState(null)
  const [copiedScript, setCopiedScript] = useState(false)

  const scenarios = SCENARIOS_BY_TYPE[docType] || SCENARIOS_BY_TYPE.general

  function handleCopyScript(script) {
    navigator.clipboard.writeText(script)
    setCopiedScript(true)
    setTimeout(() => setCopiedScript(false), 1500)
  }

  return (
    <div className="scenario-navigator-card card animate-fade-in">
      <div className="scenario-header">
        <div className="scenario-title-wrap">
          <Compass size={18} className="scenario-icon" />
          <div>
            <h3>"What If?" Rights & Scenario Navigator</h3>
            <p className="scenario-subtext">Explore common real-world situations and your legal rights under this document type.</p>
          </div>
        </div>
      </div>

      <div className="scenario-chips-row">
        {scenarios.map((sc) => (
          <button
            key={sc.id}
            type="button"
            className={`scenario-chip ${selectedScenario?.id === sc.id ? 'active' : ''}`}
            onClick={() => setSelectedScenario(selectedScenario?.id === sc.id ? null : sc)}
          >
            <span>{sc.title}</span>
          </button>
        ))}
      </div>

      {selectedScenario && (
        <div className="scenario-detail-box animate-fade-in">
          <div className="scenario-question-row">
            <HelpCircle size={15} className="text-primary" />
            <strong>{selectedScenario.question}</strong>
          </div>

          <div className="scenario-position-box">
            <span className="box-tag">Standard Legal Standing:</span>
            <p>{selectedScenario.position}</p>
          </div>

          <div className="scenario-steps-box">
            <span className="box-tag">Recommended Action Steps:</span>
            <ul className="scenario-steps-list">
              {selectedScenario.actionSteps.map((step, i) => (
                <li key={i}>
                  <CheckCircle2 size={13} className="step-check-icon" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {selectedScenario.script && (
            <div className="scenario-script-box">
              <div className="script-header">
                <span className="box-tag">Suggested Communication Template:</span>
                <button
                  type="button"
                  className="btn btn-secondary btn-xs copy-script-btn"
                  onClick={() => handleCopyScript(selectedScenario.script)}
                >
                  {copiedScript ? <Check size={11} className="text-success" /> : <Copy size={11} />}
                  <span>{copiedScript ? 'Copied' : 'Copy Message'}</span>
                </button>
              </div>
              <pre className="script-text">{selectedScenario.script}</pre>
            </div>
          )}

          {onAskScenario && (
            <div className="scenario-ask-ai-row" style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => onAskScenario(selectedScenario)}
              >
                <MessageSquare size={13} />
                <span>Ask LegalAssist about this scenario in my document</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
