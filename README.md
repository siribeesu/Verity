# LegalAssist — Legal Document Clarity Assistant

LegalAssist is a GenAI-powered web app that helps everyday people understand, compare, and navigate legal documents — without replacing a lawyer.

## What the Project Does

LegalAssist accepts legal text or a supported document file and uses a selected AI provider to make the content easier to review. It is organized around four tools:

- **Analyze**: produces a plain-language summary, clause explanations, risk levels, key-term definitions, and suggested action items. Where possible, clause explanations include a quotation from the source document.
- **Compare**: compares two document versions and describes material changes to terms, obligations, or risks.
- **Ask**: answers questions about a loaded document, streams the response, and presents a relevant source excerpt when available.
- **Lawyer Prep**: turns flagged clauses and key terms from an analysis into focused questions to discuss with an attorney.

The app accepts pasted text and PDF, DOCX, or TXT files up to 10 MB; extracted document text is capped at 80,000 characters by default. It also provides optional PII masking for pasted text before submission. The backend can use Anthropic, OpenAI, Google Gemini, or xAI Grok; configure one provider and its API key in `server/.env`.

## Important Cautions

- **Not legal advice**: LegalAssist is an informational tool, not a law firm or a substitute for advice from a licensed attorney. It does not determine whether a document or clause is legally valid in your jurisdiction.
- **AI can be wrong**: summaries, risk labels, and answers may be incomplete or inaccurate. Check quotations against the original document and have important terms reviewed by a qualified lawyer.
- **Your text is sent to an AI provider**: document content is sent to the provider configured by the application to generate results. Review that provider's privacy policy and terms before submitting confidential or sensitive documents.
- **Browser history**: analyses of pasted text are saved in tab-scoped session storage for the in-app history feature. Sign-out clears this history; closing the tab normally clears the session. Uploaded files are processed in server memory and are not written to server disk.
- **PII masking is optional**: the mask control applies to pasted text only; uploaded files are not automatically redacted. Review and redact sensitive details before submitting files when appropriate.

## Basic Security Review

### Secrets

- `server/.env` is ignored by Git; `server/.env.example` contains placeholders. Keep provider keys in the server environment or deployment secret settings, never in client code or committed files.
- If a key is accidentally exposed, revoke it with the provider and replace it. Removing it from a file or commit does not invalidate the exposed key.
- The configured provider receives document text to generate results. Apply the provider's data-handling terms to any documents you submit.

### CORS and API Access

- The server only returns CORS permission for origins listed in `CORS_ORIGINS`, a comma-separated list of exact origins such as `https://app.example.com`. Leave it blank for the same-origin Vercel deployment or the local Vite proxy. Set it when a separately hosted browser frontend needs to call the API.
- Browser CORS restrictions are not authentication. Feature API routes require an OIDC bearer token that the server verifies against the configured issuer, audience, and JWKS. `/api/health` remains public for hosting health checks.
- The app delegates account enrollment, MFA, account recovery, and access policy to the configured OIDC identity provider. Configure those controls in that provider; never place provider secrets or API tokens in the browser bundle.
- The OIDC SPA stores tokens in tab-scoped `sessionStorage` and uses Authorization Code + PKCE. Configure short-lived access tokens and exact redirect URLs. A backend-for-frontend with `HttpOnly`, `Secure`, `SameSite` cookies is preferable where the threat model requires tokens to be inaccessible to JavaScript.

### Rate Limits and Uploads

- The API currently allows up to 200 requests per client IP and 100 requests per authenticated account per 15-minute window. JSON request bodies are limited to 2 MB, uploads to 10 MB, extracted documents to 80,000 characters each, and Ask questions to 2,000 characters. Tune document and request limits with the corresponding `MAX_*` settings.
- Local development uses an in-memory rate-limit store. Production startup requires `REDIS_URL` and uses Redis to share rate limits across server instances. Configure Redis availability/monitoring and provider spending limits before public launch.
- `TRUST_PROXY` controls Express proxy trust for client IP detection. The server defaults to one trusted proxy hop on Vercel; set it to the correct hop count for other hosting platforms. Do not trust forwarded IP headers from direct, untrusted traffic.
- Helmet sets common HTTP security headers. Production startup also fails when the selected provider API key, Redis, or OIDC settings are missing. Configure `API_RATE_LIMIT_WINDOW_MS`, `API_RATE_LIMIT_MAX`, and `API_USER_RATE_LIMIT_MAX` to tune request limits.
- Vercel applies a Content Security Policy that allows same-origin scripts and HTTPS OIDC connections; review it if adding third-party scripts, media, or integrations.

## Deployment Checklist

- Add `PROVIDER` and the matching provider API key as server-side environment variables for each deployment environment. Add model overrides only when needed.
- Register an OIDC public client with Authorization Code + PKCE. Allowlist the exact frontend callback and post-logout URLs; configure the browser `VITE_OIDC_*` values at build time and server `AUTH_ISSUER`, `AUTH_AUDIENCE`, and `AUTH_JWKS_URL` at runtime. Set `VITE_OIDC_SCOPE` to the provider's API scope and ensure issued RS256/ES256 access tokens use the configured API audience and signing keys at the JWKS URL. The SPA configuration is public; it must not contain client secrets.
- Provision Redis and configure `REDIS_URL`; production intentionally refuses to start without the shared rate-limit store. Configure `TRUST_PROXY` for the hosting topology.
- Configure account enrollment restrictions, MFA policy, account recovery, and user access controls in the identity provider before exposing the app publicly.
- Set short access-token lifetimes and review whether the SPA `sessionStorage` token model meets your organization’s threat model; consider a backend-for-frontend session for highly sensitive deployments.
- Confirm `CORS_ORIGINS` contains only the exact frontend origins when frontend and API are hosted separately. Do not treat CORS as a substitute for authentication.
- Configure a shared rate-limit store or gateway for multi-instance/serverless production, and review request quotas and provider spending limits.
- Run `npm test` and `npm run build` before deployment.
- Deploy using the repository's Vercel configuration, then check `/api/health` and smoke-test analysis, comparison, document Q&A, and lawyer-prep flows with non-sensitive documents.
- Confirm production secrets are configured in the hosting dashboard and are not present in client bundles, logs, or committed files.

