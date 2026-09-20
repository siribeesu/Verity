# LegalAssist — Legal Document Clarity Assistant

LegalAssist is a GenAI-powered web app that helps everyday people understand, compare, and navigate legal documents — without replacing a lawyer.

## Quick Start

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure your API key

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and add your API key:

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
    │   ├── claudeClient.js   # Anthropic SDK wrapper
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
