import type { ResultRecord, SubmissionRecord } from "@/lib/db/types";

type SubmissionRow = {
  id: string;
  input_type: SubmissionRecord["inputType"];
  x_url: string | null;
  pasted_text: string | null;
  uploaded_images: SubmissionRecord["uploadedImages"];
  status: SubmissionRecord["status"];
  created_at: Date | string;
};

type ResultRow = {
  submission_id: string;
  payload: Omit<ResultRecord, "submissionId">;
};

export function mapSubmissionRow(row: SubmissionRow): SubmissionRecord {
  return {
    id: row.id,
    inputType: row.input_type,
    xUrl: row.x_url ?? undefined,
    pastedText: row.pasted_text ?? undefined,
    uploadedImages: row.uploaded_images,
    status: row.status,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : new Date(row.created_at).toISOString()
  };
}

export function mapResultRow(row: ResultRow): ResultRecord {
  return {
    submissionId: row.submission_id,
    ...row.payload
  };
}
