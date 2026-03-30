import { describe, expect, it } from "vitest";
import { z } from "zod";
import { submissionPayloadSchema } from "../../src/lib/schema/submission";
import { aiFactCheckResultSchema } from "../../src/lib/schema/ai";
import { validatedResultSchema, verdictLabelSchema } from "../../src/lib/schema/result";

describe("submission payload schema", () => {
  it("accepts the supported input types", () => {
    const parse = (inputType: string) =>
      submissionPayloadSchema.parse({
        inputType,
        uploadedImages: []
      });

    expect(parse("x_url").inputType).toBe("x_url");
    expect(parse("pasted_text").inputType).toBe("pasted_text");
    expect(parse("screenshot").inputType).toBe("screenshot");
    expect(parse("mixed").inputType).toBe("mixed");
  });

  it("rejects unsupported input types", () => {
    expect(() =>
      submissionPayloadSchema.parse({
        inputType: "thread",
        uploadedImages: []
      })
    ).toThrow(z.ZodError);
  });
});

describe("fact check result schemas", () => {
  const baseResult = {
    submissionSummary: "A post claims a city banned gas stoves statewide.",
    postLevelSummary: "The claim overstates a local policy discussion into a statewide ban.",
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
        publicationDate: "2026-03-01T00:00:00.000Z",
        excerpt: "The rule targets emissions standards for new appliances, not an outright statewide ban.",
        relevanceScore: 0.92
      }
    ],
    verdicts: [
      {
        claimId: "claim-1",
        label: "missing_context",
        confidence: 0.81,
        rationale: "The post inflates a standards debate into a total ban.",
        evidenceIds: ["evidence-1"],
        manipulationFlags: ["headline_overclaim"]
      }
    ],
    replyDraft: {
      headline: "This post overstates the policy.",
      body: "There is no statewide gas-stove ban here. The cited policy concerns standards, not a blanket prohibition.",
      supportedClaimIds: ["claim-1"]
    },
    limitations: ["No enacted statewide ban text was cited by the post."]
  };

  it("accepts the supported verdict labels", () => {
    expect(verdictLabelSchema.parse("supported")).toBe("supported");
    expect(verdictLabelSchema.parse("unsupported")).toBe("unsupported");
    expect(verdictLabelSchema.parse("misleading_by_omission")).toBe("misleading_by_omission");
    expect(verdictLabelSchema.parse("missing_context")).toBe("missing_context");
    expect(verdictLabelSchema.parse("outdated")).toBe("outdated");
    expect(verdictLabelSchema.parse("mixed_evidence")).toBe("mixed_evidence");
    expect(verdictLabelSchema.parse("not_fact_checkable")).toBe("not_fact_checkable");
    expect(verdictLabelSchema.parse("insufficient_evidence")).toBe("insufficient_evidence");
  });

  it("falls back gracefully for invalid evidence fields", () => {
    const result = aiFactCheckResultSchema.parse({
      ...baseResult,
      evidence: [
        {
          ...baseResult.evidence[0],
          sourceUrl: "not-a-url"
        }
      ]
    });

    expect(result.evidence[0].sourceUrl).toBe("https://unknown");
  });

  it("filters out reply draft references to unknown claims", () => {
    const result = validatedResultSchema.parse({
      ...baseResult,
      replyDraft: {
        ...baseResult.replyDraft,
        supportedClaimIds: ["claim-2"]
      }
    });

    expect(result.replyDraft.supportedClaimIds).toEqual([]);
  });

  it("filters out reply draft references to not-fact-checkable claims", () => {
    const result = validatedResultSchema.parse({
      ...baseResult,
      verdicts: [
        {
          ...baseResult.verdicts[0],
          label: "not_fact_checkable"
        }
      ]
    });

    expect(result.replyDraft.supportedClaimIds).toEqual([]);
  });
});
