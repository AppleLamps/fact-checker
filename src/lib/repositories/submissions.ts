import { createSubmission, type QueuedSubmission } from "@/lib/submissions/create-submission";
import { getMemoryStore, type SubmissionRecord } from "@/lib/db/memory";

export function createSubmissionRecord(input: unknown): SubmissionRecord {
  const submission = createSubmission(input);
  const record: SubmissionRecord = submission;

  getMemoryStore().submissions.set(record.id, record);

  return record;
}

export function updateSubmissionStatus(
  submissionId: string,
  status: SubmissionRecord["status"]
) {
  const store = getMemoryStore();
  const submission = store.submissions.get(submissionId);

  if (!submission) {
    throw new Error(`Submission ${submissionId} not found.`);
  }

  const updatedSubmission: SubmissionRecord = {
    ...submission,
    status
  };

  store.submissions.set(submissionId, updatedSubmission);

  return updatedSubmission;
}

export function getSubmissionById(submissionId: string) {
  return getMemoryStore().submissions.get(submissionId) ?? null;
}

export type { SubmissionRecord, QueuedSubmission };
