import { z } from "zod";

export const sourceTypeSchema = z.enum([
  "primary",
  "secondary",
  "official_dataset",
  "archival",
  "user_supplied"
]);

export const verdictLabelSchema = z.enum([
  "supported",
  "unsupported",
  "misleading_by_omission",
  "missing_context",
  "outdated",
  "mixed_evidence",
  "not_fact_checkable",
  "insufficient_evidence"
]);

export const evidenceItemSchema = z.object({
  id: z.string().min(1),
  claimId: z.string().min(1),
  sourceUrl: z.string().url(),
  sourceTitle: z.string().min(1),
  sourceType: sourceTypeSchema,
  publisher: z.string().min(1),
  publicationDate: z.string().datetime({ offset: true }),
  excerpt: z.string().min(1),
  relevanceScore: z.number().min(0).max(1)
});

export const claimSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  factCheckable: z.boolean(),
  notes: z.string().min(1).optional()
});

export const verdictSchema = z.object({
  claimId: z.string().min(1),
  label: verdictLabelSchema,
  confidence: z.number().min(0).max(1),
  rationale: z.string().min(1),
  evidenceIds: z.array(z.string().min(1)).min(1),
  manipulationFlags: z.array(z.string().min(1)).default([])
});

export const replyDraftSchema = z.object({
  headline: z.string().min(1),
  body: z.string().min(1),
  supportedClaimIds: z.array(z.string().min(1)).min(1)
});

export const aiFactCheckResultSchema = z.object({
  submissionSummary: z.string().min(1),
  postLevelSummary: z.string().min(1),
  claims: z.array(claimSchema).min(1),
  evidence: z.array(evidenceItemSchema),
  verdicts: z.array(verdictSchema).min(1),
  replyDraft: replyDraftSchema,
  limitations: z.array(z.string().min(1)).default([])
});

export type EvidenceItem = z.infer<typeof evidenceItemSchema>;
export type Verdict = z.infer<typeof verdictSchema>;
export type AIFactCheckResult = z.infer<typeof aiFactCheckResultSchema>;
