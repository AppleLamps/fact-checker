# Fact Checker Website Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Vercel-hosted Next.js application that accepts X URLs, pasted text, and screenshots, runs an evidence-first Grok-powered fact-check pipeline, and renders both a neutral fact check and a constrained reply draft.

**Architecture:** Start with a single Next.js App Router app using TypeScript, Tailwind, and a small persistence layer for submissions and results. Keep AI orchestration behind a server-only service that produces structured JSON, then validate and render that JSON through deterministic application logic.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Zod, xAI Responses API, OCR library/service, Postgres or SQLite-compatible local dev store, Vitest or Jest, Playwright.

---

### Task 1: Scaffold The App

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `.env.example`

**Step 1: Write the failing test**

Create a smoke test for the landing page render.

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL because the app and test setup do not exist yet.

**Step 3: Write minimal implementation**

Scaffold a Next.js App Router project with a landing page containing:
- headline
- submission form shell
- placeholder result explanation

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS for the landing-page smoke test.

**Step 5: Commit**

```bash
git add .
git commit -m "feat: scaffold fact checker app"
```

### Task 2: Define Shared Schemas

**Files:**
- Create: `src/lib/schema/submission.ts`
- Create: `src/lib/schema/result.ts`
- Create: `src/lib/schema/ai.ts`
- Test: `tests/schema/result-schema.test.ts`

**Step 1: Write the failing test**

Write tests that validate:
- accepted input types
- verdict labels
- evidence item requirements
- reply draft constraints in the structured output contract

**Step 2: Run test to verify it fails**

Run: `npm test -- result-schema`
Expected: FAIL because schema files do not exist.

**Step 3: Write minimal implementation**

Implement Zod schemas for:
- submission payload
- AI raw response payload
- validated app result payload

**Step 4: Run test to verify it passes**

Run: `npm test -- result-schema`
Expected: PASS.

**Step 5: Commit**

```bash
git add tests/schema/result-schema.test.ts src/lib/schema
git commit -m "feat: add shared validation schemas"
```

### Task 3: Build Submission Intake

**Files:**
- Create: `app/api/submissions/route.ts`
- Create: `src/lib/submissions/create-submission.ts`
- Create: `src/components/submission-form.tsx`
- Test: `tests/api/submissions-route.test.ts`

**Step 1: Write the failing test**

Write tests covering:
- URL-only submission
- text-only submission
- screenshot metadata submission
- rejection of empty requests

**Step 2: Run test to verify it fails**

Run: `npm test -- submissions-route`
Expected: FAIL because the route and parser do not exist.

**Step 3: Write minimal implementation**

Implement a route and UI form that:
- accepts URL, text, and image upload placeholders
- validates at least one input
- creates a submission record with `queued` status

**Step 4: Run test to verify it passes**

Run: `npm test -- submissions-route`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/api/submissions/route.ts src/lib/submissions src/components/submission-form.tsx tests/api/submissions-route.test.ts
git commit -m "feat: add submission intake flow"
```

### Task 4: Add OCR And Provenance Normalization

**Files:**
- Create: `src/lib/ocr/extract-text.ts`
- Create: `src/lib/submissions/normalize-input.ts`
- Test: `tests/lib/normalize-input.test.ts`

**Step 1: Write the failing test**

Write tests for:
- URL provenance labels
- pasted-text provenance labels
- screenshot OCR fallback
- mixed-input precedence rules

**Step 2: Run test to verify it fails**

Run: `npm test -- normalize-input`
Expected: FAIL because normalization logic does not exist.

**Step 3: Write minimal implementation**

Implement normalization that produces:
- `extracted_text`
- `provenance_label`
- `provenance_confidence`

Use a stubbed OCR adapter interface first so provider selection stays replaceable.

**Step 4: Run test to verify it passes**

Run: `npm test -- normalize-input`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/ocr src/lib/submissions/normalize-input.ts tests/lib/normalize-input.test.ts
git commit -m "feat: normalize submission provenance"
```

### Task 5: Implement xAI Research Orchestrator

**Files:**
- Create: `src/lib/xai/client.ts`
- Create: `src/lib/fact-check/run-fact-check.ts`
- Create: `src/lib/fact-check/prompts.ts`
- Test: `tests/lib/run-fact-check.test.ts`

**Step 1: Write the failing test**

Write tests that assert the orchestrator:
- sends structured instructions
- requests JSON output
- separates fact-check and reply-draft responsibilities
- rejects reply content not supported by approved verdicts

**Step 2: Run test to verify it fails**

Run: `npm test -- run-fact-check`
Expected: FAIL because the orchestrator does not exist.

**Step 3: Write minimal implementation**

Implement a server-only xAI wrapper using the Responses API and a prompt contract that asks for:
- claims
- evidence
- verdicts
- post summary
- reply brief

