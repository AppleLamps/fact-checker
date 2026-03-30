import type { ResultRecord, SubmissionRecord } from "@/lib/db/types";

export type SubmissionRepositoryAdapter = {
  create: (submission: SubmissionRecord) => Promise<SubmissionRecord>;
  updateStatus: (
    submissionId: string,
    status: SubmissionRecord["status"]
  ) => Promise<SubmissionRecord | null>;
  getById: (submissionId: string) => Promise<SubmissionRecord | null>;
};

export type ResultRepositoryAdapter = {
  save: (result: ResultRecord) => Promise<ResultRecord>;
  getBySubmissionId: (submissionId: string) => Promise<ResultRecord | null>;
};
