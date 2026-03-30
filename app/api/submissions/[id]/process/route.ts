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
  const submission = await getSubmissionById(id);

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

  const existingResult = await getResultBySubmissionId(id);

  if (existingResult) {
    return Response.json({
      submission: await getSubmissionById(id),
      result: existingResult
    });
  }

  try {
    await updateSubmissionStatus(id, "processing");
    const normalizedSubmission = await normalizeSubmissionInput(submission);
    const result = await runFactCheck(normalizedSubmission);
    await saveResultRecord(id, result);
    const updatedSubmission = await updateSubmissionStatus(id, "completed");

    return Response.json({
      submission: updatedSubmission,
      result
    });
  } catch (error) {
    const updatedSubmission = await updateSubmissionStatus(id, "failed");

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
