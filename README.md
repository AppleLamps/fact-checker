# Fact Checker

Evidence-first fact checking for X posts, text, and screenshots. The app is built for Vercel and is designed to return two outputs for every submission:
- a neutral fact-check report
- a separate evidence-backed reply draft

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Vitest
- xAI Responses API

## Required Environment Variables

Copy `.env.example` to `.env.local` and fill in:

- `XAI_API_KEY`: xAI API key for the Responses API
- `XAI_MODEL`: optional override for the xAI model name
- `DATABASE_URL`: placeholder for persistent storage backing submissions and results
- `BLOB_READ_WRITE_TOKEN`: placeholder for upload storage when screenshot handling moves beyond in-memory flow

## Local Development

```bash
npm install
npm run dev
```

Run tests:

```bash
npm test
```

Build locally:

```bash
npm run build
```

## Current State

Implemented:
- landing page and submission shell
- shared schemas for submissions, evidence, verdicts, and reply drafts
- submission intake route
- submission status and processing routes
- provenance normalization with OCR adapter boundary
- xAI multi-agent orchestration with `web_search` and `x_search`
- deterministic result validation
- in-memory repositories for submissions and results
- automatic queued-job processing from the result page
- result report UI and `/check/[id]` page
- Playwright end-to-end tests

Not implemented yet:
- durable background job infrastructure for long-running production workloads
- durable database/storage integration
- screenshot upload transport
- Vercel deployment wiring
