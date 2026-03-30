import { describe, expect, it } from "vitest";
import { validateFactCheckResult } from "../../src/lib/fact-check/validate-result";

const baseResult = {
  submissionSummary: "A post claims a statewide gas stove ban exists.",
  postLevelSummary: "The post overstates appliance standards policy into a statewide ban.",
  claims: [
    {
      id: "claim-1",
      text: "California banned gas stoves statewide.",
      factCheckable: true
    }
  ],
  evidence: [
    {
      id: "evidence-1",
      claimId: "claim-1",
      sourceUrl: "https://www.energy.ca.gov/policy-update",
      sourceTitle: "State energy policy update",
      sourceType: "primary",
      publisher: "California Energy Commission",
      publicationDate: "2026-03-20T00:00:00.000Z",
      excerpt: "The rule changes appliance standards and does not impose a statewide ban.",
      relevanceScore: 0.93
    }
  ],
  verdicts: [
    {
      claimId: "claim-1",
      label: "missing_context" as const,
      confidence: 0.84,
      rationale: "The post inflates standards changes into a statewide ban.",
      evidenceIds: ["evidence-1"],
      manipulationFlags: ["headline_overclaim"]
    }
  ],
  replyDraft: {
    headline: "This post overstates the policy.",
    body: "There is no statewide gas-stove ban here. The cited source describes standards changes, not a blanket prohibition.",
    supportedClaimIds: ["claim-1"]
  },
  limitations: []
};

describe("validateFactCheckResult", () => {
  it("fails when verdict confidence exceeds source quality", () => {
    expect(() =>
      validateFactCheckResult({
        ...baseResult,
        evidence: [
          {
            ...baseResult.evidence[0],
            sourceType: "secondary"
          }
        ],
        verdicts: [
          {
            ...baseResult.verdicts[0],
            confidence: 0.95
          }
        ]
      })
    ).toThrow(/confidence/i);
  });

  it("fails when a claim has no evidence attached", () => {
    expect(() =>
      validateFactCheckResult({
        ...baseResult,
        verdicts: [
          {
            ...baseResult.verdicts[0],
            evidenceIds: []
          }
        ]
      })
    ).toThrow(/evidence/i);
  });

  it("fails when a current-event claim relies on stale evidence", () => {
    expect(() =>
      validateFactCheckResult({
        ...baseResult,
        claims: [
          {
            ...baseResult.claims[0],
            text: "Today California banned gas stoves statewide."
          }
        ],
        evidence: [
          {
            ...baseResult.evidence[0],
            publicationDate: "2025-01-01T00:00:00.000Z"
          }
        ]
      })
    ).toThrow(/stale/i);
  });

  it("fails when the reply draft adds unsupported facts", () => {
    expect(() =>
      validateFactCheckResult({
        ...baseResult,
        replyDraft: {
          ...baseResult.replyDraft,
          supportedClaimIds: ["claim-2"]
        }
      })
    ).toThrow(/reply draft/i);
  });
});
