import { z } from "zod";

export const sourceTypeValues = [
  "primary",
  "secondary",
  "official_dataset",
  "archival",
  "user_supplied"
] as const;

type SourceType = (typeof sourceTypeValues)[number];
const sourceTypeSet = new Set<string>(sourceTypeValues);

export const sourceTypeSchema = z.string().transform((v): SourceType => {
  const normalized = v.toLowerCase().trim();
  return sourceTypeSet.has(normalized)
    ? (normalized as SourceType)
    : "secondary";
});

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

type VerdictLabel = (typeof verdictLabelValues)[number];
const verdictLabelSet = new Set<string>(verdictLabelValues);

export const verdictLabelSchema = z.string().transform((v): VerdictLabel => {
  const normalized = v.toLowerCase().trim();
  return verdictLabelSet.has(normalized)
    ? (normalized as VerdictLabel)
    : "insufficient_evidence";
});

/** Accept ISO datetime, date-only, or fallback to empty string. */
const flexibleDateSchema = z
  .string()
  .transform((v) => {
    if (!v || v.trim() === "") return "";
    if (/^\d{4}-\d{2}-\d{2}T/.test(v)) return v;
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return `${v}T00:00:00.000Z`;
    if (/^\d{4}-\d{2}$/.test(v)) return `${v}-01T00:00:00.000Z`;
    return v;
  });

/** Validate URL with fallback — avoids Zod 4 .url()/.catch() incompatibility */
const flexibleUrl = z.string().transform((v) => {
  try {
    new URL(v);
    return v;
  } catch {
    return "https://unknown";
  }
});

/** Clamp a number to [0, 1] with fallback */
const clampScore = z.unknown().transform((v) => {
  const n = Number(v);
  if (Number.isNaN(n)) return 0.5;
  return Math.max(0, Math.min(1, n));
});

/** Non-empty string with fallback */
const stringWithFallback = (fallback: string) =>
  z.unknown().transform((v) =>
    typeof v === "string" && v.trim().length > 0 ? v : fallback
  );

export const evidenceItemSchema = z.object({
  id: z.string().min(1),
  claimId: z.string().min(1),
  sourceUrl: flexibleUrl,
  sourceTitle: z.string().min(1),
  sourceType: sourceTypeSchema,
  publisher: stringWithFallback("Unknown"),
  publicationDate: flexibleDateSchema,
  excerpt: z.string().min(1),
  relevanceScore: clampScore
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
  confidence: clampScore,
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
