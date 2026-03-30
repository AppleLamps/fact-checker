import { normalizeSubmissionInput } from "@/lib/submissions/normalize-input";
import { runFactCheck } from "@/lib/fact-check/run-fact-check";
import { getResultBySubmissionId, saveResultRecord } from "@/lib/repositories/results";
import { getSubmissionById, updateSubmissionStatus } from "@/lib/repositories/submissions";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export const maxDuration = 60;

export async function POST(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const submission = getSubmissionById(id);

  if (!submission) {
    return Response.json(
      {
        error: `Submission ${id} not found.`
      },
      {
        status: 404
      }
    );
  }

  const existingResult = getResultBySubmissionId(id);

  if (existingResult) {
    return Response.json({
      submission: getSubmissionById(id),
      result: existingResult
    });
  }

  try {
    updateSubmissionStatus(id, "processing");
    const normalizedSubmission = await normalizeSubmissionInput(submission);
    const result = await runFactCheck(normalizedSubmission);
    saveResultRecord(id, result);
    const updatedSubmission = updateSubmissionStatus(id, "completed");

    return Response.json({
      submission: updatedSubmission,
      result
    });
  } catch (error) {
    const updatedSubmission = updateSubmissionStatus(id, "failed");

    return Response.json(
      {
        submission: updatedSubmission,
        error: error instanceof Error ? error.message : "Fact-check processing failed."
      },
      {
        status: 500
      }
    );
  }
}