## Setup and Run

### Prerequisites

- Node.js 20 or newer and npm.
- An API key for one supported LLM provider: Anthropic, OpenAI, Google Gemini, or xAI Grok.

### 1. Install dependencies

From the repository root, run:

```sh
npm run install:all
```

### 2. Create the server environment file

PowerShell:

```powershell
Copy-Item server/.env.example server/.env
```

macOS/Linux:

```sh
cp server/.env.example server/.env
```

Open `server/.env` and set `PROVIDER` to `anthropic`, `openai`, `gemini`, or `grok`. Add a valid API key to the matching variable (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, or `GROK_API_KEY`). Leave the other provider keys blank. Model names can be changed with the corresponding `*_MODEL` variable; the example file lists defaults. Keep real API keys private and do not commit `server/.env`.

Local development does not require OIDC; the API permits unauthenticated local requests when all `AUTH_*` settings are blank. To exercise sign-in locally, register a test OIDC client and configure matching `VITE_OIDC_*` values in `client/.env` and `AUTH_ISSUER`, `AUTH_AUDIENCE`, and `AUTH_JWKS_URL` in `server/.env`. The client authority and server issuer must match exactly. Copy `client/.env.example` as a starting point. Do not use production user accounts or real legal documents for local testing.

The example configures `PORT=3001` and `NODE_ENV=development`. The frontend's Vite server runs on port 5173 and proxies `/api` requests to the backend.

### 3. Start the app
From the repository root:

```sh
npm run dev
```

Open the frontend at <http://localhost:5173>. The API server runs at <http://localhost:3001>; its health endpoint is <http://localhost:3001/api/health>.

To run services separately, use two terminals from the repository root:

```sh
npm run dev:server
```

```sh
npm run dev:client
```

### Tests and production build

Run all server and client tests:

```sh
npm test
```

Build the frontend for production:

```sh
npm run build
```

---

## Architecture

```
legalassist/
├── client/          # React + Vite frontend
│   └── src/
│       ├── components/
│       │   ├── Layout/          # Header, DisclaimerBanner
│       │   ├── Landing/         # LandingPage
│       │   ├── DocumentInput/   # Paste + file upload
│       │   ├── Analyze/         # AnalyzeTab, ClauseCard, Glossary, Checklist
│       │   ├── Compare/         # CompareTab, DiffCard
│       │   ├── Ask/             # AskTab (SSE streaming), ChatMessage
│       │   └── LawyerPrep/      # LawyerPrepTab
│       ├── hooks/               # useAnalyze, useCompare, useAsk, useLawyerPrep
│       └── api/client.js        # axios + fetch/SSE wrapper
│
└── server/          # Node.js + Express backend
    ├── routes/      # analyze, compare, ask (SSE), lawyer-prep
    ├── services/
    │   ├── claudeClient.js   # Multi-provider LLM client
    │   ├── documentParser.js # pdf-parse + mammoth
    │   └── chunker.js        # Section chunking + keyword retrieval
    └── prompts/     # System prompt factories per feature
```

---

## Grounding & Citation Approach

**The core principle**: every AI explanation must be traceable to an exact excerpt from the source document. This is both a trust feature and a hallucination-mitigation strategy.

### In Analyze
The system prompt requires the AI to include a verbatim `original_excerpt` (≤40 words) for every clause it identifies. The UI renders this in a distinct monospace quote block, visually separate from the AI-generated explanation. Risk flags use descriptive language ("worth noting because...") not verdict language.

### In Compare
The AI is instructed to quote or closely paraphrase what each document actually says, never to declare one "better," and to ignore purely stylistic changes.

### In Ask
Every streaming answer ends with a fenced `source` block containing the most relevant verbatim quote. The frontend strips this block from the displayed text and presents it separately as a collapsible "Source in document" drawer. If the document doesn't address a question, the AI must say so explicitly rather than filling in from general knowledge.

### In Lawyer Prep
Questions are generated directly from the prior Analyze result (high/medium-risk clauses + key terms), so they're grounded in flagged content rather than generic legal advice templates.

---

## Document Parsing

| Format | Library |
|--------|---------|
| PDF    | `pdf-parse` |
| DOCX   | `mammoth` |
| TXT    | Native buffer |

Files are handled in memory (not persisted to disk). The `parseFile(buffer, mimetype)` function in `server/services/documentParser.js` returns extracted plain text.

---

## Long Document Handling

`server/services/chunker.js` implements two-step handling:

1. **Chunking**: documents over ~8,000 characters are split at double-newline boundaries (paragraph/section breaks) with 200-character overlap to avoid cutting mid-clause.

2. **For Analyze**: all chunks are processed in parallel; results are merged (clauses concatenated, key terms and action items deduplicated).

3. **For Ask**: `retrieveRelevant(chunks, query, k=3)` uses TF-IDF-style keyword overlap scoring to select the 3 most relevant chunks as context for each question.

---

## Disclaimer

LegalAssist explains document text. It does not practice law, does not know your jurisdiction's specific rules, can make mistakes, and is not a substitute for advice from a licensed attorney. Every output is for informational purposes only.
