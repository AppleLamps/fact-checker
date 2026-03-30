import { beforeEach, describe, expect, it } from "vitest";
import {
  createSubmissionRecord,
  updateSubmissionStatus,
  getSubmissionById,
  setSubmissionRepositoryAdapter
} from "../../src/lib/repositories/submissions";
import {
  saveResultRecord,
  getResultBySubmissionId,
  setResultRepositoryAdapter
} from "../../src/lib/repositories/results";
import type {
  ResultRecord,
  SubmissionRecord
} from "../../src/lib/db/types";

type TestStore = {
  submissions: Map<string, SubmissionRecord>;
  results: Map<string, ResultRecord>;
};

function createTestStore(): TestStore {
  return {
    submissions: new Map<string, SubmissionRecord>(),
    results: new Map<string, ResultRecord>()
  };
}

function createTestAdapters(store: TestStore) {
  return {
    submissions: {
      async create(submission: SubmissionRecord) {
        store.submissions.set(submission.id, submission);
        return submission;
      },
      async updateStatus(submissionId: string, status: SubmissionRecord["status"]) {
        const existing = store.submissions.get(submissionId);

        if (!existing) {
          return null;
        }

        const updated = {
          ...existing,
          status
        };

        store.submissions.set(submissionId, updated);
        return updated;
      },
      async getById(submissionId: string) {
        return store.submissions.get(submissionId) ?? null;
      }
    },
    results: {
      async save(result: ResultRecord) {
        store.results.set(result.submissionId, result);
        return result;
      },
      async getBySubmissionId(submissionId: string) {
        return store.results.get(submissionId) ?? null;
      }
    }
  };
}

describe("submission and result repositories", () => {
  let store: TestStore;

  beforeEach(() => {
    store = createTestStore();
    const adapters = createTestAdapters(store);
    setSubmissionRepositoryAdapter(adapters.submissions);
    setResultRepositoryAdapter(adapters.results);
  });

  it("creates a submission", async () => {
    const submission = await createSubmissionRecord({
      inputType: "x_url",
      xUrl: "https://x.com/example/status/123",
      uploadedImages: []
    });

    expect(submission.id).toBeTruthy();
    expect(submission.status).toBe("queued");
  });

  it("updates job status", async () => {
    const submission = await createSubmissionRecord({
      inputType: "pasted_text",
      pastedText: "Claim text",
      uploadedImages: []
    });

    const updated = await updateSubmissionStatus(submission.id, "processing");

    expect(updated.status).toBe("processing");
  });

  it("saves a validated result", async () => {
    const submission = await createSubmissionRecord({
      inputType: "pasted_text",
      pastedText: "Claim text",
      uploadedImages: []
    });

    const result = await saveResultRecord(submission.id, {
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

  it("fetches result page data", async () => {
    const submission = await createSubmissionRecord({
      inputType: "pasted_text",
      pastedText: "Claim text",
      uploadedImages: []
    });

    await updateSubmissionStatus(submission.id, "completed");
    await saveResultRecord(submission.id, {
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

    expect((await getSubmissionById(submission.id))?.status).toBe("completed");
    expect((await getResultBySubmissionId(submission.id))?.postLevelSummary).toBe("summary");
  });
});
