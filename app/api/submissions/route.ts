import { ZodError } from "zod";
import { buildMockResult } from "@/lib/fact-check/mock-result";
import { saveResultRecord } from "@/lib/repositories/results";
import { createSubmissionRecord } from "@/lib/repositories/submissions";
import { updateSubmissionStatus } from "@/lib/repositories/submissions";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const submission = await createSubmissionRecord(payload);
    const shouldMockComplete =
      process.env.FACT_CHECKER_E2E_AUTOCOMPLETE === "1" &&
      submission.inputType !== "x_url";
    const mockScenario =
      submission.pastedText?.toLowerCase().includes("mixed evidence")
        ? "mixed-evidence"
        : "completed";

    if (shouldMockComplete) {
      await saveResultRecord(submission.id, buildMockResult(submission));
      await updateSubmissionStatus(submission.id, "completed");
    }

    return Response.json(
      {
        submission: shouldMockComplete
          ? {
              ...submission,
              status: "completed"
            }
          : submission,
        redirectUrl: shouldMockComplete
          ? `/check/mock-${mockScenario}?mockScenario=${mockScenario}`
          : `/check/${submission.id}`
      },
      {
        status: 201
      }
    );
  } catch (error) {
    if (error instanceof ZodError || error instanceof Error) {
      return Response.json(
        {
          error: error.message
        },
        {
          status: 400
        }
      );
    }

    return Response.json(
      {
        error: "Unknown submission error."
      },
      {
        status: 500
      }
    );
  }
}
