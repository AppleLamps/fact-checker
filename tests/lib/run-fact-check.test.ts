import { describe, expect, it, vi } from "vitest";
import { runFactCheck } from "../../src/lib/fact-check/run-fact-check";

const normalizedSubmission = {
  inputType: "mixed" as const,
  xUrl: "https://x.com/example/status/123",
  pastedText: "California banned gas stoves statewide.",
  uploadedImages: [],
  extractedText: "California banned gas stoves statewide.",
  provenanceLabel: "mixed_with_direct_x_url" as const,
  provenanceConfidence: 0.92
};

describe("runFactCheck", () => {
  it("sends structured instructions through the xAI client", async () => {
    const call = vi.fn().mockResolvedValue({
      submissionSummary: "A post claims California banned gas stoves statewide.",
      postLevelSummary: "The post exaggerates standards policy into a ban.",
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
          excerpt: "The policy concerns standards and does not impose a statewide ban.",
          relevanceScore: 0.94
        }
      ],
      verdicts: [
        {
          claimId: "claim-1",
          label: "missing_context",
          confidence: 0.84,
          rationale: "The post inflates standards changes into an outright ban.",
          evidenceIds: ["evidence-1"],
          manipulationFlags: ["headline_overclaim"]
        }
      ],
      replyDraft: {
        headline: "This post overstates the policy.",
        body: "There is no statewide gas-stove ban here. The source shows standards changes, not a blanket prohibition.",
        supportedClaimIds: ["claim-1"]
      },
      limitations: ["The post cites no enacted statewide ban text."]
    });

    await runFactCheck(normalizedSubmission, {
      responses: {
        create: call
      }
    });

    expect(call).toHaveBeenCalledOnce();
    expect(call.mock.calls[0][0].model).toBe("grok-4.20-multi-agent-beta-0309");
    expect(call.mock.calls[0][0].input[0].content).toContain("Return only JSON");
    expect(call.mock.calls[0][0].input[0].content).toContain("reply_draft");
    expect(call.mock.calls[0][0].input[0].content).toContain("verified evidence");
    expect(call.mock.calls[0][0].tools).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "web_search" }),
        expect.objectContaining({ type: "x_search" })
      ])
    );
  });

  it("requests JSON output from the Responses API", async () => {
    const call = vi.fn().mockResolvedValue({
      submissionSummary: "summary",
      postLevelSummary: "summary",
      claims: [
        {
          id: "claim-1",
          text: "Claim",
          factCheckable: true
        }
      ],
      evidence: [
        {
          id: "evidence-1",
          claimId: "claim-1",
          sourceUrl: "https://example.com/source",
          sourceTitle: "Source",
          sourceType: "primary",
          publisher: "Publisher",
          publicationDate: "2026-03-01T00:00:00.000Z",
          excerpt: "Source text",
          relevanceScore: 0.9
        }
      ],
      verdicts: [
        {
          claimId: "claim-1",
          label: "supported",
          confidence: 0.9,
          rationale: "Supported by evidence.",
          evidenceIds: ["evidence-1"],
          manipulationFlags: []
        }
      ],
      replyDraft: {
        headline: "Headline",
        body: "Body",
        supportedClaimIds: ["claim-1"]
      },
      limitations: []
    });

    await runFactCheck(normalizedSubmission, {
      responses: {
        create: call
      }
    });

    expect(call.mock.calls[0][0].text).toEqual({
      format: {
        type: "json_object"
      }
    });
    expect(call.mock.calls[0][0].input).toEqual([
      expect.objectContaining({
        role: "user"
      })
    ]);
  });

  it("returns a validated result with separate fact-check and reply fields", async () => {
    const result = await runFactCheck(normalizedSubmission, {
      responses: {
        create: vi.fn().mockResolvedValue({
          output: [
            {
              type: "message",
              content: [
                {
                  type: "output_text",
                  text: JSON.stringify({
                    submissionSummary: "summary",
                    postLevelSummary: "summary",
                    claims: [
                      {
                        id: "claim-1",
                        text: "Claim",
                        factCheckable: true
                      }
                    ],
                    evidence: [
                      {
                        id: "evidence-1",
                        claimId: "claim-1",
                        sourceUrl: "https://example.com/source",
                        sourceTitle: "Source",
                        sourceType: "primary",
                        publisher: "Publisher",
                        publicationDate: "2026-03-01T00:00:00.000Z",
                        excerpt: "Source text",
                        relevanceScore: 0.9
                      }
                    ],
                    verdicts: [
                      {
                        claimId: "claim-1",
                        label: "supported",
                        confidence: 0.9,
                        rationale: "Supported by evidence.",
                        evidenceIds: ["evidence-1"],
                        manipulationFlags: []
                      }
                    ],
                    replyDraft: {
                      headline: "Headline",
                      body: "Body",
                      supportedClaimIds: ["claim-1"]
                    },
                    limitations: []
                  })
                }
              ]
            }
          ]
        })
      }
    });

    expect(result.postLevelSummary).toBe("summary");
    expect(result.replyDraft.headline).toBe("Headline");
    expect(result.verdicts).toHaveLength(1);
  });

  it("rejects reply content that cites unknown claims", async () => {
    await expect(
      runFactCheck(normalizedSubmission, {
        responses: {
          create: vi.fn().mockResolvedValue({
            submissionSummary: "summary",
            postLevelSummary: "summary",
            claims: [
              {
                id: "claim-1",
                text: "Claim",
                factCheckable: true
              }
            ],
            evidence: [
              {
                id: "evidence-1",
                claimId: "claim-1",
                sourceUrl: "https://example.com/source",
                sourceTitle: "Source",
                sourceType: "primary",
                publisher: "Publisher",
                publicationDate: "2026-03-01T00:00:00.000Z",
                excerpt: "Source text",
                relevanceScore: 0.9
              }
            ],
            verdicts: [
              {
                claimId: "claim-1",
                label: "supported",
                confidence: 0.9,
                rationale: "Supported by evidence.",
                evidenceIds: ["evidence-1"],
                manipulationFlags: []
              }
            ],
            replyDraft: {
              headline: "Headline",
              body: "Body",
              supportedClaimIds: ["claim-999"]
            },
            limitations: []
          })
        }
      })
    ).rejects.toThrow(/unknown claim/i);
  });
});
