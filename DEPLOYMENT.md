# LegalAssist — Production Deployment & Operations Guide

This guide details how to deploy, configure, and operate LegalAssist in production environments.

---

## 1. Quick Start: Turnkey Docker Deployment (Recommended)

The project includes a production-grade multi-stage `Dockerfile` and `docker-compose.yml` that provisions the full application stack along with Redis for distributed rate-limiting.

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) or Docker Engine 20.10+
* Docker Compose v2+

### One-Command Deployment
```bash
# Clone and enter the repository
git clone https://github.com/siribeesu/legalAssist.git
cd legalAssist

# Start all services (App + Redis + Networks)
docker compose up -d --build
```

The application is immediately accessible at **http://localhost:3001**.

### Healthcheck Verification
```bash
curl http://localhost:3001/api/health
# {"status":"ok","service":"legalassist-server","provider":"gemini","dependencies":{"redis":"ready"}}
```

---

## 2. Cloud Platform Deployments

### Vercel (Serverless Edge & Client)
1. Fork or push the repo to GitHub.
2. In Vercel Dashboard, import the repository.
3. Configure the Root Directory as `./`. Vercel automatically detects the Vite frontend in `client/` and API server in `api/` or `server/`.
4. Configure Environment Variables:
   * `PROVIDER`: `gemini` (or `anthropic`, `openai`, `grok`)
   * `GEMINI_API_KEY`: Your Google AI Studio API key
   * `GEMINI_MODEL`: `gemini-3.5-flash`
   * `REDIS_URL`: Upstash or Redis Cloud URL (e.g. `rediss://default:token@...`)

### Render / Railway / Fly.io (Containerized / Node Service)
* **Build Command**: `npm run build`
* **Start Command**: `node server/index.js`
* **Environment Variables**:
  ```ini
  NODE_ENV=production
  PORT=3001
  PROVIDER=gemini
  GEMINI_API_KEY=your_key_here
  GEMINI_MODEL=gemini-3.5-flash
  REDIS_URL=redis://your-redis-host:6379
  ```

---

## 3. Automated CI/CD Pipeline

Every push to `main` or `update` triggers our automated GitHub Actions workflow (`.github/workflows/ci.yml`):
* **Matrix Validation**: Tested against Node.js 20.x and 22.x.
* **Security Scanning**: Audits all dependencies (`npm audit --audit-level=critical`).
* **Automated Test Suites**: Executes 73+ tests covering security headers, rate limits, PII sanitization, caching, and end-to-end integration workflows.
* **Production Build**: Compiles Vite bundles and optimizes static assets.

---

## 4. Architectural Resilience & Defense in Depth

* **Dual-Tier Caching**: In-memory LRU with deterministic SHA-256 keying reduces API calls and costs by caching repeat analyses for 1 hour.
* **PII & Prompt Injection Shield**: Server and client automatically strip SSNs, credit cards, emails, phone numbers, and executable `<script>` tags before LLM ingestion.
* **Non-Blocking Fallback**: Multi-tier model fallback (`gemini-3.5-flash` -> `gemini-3.5-flash-lite`) ensures high availability under regional traffic spikes.
