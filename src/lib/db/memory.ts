import type { QueuedSubmission } from "@/lib/submissions/create-submission";
import type { ValidatedResult } from "@/lib/schema/result";

type SubmissionRecord = Omit<QueuedSubmission, "status"> & {
  status: "queued" | "processing" | "completed" | "failed";
};

type ResultRecord = ValidatedResult & {
  submissionId: string;
};

const store = {
  submissions: new Map<string, SubmissionRecord>(),
  results: new Map<string, ResultRecord>()
};

export function getMemoryStore() {
  return store;
}

export function resetMemoryStore() {
  store.submissions.clear();
  store.results.clear();
}

export type { SubmissionRecord, ResultRecord };
