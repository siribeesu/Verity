import React from 'react'
import {
  ShieldCheck,
  FileSearch,
  GitCompare,
  MessageSquareQuote,
  Scale,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Lock,
  Quote,
  Eye,
  FileText,
  ChevronRight,
  Award
} from 'lucide-react'
import { SAMPLE_DOCUMENTS } from '../../data/sampleDocuments'
import './LandingPage.css'

export default function LandingPage({ onLaunchApp, onLaunchWithSample }) {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-badge animate-fade-in">
          <Sparkles size={14} className="hero-sparkle" />
          <span>GenAI-Powered Legal Document Clarity</span>
        </div>

        <h1 className="hero-title animate-fade-in">
          Understand every clause <br />
          <span className="hero-title-gradient">before you sign.</span>
        </h1>

        <p className="hero-subtitle animate-fade-in">
          Verity turns dense, confusing legal agreements into crystal-clear explanations,
          flagged risk insights, and grounded citations — without replacing your lawyer.
        </p>

        <div className="hero-cta-group animate-fade-in">
          <button
            className="btn btn-primary btn-hero-primary"
            onClick={() => onLaunchApp('analyze')}
          >
            <span>Launch Verity Assistant</span>
            <ArrowRight size={18} />
          </button>
          <button
            className="btn btn-secondary btn-hero-secondary"
            onClick={() => onLaunchWithSample?.(SAMPLE_DOCUMENTS[0])}
          >
            <Sparkles size={16} />
            <span>Try Sample Lease Agreement</span>
          </button>
        </div>

        <div className="hero-trust-bar animate-fade-in">
          <div className="trust-item">
            <Quote size={15} className="trust-icon" />
            <span>100% Verbatim Grounded Excerpts</span>
          </div>
          <div className="trust-item">
            <Lock size={15} className="trust-icon" />
            <span>In-Memory Only (No Disk Storage)</span>
          </div>
          <div className="trust-item">
            <Scale size={15} className="trust-icon" />
            <span>Attorney Consultation Agenda</span>
          </div>
        </div>
      </section>

      {/* Feature Pillars Grid */}
      <section className="landing-features">
        <div className="section-header text-center">
          <span className="section-tag">Core Capabilities</span>
          <h2 className="landing-section-heading">Four tools designed for total contract clarity</h2>
          <p className="section-subtext">
            Everything you need to review, challenge, and understand complex legal documents with confidence.
          </p>
        </div>

        <div className="features-grid">
          {/* Feature 1 */}
          <div className="feature-card card" onClick={() => onLaunchApp('analyze')}>
            <div className="feature-icon-wrap icon-analyze">
              <FileSearch size={24} />
            </div>
            <h3>Document Analysis</h3>
            <p>
              Get clause-by-clause breakdowns with plain-English translations, risk severity ratings, and exact source citations.
            </p>
            <ul className="feature-bullets">
              <li><CheckCircle2 size={14} /> High/Medium/Low risk flags</li>
              <li><CheckCircle2 size={14} /> Plain-English legal terms glossary</li>
              <li><CheckCircle2 size={14} /> Interactive actionable next steps</li>
            </ul>
            <span className="feature-card-cta">
              <span>Try Analyze</span>
              <ChevronRight size={15} />
            </span>
          </div>

          {/* Feature 2 */}
          <div className="feature-card card" onClick={() => onLaunchApp('compare')}>
            <div className="feature-icon-wrap icon-compare">
              <GitCompare size={24} />
            </div>
            <h3>Side-by-Side Compare</h3>
            <p>
              Spot material shifts between two agreement drafts. Verity ignores stylistic edits and zeroes in on altered obligations.
            </p>
            <ul className="feature-bullets">
              <li><CheckCircle2 size={14} /> Side-by-side color-coded excerpts</li>
              <li><CheckCircle2 size={14} /> "Why it matters in practice" context</li>
              <li><CheckCircle2 size={14} /> 1-click A/B swap & presets</li>
            </ul>
            <span className="feature-card-cta">
              <span>Try Compare</span>
              <ChevronRight size={15} />
            </span>
          </div>

          {/* Feature 3 */}
          <div className="feature-card card" onClick={() => onLaunchApp('ask')}>
            <div className="feature-icon-wrap icon-ask">
              <MessageSquareQuote size={24} />
            </div>
            <h3>Grounded Document Q&A</h3>
            <p>
              Ask any question about your document in conversational English. Every answer cites verbatim proof from your file.
            </p>
            <ul className="feature-bullets">
              <li><CheckCircle2 size={14} /> Real-time streaming responses</li>
              <li><CheckCircle2 size={14} /> Verified source quote drawers</li>
              <li><CheckCircle2 size={14} /> Topic-categorized prompt chips</li>
            </ul>
            <span className="feature-card-cta">
              <span>Ask Questions</span>
              <ChevronRight size={15} />
            </span>
          </div>

          {/* Feature 4 */}
          <div className="feature-card card" onClick={() => onLaunchApp('lawyer-prep')}>
            <div className="feature-icon-wrap icon-prep">
              <Scale size={24} />
            </div>
            <h3>Attorney Consultation Prep</h3>
            <p>
              Synthesizes flagged ambiguities and one-sided terms into a prioritized list of high-leverage questions for your attorney.
            </p>
            <ul className="feature-bullets">
              <li><CheckCircle2 size={14} /> Prioritized discussion points</li>
              <li><CheckCircle2 size={14} /> Interactive meeting notes tracker</li>
              <li><CheckCircle2 size={14} /> One-click printable sheet</li>
            </ul>
            <span className="feature-card-cta">
              <span>Explore Prep Sheet</span>
              <ChevronRight size={15} />
            </span>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="landing-how-it-works">
        <div className="section-header text-center">
          <span className="section-tag">How It Works</span>
          <h2 className="landing-section-heading">From legalese to clarity in three steps</h2>
        </div>

        <div className="steps-container">
          <div className="step-card card">
            <div className="step-num">1</div>
            <h4>Input Your Agreement</h4>
            <p>Paste text or upload PDF, DOCX, or TXT documents up to 20 MB. Files are processed securely in memory.</p>
          </div>

          <div className="step-arrow-divider">→</div>

          <div className="step-card card">
            <div className="step-num">2</div>
            <h4>Review Flagged Insights</h4>
            <p>Explore plain-English translations, risk evaluations, and defined key legal terms side-by-side with quotes.</p>
          </div>

          <div className="step-arrow-divider">→</div>

          <div className="step-card card">
            <div className="step-num">3</div>
            <h4>Take Confident Action</h4>
            <p>Ask in-depth questions, compare revised counter-offers, or print a structured agenda for your lawyer.</p>
          </div>
        </div>
      </section>

      {/* Quick Start Contract Presets */}
      <section className="landing-presets">
        <div className="presets-banner card">
          <div className="presets-banner-text">
            <h3>Test with realistic sample documents</h3>
            <p>Experience how Verity analyzes different contract categories with one click:</p>
          </div>

          <div className="presets-cards-row">
            {SAMPLE_DOCUMENTS.map((sample) => (
              <div
                key={sample.id}
                className="preset-sample-card"
                onClick={() => onLaunchWithSample?.(sample)}
              >
                <div className="sample-card-top">
                  <span className="category-badge">{sample.category}</span>
                  <Sparkles size={14} className="sparkle-icon" />
                </div>
                <h4>{sample.title}</h4>
                <p>{sample.description}</p>
                <button type="button" className="btn btn-secondary btn-sm sample-launch-btn">
                  <span>Analyze this sample</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Grounding Guarantee */}
      <section className="landing-trust-section">
        <div className="trust-card card">
          <div className="trust-card-header">
            <ShieldCheck size={28} className="trust-shield-icon" />
            <div>
              <h3>The Verity Grounding Principle</h3>
              <p>Every AI explanation must trace back to an exact, verifiable source excerpt.</p>
            </div>
          </div>

          <div className="trust-points-grid">
            <div className="trust-point">
              <CheckCircle2 size={18} className="trust-point-icon" />
              <div>
                <strong>Zero Hallucination Tolerance:</strong> If a document doesn't address an issue, Verity explicitly informs you rather than guessing.
              </div>
            </div>
            <div className="trust-point">
              <CheckCircle2 size={18} className="trust-point-icon" />
              <div>
                <strong>In-Memory Processing:</strong> Documents are never permanently stored on servers, protecting your confidential information.
              </div>
            </div>
            <div className="trust-point">
              <CheckCircle2 size={18} className="trust-point-icon" />
              <div>
                <strong>Empowers, Never Replaces Lawyers:</strong> Prepares you for informed, focused legal conversations with licensed counsel.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="landing-cta-banner">
        <div className="cta-banner-inner card">
          <h2>Ready to demystify your legal documents?</h2>
          <p>Get instant plain-English clarity, spot hidden risks, and protect your rights today.</p>
          <button
            className="btn btn-primary btn-cta-large"
            onClick={() => onLaunchApp('analyze')}
          >
            <span>Start Free Analysis</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <ShieldCheck size={20} className="footer-logo-icon" />
            <span className="footer-brand-name">Verity</span>
            <span className="footer-tagline">— Legal Document Clarity Assistant</span>
          </div>
          <p className="footer-disclaimer">
            Disclaimer: Verity is an informational clarity tool, not a law firm or substitute for an attorney. Always consult a licensed lawyer before executing legal documents.
          </p>
        </div>
      </footer>
    </div>
  )
}
