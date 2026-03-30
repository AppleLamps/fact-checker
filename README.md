# Fact Checker

Evidence-first fact checking for X posts, text, and screenshots. Built for Vercel, the app returns two outputs for every submission:

- a neutral fact-check report with per-claim verdicts and sourced evidence
- a separate evidence-backed reply draft

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- PostgreSQL (Neon)
- Zod schema validation
- xAI Responses API (`web_search` + `x_search`)
- Vitest + Playwright

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Required | Description |
|----------|----------|-------------|
| `XAI_API_KEY` | Yes | xAI API key for the Responses API |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `XAI_MODEL` | No | Override the xAI model (default: `grok-4.20-multi-agent-beta-0309`) |
| `BLOB_READ_WRITE_TOKEN` | No | For future screenshot upload storage |
| `FACT_CHECKER_E2E_AUTOCOMPLETE` | No | Set to `1` to use in-memory adapters and mock results for E2E tests |

## Local Development

```bash
npm install
npm run dev
```

Run tests:

```bash
npm test            # unit tests (Vitest)
npm run test:e2e    # end-to-end tests (Playwright)
```

Build locally:

```bash
npm run build
```

## Current State

Implemented:

- landing page with submission form (X URL or pasted text)
- shared Zod schemas for submissions, evidence, verdicts, and reply drafts
- submission intake, status, and processing API routes
- provenance normalization with OCR adapter boundary
- xAI multi-agent orchestration with `web_search` and `x_search`
- deterministic result validation
- PostgreSQL-backed repositories for submissions and results (adapter pattern)
- in-memory adapters for E2E test isolation
- automatic queued-job processing triggered from the result page
- result report UI with evidence table, verdict cards, and reply draft at `/check/[id]`
- Playwright end-to-end tests and Vitest unit tests

Not yet implemented:

- durable background job infrastructure for long-running production workloads
- screenshot upload transport (OCR adapter is a no-op stub)
- Vercel deployment wiring
