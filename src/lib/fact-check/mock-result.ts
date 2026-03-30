import type { SubmissionRecord } from "@/lib/repositories/submissions";
import type { ValidatedResult } from "@/lib/schema/result";

function getExcerpt(submission: SubmissionRecord) {
  return (
    submission.pastedText ??
    submission.xUrl ??
    "User supplied screenshot of an X post."
  );
}

export function buildMockResult(submission: SubmissionRecord): ValidatedResult {
  const excerpt = getExcerpt(submission);
  const isMixedEvidence = excerpt.toLowerCase().includes("mixed evidence");

  return {
    submissionSummary: `Input type: ${submission.inputType}. Mock evidence generated for browser verification.`,
    postLevelSummary: isMixedEvidence
      ? "The submission has mixed evidence: parts of the claim are grounded, but the stronger record leaves important context unresolved."
      : "The submission overstates what the available evidence shows. The strongest source reviewed does not support the claim as presented.",
    claims: [
      {
        id: "claim-1",
        text: excerpt,
        factCheckable: true
      }
    ],
    evidence: [
      {
        id: "evidence-1",
        claimId: "claim-1",
        sourceUrl: "https://example.com/official-record",
        sourceTitle: "Official record",
        sourceType: "primary",
        publisher: "Example Records Office",
        publicationDate: "2026-03-25T00:00:00.000Z",
        excerpt: "The official record contradicts the post's central claim.",
        relevanceScore: 0.92
      }
    ],
    verdicts: [
      {
        claimId: "claim-1",
        label: isMixedEvidence ? "mixed_evidence" : "unsupported",
        confidence: isMixedEvidence ? 0.72 : 0.9,
        rationale: isMixedEvidence
          ? "Some reporting supports part of the claim, but the stronger record leaves important gaps unresolved."
          : "The available record does not support the post as written and provides conflicting context.",
        evidenceIds: ["evidence-1"],
        manipulationFlags: [isMixedEvidence ? "missing_denominator" : "headline_overclaim"]
      }
    ],
    replyDraft: {
      headline: isMixedEvidence
        ? "The evidence is mixed, not decisive."
        : "The strongest source does not support that claim.",
      body: isMixedEvidence
        ? "There’s some basis for the claim, but the post leaves out context that changes the takeaway. The evidence is mixed, not decisive."
        : "That post overstates the facts. The strongest source on the record does not support the claim as written and adds missing context.",
      supportedClaimIds: ["claim-1"]
    },
    limitations: [
      "This is a deterministic mock result used for local and end-to-end testing.",
      "No live xAI research was run for this result."
    ]
  };
}
