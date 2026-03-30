import Link from "next/link";
import { FactCheckReport } from "@/components/fact-check-report";
import { buildMockResult } from "@/lib/fact-check/mock-result";
import { ResultStatus } from "@/components/result-status";
import {
  getSubmissionById
} from "@/lib/repositories/submissions";
import { getResultBySubmissionId } from "@/lib/repositories/results";
import type { SubmissionRecord } from "@/lib/repositories/submissions";

type CheckPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    mockScenario?: string;
  }>;
};

function buildMockSubmission(mockScenario: string): SubmissionRecord {
  return {
    id: `mock-${mockScenario}`,
    inputType: "pasted_text",
    pastedText:
      mockScenario === "mixed-evidence"
        ? "Mixed evidence: the policy partly supports the claim but omits context."
        : "This post claims the city banned gas stoves overnight.",
    uploadedImages: [],
    status: "completed",
    createdAt: "2026-03-30T00:00:00.000Z"
  };
}

export default async function CheckPage({ params, searchParams }: CheckPageProps) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const mockScenario =
    process.env.FACT_CHECKER_E2E_AUTOCOMPLETE === "1"
      ? resolvedSearchParams?.mockScenario
      : undefined;
  const submission = getSubmissionById(id);
  const result = getResultBySubmissionId(id);

  if (!submission && mockScenario) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10 text-ink sm:px-8 lg:px-12">
        <FactCheckReport result={{ submissionId: id, ...buildMockResult(buildMockSubmission(mockScenario)) }} />
      </main>
    );
  }

  if (!submission) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center px-6 py-16 text-ink">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">
          Not found
        </p>
        <h1 className="mt-3 font-serif text-5xl tracking-[-0.04em]">
          That fact check does not exist.
        </h1>
        <Link href="/" className="mt-8 text-sm font-semibold underline underline-offset-4">
          Return to the submission form
        </Link>
      </main>
    );
  }

  if (!result) {
    return <ResultStatus submissionId={submission.id} initialStatus={submission.status} />;
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 text-ink sm:px-8 lg:px-12">
      <FactCheckReport result={result} />
    </main>
  );
}