Leave actual multi-agent tuning behind a config object so model changes are isolated.

**Step 4: Run test to verify it passes**

Run: `npm test -- run-fact-check`
Expected: PASS with mocked xAI responses.

**Step 5: Commit**

```bash
git add src/lib/xai src/lib/fact-check tests/lib/run-fact-check.test.ts
git commit -m "feat: add xai fact-check orchestrator"
```

### Task 6: Add Deterministic Validation

**Files:**
- Create: `src/lib/fact-check/validate-result.ts`
- Test: `tests/lib/validate-result.test.ts`

**Step 1: Write the failing test**

Write tests that fail when:
- verdict confidence exceeds source quality
- claim evidence is missing
- dates are stale on current-event claims
- reply draft adds unsupported facts

**Step 2: Run test to verify it fails**

Run: `npm test -- validate-result`
Expected: FAIL because validator logic does not exist.

**Step 3: Write minimal implementation**

Implement deterministic checks and downgrade logic so unsafe or unsupported AI output cannot be shown as-is.

**Step 4: Run test to verify it passes**

Run: `npm test -- validate-result`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/fact-check/validate-result.ts tests/lib/validate-result.test.ts
git commit -m "feat: validate ai fact-check output"
```

### Task 7: Persist Jobs And Results

**Files:**
- Create: `src/lib/db/*`
- Create: `src/lib/repositories/submissions.ts`
- Create: `src/lib/repositories/results.ts`
- Test: `tests/repositories/submissions.test.ts`

**Step 1: Write the failing test**

Write repository tests for:
- create submission
- update job status
- save validated result
- fetch result page data

**Step 2: Run test to verify it fails**

Run: `npm test -- repositories`
Expected: FAIL because persistence code does not exist.

**Step 3: Write minimal implementation**

Implement a small repository layer with a dev-friendly database choice and clear interfaces for later migration.

**Step 4: Run test to verify it passes**

Run: `npm test -- repositories`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/db src/lib/repositories tests/repositories/submissions.test.ts
git commit -m "feat: persist submissions and results"
```

### Task 8: Build Result Pages

**Files:**
- Create: `app/check/[id]/page.tsx`
- Create: `src/components/fact-check-report.tsx`
- Create: `src/components/reply-draft.tsx`
- Create: `src/components/evidence-table.tsx`
- Test: `tests/ui/fact-check-report.test.tsx`

**Step 1: Write the failing test**

Write UI tests asserting that:
- fact-check report and reply draft render separately
- limitations are visible
- source metadata is visible
- non-fact-checkable outcomes are rendered correctly

**Step 2: Run test to verify it fails**

Run: `npm test -- fact-check-report`
Expected: FAIL because result UI does not exist.

**Step 3: Write minimal implementation**

Render a result page with clear separation between:
- evidence-first report
- reply draft
- limitations

**Step 4: Run test to verify it passes**

Run: `npm test -- fact-check-report`
Expected: PASS.

**Step 5: Commit**

```bash
git add app/check/[id]/page.tsx src/components tests/ui/fact-check-report.test.tsx
git commit -m "feat: render fact check results"
```

### Task 9: Add End-To-End Flow Tests

**Files:**
- Create: `tests/e2e/submission-flow.spec.ts`
- Modify: `playwright.config.ts`

**Step 1: Write the failing test**

Write Playwright tests for:
- submit pasted text and receive a result
- submit URL and see queued state
- render mixed-evidence result

**Step 2: Run test to verify it fails**

Run: `npx playwright test tests/e2e/submission-flow.spec.ts`
Expected: FAIL because e2e setup is incomplete.

**Step 3: Write minimal implementation**

Add the missing wiring needed for the app to pass the end-to-end happy path with mocked AI responses.

**Step 4: Run test to verify it passes**

Run: `npx playwright test tests/e2e/submission-flow.spec.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add tests/e2e/submission-flow.spec.ts playwright.config.ts
git commit -m "test: add submission flow e2e coverage"
```

### Task 10: Prepare For Vercel Deployment

**Files:**
- Modify: `.env.example`
- Create: `README.md`
- Create: `vercel.json` if needed

**Step 1: Write the failing test**

Write a lightweight configuration check that asserts required environment variables are documented.

**Step 2: Run test to verify it fails**

Run: `npm test -- config`
Expected: FAIL because deployment configuration is incomplete.

**Step 3: Write minimal implementation**

Document and configure:
- `XAI_API_KEY`
- storage/database env vars
- upload storage env vars
- local development steps
- Vercel deployment assumptions

**Step 4: Run test to verify it passes**

Run: `npm test -- config`
Expected: PASS.

**Step 5: Commit**

```bash
git add .env.example README.md vercel.json
git commit -m "docs: prepare vercel deployment config"
```
