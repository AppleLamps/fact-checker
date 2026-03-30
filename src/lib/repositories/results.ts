import { validateFactCheckResult } from "@/lib/fact-check/validate-result";
import { getMemoryStore, type ResultRecord } from "@/lib/db/memory";

export function saveResultRecord(submissionId: string, input: unknown): ResultRecord {
  const validatedResult = validateFactCheckResult(input);
  const record: ResultRecord = {
    submissionId,
    ...validatedResult
  };

  getMemoryStore().results.set(submissionId, record);

  return record;
}

export function getResultBySubmissionId(submissionId: string) {
  return getMemoryStore().results.get(submissionId) ?? null;
}
