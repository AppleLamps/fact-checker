"use client";

import { useState, type FormEvent } from "react";

type SubmissionPayload = {
  inputType: "x_url" | "pasted_text" | "mixed";
  xUrl?: string;
  pastedText?: string;
  uploadedImages: {
    name: string;
    mimeType: string;
    size: number;
  }[];
};

export function SubmissionForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const form = new FormData(event.currentTarget);
    const xUrl = form.get("xUrl")?.toString().trim() ?? "";
    const pastedText = form.get("pastedText")?.toString().trim() ?? "";

    const payload: SubmissionPayload = {
      inputType: xUrl && pastedText ? "mixed" : xUrl ? "x_url" : "pasted_text",
      uploadedImages: []
    };

    if (xUrl) {
      payload.xUrl = xUrl;
    }

    if (pastedText) {
      payload.pastedText = pastedText;
    }

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error ?? "Submission failed.");
      }

      window.location.assign(body.redirectUrl ?? `/check/${body.submission.id}`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Submission failed."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      aria-label="Analyze a post"
      onSubmit={handleSubmit}
      className="rounded-[30px] border border-ink/12 bg-white/72 p-6 shadow-glow backdrop-blur-sm sm:p-8"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-ink/55">
            Submission
          </p>
          <h2 className="mt-2 font-serif text-3xl tracking-[-0.03em]">
            Send the post
          </h2>
        </div>
        <span className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          URL, text, or screenshot
        </span>
      </div>

      <div className="mt-8 space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-ink/70">
            X link
          </span>
          <input
            type="url"
            name="xUrl"
            placeholder="https://x.com/..."
            className="w-full rounded-2xl border border-ink/15 bg-paper/80 px-4 py-3 text-sm outline-none transition placeholder:text-ink/35 focus:border-accent/55 focus:ring-2 focus:ring-accent/15"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-ink/70">
            Paste text
          </span>
          <textarea
            rows={6}
            name="pastedText"
            placeholder="Paste the post, thread, or quote here..."
            className="w-full resize-none rounded-2xl border border-ink/15 bg-paper/80 px-4 py-3 text-sm outline-none transition placeholder:text-ink/35 focus:border-accent/55 focus:ring-2 focus:ring-accent/15"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-ink/70">
            Screenshot
          </span>
          <div className="rounded-2xl border border-dashed border-ink/18 bg-paper/55 px-4 py-5 text-sm text-ink/62">
            Drop an image here or attach a screenshot when the post is deleted,
            hidden, or rate-limited.
          </div>
        </label>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-paper transition hover:bg-ink/92"
          >
            {isSubmitting ? "Analyzing..." : "Analyze post"}
          </button>
          <p className="text-sm text-ink/55">
            The result will split fact check and reply draft.
          </p>
        </div>

        {errorMessage ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </form>
  );
}
