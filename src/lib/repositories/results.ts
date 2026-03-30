import { ensureDatabaseSchema, getPool } from "@/lib/db/postgres";
import { e2eResultAdapter } from "@/lib/db/e2e-adapter";
import { mapResultRow } from "@/lib/db/serialize";
import type { ResultRepositoryAdapter } from "@/lib/db/test-adapter";
import type { ResultRecord } from "@/lib/db/types";
import { validateFactCheckResult } from "@/lib/fact-check/validate-result";

const postgresResultAdapter: ResultRepositoryAdapter = {
  async save(result) {
    await ensureDatabaseSchema();
    const pool = getPool();
    const payload = {
      submissionSummary: result.submissionSummary,
      postLevelSummary: result.postLevelSummary,
      claims: result.claims,
      evidence: result.evidence,
      verdicts: result.verdicts,
      replyDraft: result.replyDraft,
      limitations: result.limitations
    };

    const queryResult = await pool.query(
      `
        insert into results (submission_id, payload)
        values ($1, $2::jsonb)
        on conflict (submission_id)
        do update set payload = excluded.payload
        returning submission_id, payload
      `,
      [result.submissionId, JSON.stringify(payload)]
    );

    return mapResultRow(queryResult.rows[0]);
  },
  async getBySubmissionId(submissionId) {
    await ensureDatabaseSchema();
    const pool = getPool();
    const result = await pool.query(
      `
        select submission_id, payload
        from results
        where submission_id = $1
      `,
      [submissionId]
    );

    if (!result.rowCount) {
      return null;
    }

    return mapResultRow(result.rows[0]);
  }
};

let resultRepositoryAdapter: ResultRepositoryAdapter =
  process.env.FACT_CHECKER_E2E_AUTOCOMPLETE === "1"
    ? e2eResultAdapter
    : postgresResultAdapter;

export function setResultRepositoryAdapter(adapter: ResultRepositoryAdapter) {
  resultRepositoryAdapter = adapter;
}

export async function saveResultRecord(submissionId: string, input: unknown): Promise<ResultRecord> {
  const validatedResult = validateFactCheckResult(input);
  const record: ResultRecord = {
    submissionId,
    ...validatedResult
  };

  return resultRepositoryAdapter.save(record);
}

export async function getResultBySubmissionId(submissionId: string) {
  return resultRepositoryAdapter.getBySubmissionId(submissionId);
}
