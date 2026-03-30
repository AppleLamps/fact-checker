import { validatedResultSchema, type ValidatedResult } from "@/lib/schema/result";

const sourceConfidenceCeilings = {
  primary: 0.95,
  official_dataset: 0.95,
  archival: 0.8,
  secondary: 0.75,
  user_supplied: 0.6
} as const;

const currentEventPattern = /\b(today|tonight|this week|now|currently|just|breaking)\b/i;
const STALE_EVIDENCE_DAYS = 45;

export function validateFactCheckResult(input: unknown): ValidatedResult {
  const result = validatedResultSchema.parse(input);
  const evidenceById = new Map(result.evidence.map((item) => [item.id, item]));
  const verdictByClaimId = new Map(result.verdicts.map((verdict) => [verdict.claimId, verdict]));

  for (const verdict of result.verdicts) {
    if (verdict.label === "not_fact_checkable" || verdict.label === "insufficient_evidence") {
      continue;
    }

    if (verdict.evidenceIds.length === 0) {
      throw new Error(`Verdict for ${verdict.claimId} must cite evidence.`);
    }

    const confidenceCeiling = verdict.evidenceIds.reduce((ceiling, evidenceId) => {
      const evidence = evidenceById.get(evidenceId);

      if (!evidence) {
        return ceiling;
      }

      const sourceType = evidence.sourceType as keyof typeof sourceConfidenceCeilings;
      return Math.min(ceiling, sourceConfidenceCeilings[sourceType] ?? 0.75);
    }, 1);

    if (verdict.confidence > confidenceCeiling) {
      throw new Error(
        `Verdict confidence exceeds source quality for ${verdict.claimId}.`
      );
    }
  }

  for (const claim of result.claims) {
    if (!currentEventPattern.test(claim.text)) {
      continue;
    }

    const verdict = verdictByClaimId.get(claim.id);
    const newestEvidenceDate = verdict?.evidenceIds
      .map((evidenceId) => evidenceById.get(evidenceId))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map((item) => new Date(item.publicationDate).getTime())
      .sort((left, right) => right - left)[0];

    if (!newestEvidenceDate) {
      continue;
    }

    const ageInDays = (Date.now() - newestEvidenceDate) / (1000 * 60 * 60 * 24);

    if (ageInDays > STALE_EVIDENCE_DAYS) {
      throw new Error(`Current-event claim ${claim.id} relies on stale evidence.`);
    }
  }

  for (const claimId of result.replyDraft.supportedClaimIds) {
    const verdict = verdictByClaimId.get(claimId);

    if (!verdict) {
      throw new Error(`Reply draft references unknown claim ${claimId}.`);
    }

    if (verdict.label === "not_fact_checkable" || verdict.label === "insufficient_evidence") {
      throw new Error(
        `Reply draft references unsupported claim ${claimId}.`
      );
    }
  }

  return result;
}
