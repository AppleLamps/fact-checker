import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ResultRecord, SubmissionRecord } from "../../src/lib/db/types";
import {
  createSubmissionRecord,
  getSubmissionById,
  setSubmissionRepositoryAdapter
} from "../../src/lib/repositories/submissions";
import { setResultRepositoryAdapter } from "../../src/lib/repositories/results";

vi.mock("../../src/lib/fact-check/run-fact-check", () => ({
  runFactCheck: vi.fn()
}));

describe("submission processing routes", () => {
  const submissionStore = new Map<string, SubmissionRecord>();
  const resultStore = new Map<string, ResultRecord>();

  beforeEach(() => {
    vi.resetAllMocks();
    submissionStore.clear();
    resultStore.clear();
    setSubmissionRepositoryAdapter({
      async create(submission) {
        submissionStore.set(submission.id, submission);
        return submission;
      },
      async updateStatus(submissionId, status) {
        const existing = submissionStore.get(submissionId);

        if (!existing) {
          return null;
        }

        const updated = {
          ...existing,
          status
        };

        submissionStore.set(submissionId, updated);
        return updated;
      },
      async getById(submissionId) {
        return submissionStore.get(submissionId) ?? null;
      }
    });
    setResultRepositoryAdapter({
      async save(result) {
        resultStore.set(result.submissionId, result);
        return result;
      },
      async getBySubmissionId(submissionId) {
        return resultStore.get(submissionId) ?? null;
      }
    });
  });

  it("processes a queued submission and saves a result", async () => {
    const { POST } = await import("../../app/api/submissions/[id]/process/route");
    const { GET } = await import("../../app/api/submissions/[id]/route");
    const { runFactCheck } = await import("../../src/lib/fact-check/run-fact-check");

    const submission = await createSubmissionRecord({
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
    expect((await getSubmissionById(submission.id))?.status).toBe("completed");

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
