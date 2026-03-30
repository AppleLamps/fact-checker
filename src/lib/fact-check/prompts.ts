import type { NormalizedSubmission } from "@/lib/submissions/normalize-input";

export function buildFactCheckPrompt(submission: NormalizedSubmission) {
  return [
    "You are an evidence-first fact-checking system for X posts.",
    "Use x_search to inspect the X post, thread, quotes, and surrounding discussion when an X URL is provided.",
    "Use web_search to gather primary sources first and only use reputable secondary reporting when primary sources are unavailable.",
    "Treat opinion, satire, predictions, and vague rhetoric as not_fact_checkable when appropriate.",
    "Return only JSON.",
    "Produce separate fields for fact_check findings and reply_draft content.",
    "The reply_draft must only use verified evidence from the fact check.",
    "Do not invent certainty, sources, or unsupported claims.",
    "Assess whether each extracted claim is fact-checkable.",
    "",
    "Submission context:",
    JSON.stringify(
      {
        inputType: submission.inputType,
        xUrl: submission.xUrl,
        pastedText: submission.pastedText,
        extractedText: submission.extractedText,
        provenanceLabel: submission.provenanceLabel,
        provenanceConfidence: submission.provenanceConfidence
      },
      null,
      2
    ),
    "",
    "Return JSON with these top-level fields:",
    "- submissionSummary",
    "- postLevelSummary",
    "- claims",
    "- evidence",
    "- verdicts",
    "- replyDraft",
    "- limitations",
    "",
    "Each claim object must include: id, text, factCheckable.",
    "Each evidence object must include: id, claimId, sourceUrl, sourceTitle, sourceType, publisher, publicationDate, excerpt, relevanceScore.",
    "sourceType must be one of: primary, secondary, official_dataset, archival, user_supplied.",
    "publicationDate must be ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ (e.g. 2026-03-01T00:00:00.000Z).",
    "Each verdict must include: claimId, label, confidence, rationale, evidenceIds, manipulationFlags.",
    "label must be one of: supported, unsupported, misleading_by_omission, missing_context, outdated, mixed_evidence, not_fact_checkable, insufficient_evidence.",
    "limitations must be an array of strings.",
    "replyDraft must include: headline, body, supportedClaimIds.",
    "The reply_draft must cite only supportedClaimIds backed by verified evidence."
  ].join("\n");
}
