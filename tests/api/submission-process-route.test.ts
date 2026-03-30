import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetMemoryStore } from "../../src/lib/db/memory";
import { createSubmissionRecord, getSubmissionById } from "../../src/lib/repositories/submissions";

vi.mock("../../src/lib/fact-check/run-fact-check", () => ({
  runFactCheck: vi.fn()
}));

describe("submission processing routes", () => {
  beforeEach(() => {
    resetMemoryStore();
    vi.resetAllMocks();
  });

  it("processes a queued submission and saves a result", async () => {
    const { POST } = await import("../../app/api/submissions/[id]/process/route");
    const { GET } = await import("../../app/api/submissions/[id]/route");
    const { runFactCheck } = await import("../../src/lib/fact-check/run-fact-check");

    const submission = createSubmissionRecord({
      inputType: "pasted_text",
      pastedText: "Claim text",
      uploadedImages: []
    });

    vi.mocked(runFactCheck).mockResolvedValue({
      submissionSummary: "summary",
      postLevelSummary: "summary",
      claims: [
        {
          id: "claim-1",
          text: "Claim text",
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

    const processResponse = await POST(new Request(`http://localhost/api/submissions/${submission.id}/process`, {
      method: "POST"
    }), {
      params: Promise.resolve({ id: submission.id })
    });

    expect(processResponse.status).toBe(200);
    expect(getSubmissionById(submission.id)?.status).toBe("completed");

    const statusResponse = await GET(new Request(`http://localhost/api/submissions/${submission.id}`), {
      params: Promise.resolve({ id: submission.id })
    });

    expect(statusResponse.status).toBe(200);
    const body = await statusResponse.json();
    expect(body.submission.status).toBe("completed");
    expect(body.result.postLevelSummary).toBe("summary");
  });

  it("returns 404 when processing an unknown submission", async () => {
    const { POST } = await import("../../app/api/submissions/[id]/process/route");

    const response = await POST(new Request("http://localhost/api/submissions/missing/process", {
      method: "POST"
    }), {
      params: Promise.resolve({ id: "missing" })
    });

    expect(response.status).toBe(404);
  });
});
