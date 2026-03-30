import type { ResultRepositoryAdapter, SubmissionRepositoryAdapter } from "@/lib/db/test-adapter";
import type { ResultRecord, SubmissionRecord } from "@/lib/db/types";

const submissionStore = new Map<string, SubmissionRecord>();
const resultStore = new Map<string, ResultRecord>();

export const e2eSubmissionAdapter: SubmissionRepositoryAdapter = {
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
};

export const e2eResultAdapter: ResultRepositoryAdapter = {
  async save(result) {
    resultStore.set(result.submissionId, result);
    return result;
  },
  async getBySubmissionId(submissionId) {
    return resultStore.get(submissionId) ?? null;
  }
};
