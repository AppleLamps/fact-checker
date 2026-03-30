import { z } from "zod";

export const sourceTypeValues = [
  "primary",
  "secondary",
  "official_dataset",
  "archival",
  "user_supplied"
] as const;

export const sourceTypeSchema = z
  .string()
  .transform((v) => v.toLowerCase().trim())
  .pipe(z.enum(sourceTypeValues).catch("secondary"));

export const verdictLabelValues = [
  "supported",
  "unsupported",
  "misleading_by_omission",
  "missing_context",
  "outdated",
  "mixed_evidence",
  "not_fact_checkable",
  "insufficient_evidence"
] as const;

export const verdictLabelSchema = z
  .string()
  .transform((v) => v.toLowerCase().trim())
  .pipe(z.enum(verdictLabelValues).catch("insufficient_evidence"));

/** Accept ISO datetime, date-only, or fallback to empty string. */
const flexibleDateSchema = z
  .string()
  .transform((v) => {
    if (!v || v.trim() === "") return "";
    // Already valid ISO datetime
    if (/^\d{4}-\d{2}-\d{2}T/.test(v)) return v;
    // Date-only → midnight UTC
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return `${v}T00:00:00.000Z`;
    // Year-month only
    if (/^\d{4}-\d{2}$/.test(v)) return `${v}-01T00:00:00.000Z`;
    return v;
  });

export const evidenceItemSchema = z.object({
  id: z.string().min(1),
  claimId: z.string().min(1),
  sourceUrl: z.string().url().catch("https://unknown"),
  sourceTitle: z.string().min(1),
  sourceType: sourceTypeSchema,
  publisher: z.string().min(1).catch("Unknown"),
  publicationDate: flexibleDateSchema,
  excerpt: z.string().min(1),
  relevanceScore: z.number().min(0).max(1).catch(0.5)
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
  confidence: z.number().min(0).max(1).catch(0.5),
  rationale: z.string().min(1),
  evidenceIds: z.array(z.string().min(1)).default([]),
  manipulationFlags: z.array(z.string().min(1)).default([])
});

export const replyDraftSchema = z.object({
  headline: z.string().min(1),
  body: z.string().min(1),
  supportedClaimIds: z.array(z.string().min(1)).default([])
});

export const aiFactCheckResultSchema = z.object({
  submissionSummary: z.string().min(1),
  postLevelSummary: z.string().min(1),
  claims: z.array(claimSchema).min(1),
  evidence: z.array(evidenceItemSchema),
  verdicts: z.array(verdictSchema).min(1),
  replyDraft: replyDraftSchema,
  limitations: z
    .union([z.array(z.string()), z.string().transform((s) => (s ? [s] : []))])
    .default([])
});

export type EvidenceItem = z.infer<typeof evidenceItemSchema>;
export type Verdict = z.infer<typeof verdictSchema>;
export type AIFactCheckResult = z.infer<typeof aiFactCheckResultSchema>;
