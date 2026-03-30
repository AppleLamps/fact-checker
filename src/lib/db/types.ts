import type { QueuedSubmission } from "@/lib/submissions/create-submission";
import type { ValidatedResult } from "@/lib/schema/result";

export type SubmissionRecord = Omit<QueuedSubmission, "status"> & {
  status: "queued" | "processing" | "completed" | "failed";
};

export type ResultRecord = ValidatedResult & {
  submissionId: string;
};
