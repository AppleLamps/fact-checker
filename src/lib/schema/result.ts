import { aiFactCheckResultSchema, verdictLabelSchema } from "./ai";

export const validatedResultSchema = aiFactCheckResultSchema.transform(
  (data) => {
    const claimIds = new Set(data.claims.map((claim) => claim.id));

    // Filter out evidence referencing claims the AI didn't produce
    const evidence = data.evidence.filter((item) => claimIds.has(item.claimId));
    const evidenceIds = new Set(evidence.map((item) => item.id));

    // Filter out verdicts referencing unknown claims, clean evidence refs
    const verdicts = data.verdicts
      .filter((verdict) => claimIds.has(verdict.claimId))
      .map((verdict) => ({
        ...verdict,
        evidenceIds: verdict.evidenceIds.filter((id) => evidenceIds.has(id))
      }));

    const verdictsByClaimId = new Map(verdicts.map((v) => [v.claimId, v]));

    // Filter out reply draft claims that don't exist or are not fact-checkable
    const supportedClaimIds = data.replyDraft.supportedClaimIds.filter((claimId) => {
      const verdict = verdictsByClaimId.get(claimId);
      return verdict && verdict.label !== "not_fact_checkable";
    });

    return {
      ...data,
      evidence,
      verdicts,
      replyDraft: { ...data.replyDraft, supportedClaimIds }
    };
  }
);

export { verdictLabelSchema };

export type ValidatedResult = z.infer<typeof validatedResultSchema>;
