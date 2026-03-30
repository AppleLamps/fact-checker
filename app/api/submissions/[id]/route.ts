import { getResultBySubmissionId } from "@/lib/repositories/results";
import { getSubmissionById } from "@/lib/repositories/submissions";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
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

  return Response.json({
    submission,
    result: getResultBySubmissionId(id)
  });
}
