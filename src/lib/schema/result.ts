import { z } from "zod";
import { aiFactCheckResultSchema, verdictLabelSchema } from "./ai";

export const validatedResultSchema = aiFactCheckResultSchema.superRefine(
  ({ claims, evidence, verdicts, replyDraft }, context) => {
    const claimIds = new Set(claims.map((claim) => claim.id));
    const evidenceIds = new Set(evidence.map((item) => item.id));
    const verdictsByClaimId = new Map(verdicts.map((verdict) => [verdict.claimId, verdict]));

    for (const item of evidence) {
      if (!claimIds.has(item.claimId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Evidence references unknown claim: ${item.claimId}`,
          path: ["evidence"]
        });
      }
    }

    for (const verdict of verdicts) {
      if (!claimIds.has(verdict.claimId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Verdict references unknown claim: ${verdict.claimId}`,
          path: ["verdicts"]
        });
      }

      for (const evidenceId of verdict.evidenceIds) {
        if (!evidenceIds.has(evidenceId)) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Verdict references unknown evidence: ${evidenceId}`,
            path: ["verdicts"]
          });
        }
      }
    }

    for (const claimId of replyDraft.supportedClaimIds) {
      const verdict = verdictsByClaimId.get(claimId);

      if (!verdict) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Reply draft references unknown claim: ${claimId}`,
          path: ["replyDraft", "supportedClaimIds"]
        });
        continue;
      }

      if (verdict.label === "not_fact_checkable") {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Reply draft cannot cite not_fact_checkable claim: ${claimId}`,
          path: ["replyDraft", "supportedClaimIds"]
        });
      }
    }
  }
);

export { verdictLabelSchema };

export type ValidatedResult = z.infer<typeof validatedResultSchema>;
