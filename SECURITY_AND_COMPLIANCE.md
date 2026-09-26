# LegalAssist — Security, Trust & Architecture Specification

This document details the defense-in-depth security controls, data isolation boundaries, and compliance mechanisms implemented in LegalAssist.

---

## 1. Security Architecture Overview

LegalAssist is designed with a zero-trust, privacy-first architecture suited for sensitive legal document analysis:

```
[User Browser]
      │  (HTTPS / TLS 1.3)
      ▼
[Express Gateway]
      │── 1. Content Security Policy (CSP), nosniff, frameguard (SAMEORIGIN)
      │── 2. Distributed Rate Limiter (Redis / Sliding Window)
      │── 3. Wire Compression (gzip / deflate)
      ▼
[Security Pipeline]
      │── 4. Input Validator (Length, MIME types, UTF-8 parser)
      │── 5. PII & XSS Masking Engine (Redacts SSNs, Cards, Emails, Phones, <script>)
      │── 6. Deterministic SHA-256 Cache (Instant <5ms retrieval, zero duplicate token spend)
      │── 7. XML Boundary Sandboxing (<document_content>, <document_context>)
      ▼
[LLM Provider Engine]
      │── 8. Multi-Model Failover (Gemini 3.5 Flash ──► Flash Lite)
      │── 9. Source-Grounding Enforcement (Strict quotation & section mapping)
      ▼
[Audit & Compliance]
      └── 10. SHA-256 Anonymized Audit Logger (GDPR Right-to-Erasure Workflow)
```

---

## 2. Threat Modeling & Safeguards

| Threat Vector | Mitigation Strategy | Implemented In |
|---|---|---|
| **Indirect Prompt Injection** | Document content is encapsulated inside explicit XML boundaries (`<document_content>`) with strict system prompt directives instructing models to treat content strictly as passive data. | `server/prompts/*.js` |
| **Data Leakage & PII Ingestion** | Server-side and client-side sanitizers scrub SSNs, credit cards, emails, phone numbers, and script tags before external API transmission. | `server/services/piiSanitizer.js`, `client/src/utils/piiSanitizer.js` |
| **Stored & Reflected XSS** | Executable `<script>` tags, javascript: URIs, and event handlers are redacted; strict CSP restricts script and frame execution. | `server/index.js`, `piiSanitizer.js` |
| **API Denial of Service** | Sliding-window rate limiters backed by Redis (or memory fallback), body size caps (2MB payload, 80k character text, 10MB upload). | `server/index.js`, `documentLimits.js` |
| **Model Outages & 503 Errors** | Multi-model candidate fallback pipeline (`gemini-3.5-flash` with fallback to `gemini-3.5-flash-lite`). | `server/services/claudeClient.js`, `providerHealth.js` |
| **Compliance Non-Auditability** | Circular audit buffer logs operations with SHA-256 hashed client identifiers and redacted PII counters. | `server/services/auditLogger.js`, `/api/compliance` |

---

## 3. Compliance & Governance Verification

Execute the production validation suite against any deployment to verify all controls:
```bash
npm run test:smoke
```
This tests service health, provider failover, security headers, rate limiting, PII redaction, grounding excerpts, and data purge workflows.
