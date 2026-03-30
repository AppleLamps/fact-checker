"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ResultStatusProps = {
  submissionId: string;
  initialStatus: "queued" | "processing" | "completed" | "failed";
};

type StatusResponse = {
  submission: {
    id: string;
    status: "queued" | "processing" | "completed" | "failed";
  };
  result: unknown | null;
  error?: string;
};

export function ResultStatus({ submissionId, initialStatus }: ResultStatusProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (status !== "queued" || hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;

    void fetch(`/api/submissions/${submissionId}/process`, {
      method: "POST"
    })
      .then(async (response) => {
        const payload = (await response.json()) as StatusResponse;

        if (!response.ok) {
          throw new Error(payload.error ?? "Fact-check processing failed.");
        }

        setStatus(payload.submission.status);

        if (payload.result) {
          router.refresh();
        }
      })
      .catch((error) => {
        setStatus("failed");
        setErrorMessage(error instanceof Error ? error.message : "Fact-check processing failed.");
      });
  }, [router, status, submissionId]);

  useEffect(() => {
    if (status === "completed" || status === "failed") {
      return;
    }

    const intervalId = window.setInterval(async () => {
      const response = await fetch(`/api/submissions/${submissionId}`);
      const payload = (await response.json()) as StatusResponse;

      if (!response.ok) {
        setStatus("failed");
        setErrorMessage(payload.error ?? "Unable to refresh job status.");
        window.clearInterval(intervalId);
        return;
      }

      setStatus(payload.submission.status);

      if (payload.result || payload.submission.status === "completed") {
        window.clearInterval(intervalId);
        router.refresh();
      }
    }, 1500);

    return () => window.clearInterval(intervalId);
  }, [router, status, submissionId]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center px-6 py-16 text-ink">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">
        {status}
      </p>
      <h1 className="mt-3 font-serif text-5xl tracking-[-0.04em]">
        {status === "failed" ? "The fact check could not be completed." : "The fact check is still running."}
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-8 text-ink/78">
        Submission <span className="font-semibold">{submissionId}</span> has been received.
        {status === "failed"
          ? " Review the error below, then retry once the integration issue is resolved."
          : " Results will appear here automatically when the research and validation steps complete."}
      </p>
      {errorMessage ? (
        <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}
    </main>
  );
}
