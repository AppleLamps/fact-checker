# Fact Checker Website Design

**Date:** 2026-03-29

## Goal

Build a Vercel-hosted website that accepts an X post URL, pasted text, or screenshots and produces:
- a neutral, evidence-first fact check
- a separate evidence-backed reply draft

The system should borrow the discipline of Community Notes without copying its exact crowd-ranking model in v1.

## Product Scope

### Inputs

- X post URL
- pasted post text
- screenshot upload

### Outputs

- structured fact-check report
- separately labeled reply draft
- provenance and evidence limits

### Core Rules

- Any post can be submitted.
- The system must support a `not_fact_checkable` outcome for opinion, satire, prediction, or vague rhetoric.
- Primary sources are preferred.
- Reputable secondary reporting is allowed only when primary sources are unavailable.
- The reply draft must only use claims that passed evidence checks.

## Community Notes Principles To Reuse

The product should align with the parts of Community Notes that create trust:

- helpful context must be sourced, relevant, clear, and neutral
- unsupported or weakly supported claims should not be elevated confidently
- disagreement and conflicting evidence must be represented explicitly
- evidence quality and note quality should be distinct from popularity
- system-level guardrails should exist for low-quality outputs

The product should not imitate a partisan or persuasion-first system. It should identify manipulative framing from any source and explain why the evidence does or does not support the post.

## User Experience

### Submission Flow

1. User submits an X URL, pasted text, screenshot, or a combination.
2. App normalizes the input into a single submission record.
3. App shows the extracted text and provenance before or alongside the result.
4. Backend runs the research pipeline asynchronously.
5. Result page renders both artifacts:
   - Fact Check
   - Reply Draft

### Result Page Sections

- submission summary
- extracted claims
- evidence table
- per-claim verdicts
- post-level summary
- reply draft
- limitations and uncertainty

### Tone

- Fact Check: neutral, direct, source-heavy
- Reply Draft: concise and forceful when evidence is strong, but still bounded by verified findings

## System Architecture

### Frontend

Use Next.js on Vercel with an App Router UI.

Key surfaces:
- landing page with submission form
- job/result page
- upload support for screenshots

### Backend

Use server routes / server actions to:
- validate input
- store submission/job state
- perform OCR when needed
- invoke xAI Responses API
- validate returned structured data
- persist result artifacts

### AI Orchestration

Use xAI Responses API multi-agent mode for research.

Primary tools:
- `x_search` for post/thread/account context
- `web_search` for outside evidence
- `code_execution` optionally for timelines, quote alignment, and lightweight data checks

The model should return structured JSON, not final presentation markup.

### Deterministic Validation Layer

Server-side validation must reject or downgrade results when:
- evidence items do not map to claims
- evidence is stale for a time-sensitive claim
- source type is too weak for the confidence asserted
- reply draft introduces facts not present in approved verdicts

## Data Model

### Submission

- id
- input_type
- original_url
- pasted_text
- uploaded_image_paths
- extracted_text
- provenance_label
- provenance_confidence
- status

### Claim

- id
- submission_id
- claim_text
- claim_type
- fact_checkability

### Evidence

- id
- claim_id
- source_url
- source_title
- source_type
- publisher
- publication_date
- excerpt
- relevance_score

### Verdict

- id
- claim_id
- label
- confidence
- rationale
- manipulation_flags

### Result

- submission_id
- post_level_summary
- reply_draft
- limitations

## Verdict Taxonomy

Per-claim labels:
- `supported`
- `unsupported`
- `misleading_by_omission`
- `missing_context`
- `outdated`
- `mixed_evidence`
- `not_fact_checkable`
- `insufficient_evidence`

Manipulation/tactic flags:
- cherry_picking
- clipped_quote
- missing_denominator
- old_media_reused
- correlation_as_causation
- headline_overclaim
- weak_source_laundering

## Safety And Quality Rules

- No partisan hardcoding.
- No invented certainty.
- No source-free reply drafts.
- If evidence is weak or conflicting, the report must say so.
- If the post is not fact-checkable, the reply draft should pivot to that limitation rather than fake a factual takedown.

## Testing Strategy

The first build should include tests for:
- URL/text/screenshot submission validation
- OCR fallback parsing
- claim extraction schema validation
- evidence-to-claim mapping validation
- reply-draft constraint enforcement
- result rendering for strong, mixed, and non-fact-checkable cases

## V1 Boundary

Included:
- single submission flow
- asynchronous fact-check job processing
- structured fact-check result
- reply draft generation
- provenance handling

Excluded:
- community voting
- contributor reputation
- public note ranking
- user accounts unless needed for basic rate limiting/admin use

## Future Extensions

- community challenge/rating layer
- revision history on fact checks
- moderation/admin review tools
- saved collections of checks
- shareable public note cards
