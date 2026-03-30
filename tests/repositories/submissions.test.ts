import { beforeEach, describe, expect, it } from "vitest";
import { resetMemoryStore } from "../../src/lib/db/memory";
import {
  createSubmissionRecord,
  updateSubmissionStatus,
  getSubmissionById
} from "../../src/lib/repositories/submissions";
import {
  saveResultRecord,
  getResultBySubmissionId
} from "../../src/lib/repositories/results";

describe("submission and result repositories", () => {
  beforeEach(() => {
    resetMemoryStore();
  });

  it("creates a submission", () => {
    const submission = createSubmissionRecord({
      inputType: "x_url",
      xUrl: "https://x.com/example/status/123",
      uploadedImages: []
    });

    expect(submission.id).toBeTruthy();
    expect(submission.status).toBe("queued");
  });

  it("updates job status", () => {
    const submission = createSubmissionRecord({
      inputType: "pasted_text",
      pastedText: "Claim text",
      uploadedImages: []
    });

    const updated = updateSubmissionStatus(submission.id, "processing");

    expect(updated.status).toBe("processing");
  });

  it("saves a validated result", () => {
    const submission = createSubmissionRecord({
      inputType: "pasted_text",
      pastedText: "Claim text",
      uploadedImages: []
    });

    const result = saveResultRecord(submission.id, {
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

    expect(result.submissionId).toBe(submission.id);
  });

  it("fetches result page data", () => {
    const submission = createSubmissionRecord({
      inputType: "pasted_text",
      pastedText: "Claim text",
      uploadedImages: []
    });

    updateSubmissionStatus(submission.id, "completed");
    saveResultRecord(submission.id, {
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

    expect(getSubmissionById(submission.id)?.status).toBe("completed");
    expect(getResultBySubmissionId(submission.id)?.postLevelSummary).toBe("summary");
  });
});
