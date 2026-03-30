import {
  type OCRAdapter,
  noopOCRAdapter
} from "@/lib/ocr/extract-text";
import {
  type SubmissionPayload,
  submissionPayloadSchema
} from "@/lib/schema/submission";

export type NormalizedSubmission = SubmissionPayload & {
  extractedText: string;
  provenanceLabel:
    | "direct_x_url"
    | "user_supplied_text"
    | "ocr_screenshot"
    | "mixed_with_direct_x_url";
  provenanceConfidence: number;
};

export async function normalizeSubmissionInput(
  input: unknown,
  ocrAdapter: OCRAdapter = noopOCRAdapter
): Promise<NormalizedSubmission> {
  const payload = submissionPayloadSchema.parse(input);
  const ocrTextChunks = await Promise.all(
    payload.uploadedImages.map((image) => ocrAdapter.extractText(image))
  );
  const ocrText = ocrTextChunks.filter(Boolean).join("\n\n").trim();

  if (payload.inputType === "x_url") {
    return {
      ...payload,
      extractedText: "",
      provenanceLabel: "direct_x_url",
      provenanceConfidence: 1
    };
  }

  if (payload.inputType === "pasted_text") {
    return {
      ...payload,
      extractedText: payload.pastedText?.trim() ?? "",
      provenanceLabel: "user_supplied_text",
      provenanceConfidence: 0.65
    };
  }

  if (payload.inputType === "screenshot") {
    return {
      ...payload,
      extractedText: ocrText,
      provenanceLabel: "ocr_screenshot",
      provenanceConfidence: 0.45
    };
  }

  const extractedText = [payload.pastedText?.trim(), ocrText]
    .filter(Boolean)
    .join("\n\n")
    .trim();

  return {
    ...payload,
    extractedText,
    provenanceLabel: "mixed_with_direct_x_url",
    provenanceConfidence: payload.xUrl ? 0.92 : 0.7
  };
}
