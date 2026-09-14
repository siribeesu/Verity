# Verity — Legal Document Clarity Assistant

Verity is a GenAI-powered web app that helps everyday people understand, compare, and navigate legal documents — without replacing a lawyer.

## Quick Start

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure your API key

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
```

### 3. Run the development server

```bash
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

---

## Architecture

```
verity/
├── client/          # React + Vite frontend
│   └── src/
│       ├── components/
│       │   ├── Layout/          # Header, DisclaimerBanner
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
    │   ├── claudeClient.js   # Anthropic SDK wrapper
    │   ├── documentParser.js # pdf-parse + mammoth
    │   └── chunker.js        # Section chunking + keyword retrieval
    └── prompts/     # System prompt factories per feature
```

### Model
Uses `claude-sonnet-4-5`. Change `MODEL` in `server/services/claudeClient.js`.

---

## Grounding & Citation Approach

**The core principle**: every AI explanation must be traceable to an exact excerpt from the source document. This is both a trust feature and a hallucination-mitigation strategy.

### In Analyze
The system prompt requires Claude to include a verbatim `original_excerpt` (≤40 words) for every clause it identifies. The UI renders this in a distinct monospace quote block, visually separate from the AI-generated explanation. Risk flags use descriptive language ("worth noting because...") not verdict language.

### In Compare
Claude is instructed to quote or closely paraphrase what each document actually says, never to declare one "better," and to ignore purely stylistic changes.

### In Ask
Every streaming answer ends with a fenced `source` block containing the most relevant verbatim quote. The frontend strips this block from the displayed text and presents it separately as a collapsible "Source in document" drawer. If the document doesn't address a question, Claude must say so explicitly rather than filling in from general knowledge.

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

3. **For Ask**: `retrieveRelevant(chunks, query, k=3)` uses TF-IDF-style keyword overlap scoring to select the 3 most relevant chunks as context for each question. This avoids the need for a vector database in the prototype.

---

## Production Roadmap

### What would be needed to ship this

| Area | Prototype state | Production requirement |
|------|-----------------|------------------------|
| **Auth** | None | OAuth/JWT, user accounts |
| **Storage** | In-memory only | Encrypted document storage (S3 + KMS or similar) |
| **Chunking / RAG** | Keyword overlap | Semantic embeddings (e.g., `text-embedding-3-small`) + vector DB (Pinecone / pgvector) |
| **Rate limiting** | None | Per-user limits, abuse detection |
| **File parsing** | Server-side (pdf-parse, mammoth) | Same, but with timeout/error handling for malformed files |
| **Jurisdiction** | User-specified string injected into prompt | Jurisdiction-aware prompting with structured flag tagging |
| **Streaming** | SSE over HTTP | Same (or WebSockets for bidirectional) |
| **Caching** | None | Cache analysis results by document hash |
| **Testing** | None | Integration tests for each route, prompt regression tests |
| **Monitoring** | Console logs | Structured logging, Sentry, token usage tracking |

### Hallucination Mitigations at Scale
- Add a "citation verification" pass: after Claude returns analysis, verify each `original_excerpt` is a near-match to a substring of the source text (fuzzy string match). Flag any clause whose excerpt isn't found.
- Confidence scoring: flag clauses where Claude expresses uncertainty in its explanation.
- User feedback loop: let users flag incorrect explanations to improve prompts over time.

---

## Disclaimer

Verity explains document text. It does not practice law, does not know your jurisdiction's specific rules, can make mistakes, and is not a substitute for advice from a licensed attorney. Every output is for informational purposes only.
