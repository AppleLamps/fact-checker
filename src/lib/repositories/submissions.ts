import { ensureDatabaseSchema, getPool } from "@/lib/db/postgres";
import { mapSubmissionRow } from "@/lib/db/serialize";
import { e2eSubmissionAdapter } from "@/lib/db/e2e-adapter";
import type { SubmissionRepositoryAdapter } from "@/lib/db/test-adapter";
import type { SubmissionRecord } from "@/lib/db/types";
import { createSubmission, type QueuedSubmission } from "@/lib/submissions/create-submission";

const postgresSubmissionAdapter: SubmissionRepositoryAdapter = {
  async create(submission) {
    await ensureDatabaseSchema();
    const pool = getPool();
    const result = await pool.query(
      `
        insert into submissions (
          id,
          input_type,
          x_url,
          pasted_text,
          uploaded_images,
          status,
          created_at
        ) values ($1, $2, $3, $4, $5::jsonb, $6, $7)
        returning *
      `,
      [
        submission.id,
        submission.inputType,
        submission.xUrl ?? null,
        submission.pastedText ?? null,
        JSON.stringify(submission.uploadedImages),
        submission.status,
        submission.createdAt
      ]
    );

    return mapSubmissionRow(result.rows[0]);
  },
  async updateStatus(submissionId, status) {
    await ensureDatabaseSchema();
    const pool = getPool();
    const result = await pool.query(
      `
        update submissions
        set status = $2
        where id = $1
        returning *
      `,
      [submissionId, status]
    );

    if (!result.rowCount) {
      return null;
    }

    return mapSubmissionRow(result.rows[0]);
  },
  async getById(submissionId) {
    await ensureDatabaseSchema();
    const pool = getPool();
    const result = await pool.query(
      `
        select *
        from submissions
        where id = $1
      `,
      [submissionId]
    );

    if (!result.rowCount) {
      return null;
    }

    return mapSubmissionRow(result.rows[0]);
  }
};

let submissionRepositoryAdapter: SubmissionRepositoryAdapter =
  process.env.FACT_CHECKER_E2E_AUTOCOMPLETE === "1"
    ? e2eSubmissionAdapter
    : postgresSubmissionAdapter;

export function setSubmissionRepositoryAdapter(adapter: SubmissionRepositoryAdapter) {
  submissionRepositoryAdapter = adapter;
}

export async function createSubmissionRecord(input: unknown): Promise<SubmissionRecord> {
  const submission = createSubmission(input);
  const record: SubmissionRecord = submission;

  return submissionRepositoryAdapter.create(record);
}

export async function updateSubmissionStatus(
  submissionId: string,
  status: SubmissionRecord["status"]
) {
  const updatedSubmission = await submissionRepositoryAdapter.updateStatus(
    submissionId,
    status
  );

  if (!updatedSubmission) {
    throw new Error(`Submission ${submissionId} not found.`);
  }

  return updatedSubmission;
}

export async function getSubmissionById(submissionId: string) {
  return submissionRepositoryAdapter.getById(submissionId);
}

export type { SubmissionRecord, QueuedSubmission };
