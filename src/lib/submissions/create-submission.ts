import { randomUUID } from "node:crypto";
import { submissionPayloadSchema } from "@/lib/schema/submission";

export type QueuedSubmission = {
  id: string;
  inputType: "x_url" | "pasted_text" | "screenshot" | "mixed";
  xUrl?: string;
  pastedText?: string;
  uploadedImages: {
    name: string;
    mimeType: string;
    size: number;
  }[];
  status: "queued";
  createdAt: string;
};

const submissionValidationRules = {
  x_url: (payload: { xUrl?: string }) => Boolean(payload.xUrl),
  pasted_text: (payload: { pastedText?: string }) => Boolean(payload.pastedText),
  screenshot: (payload: { uploadedImages: unknown[] }) => payload.uploadedImages.length > 0,
  mixed: (payload: {
    xUrl?: string;
    pastedText?: string;
    uploadedImages: unknown[];
  }) => Boolean(payload.xUrl || payload.pastedText || payload.uploadedImages.length > 0)
} as const;

export function createSubmission(input: unknown): QueuedSubmission {
  const payload = submissionPayloadSchema.parse(input);
  const isValidForInputType = submissionValidationRules[payload.inputType](payload);

  if (!isValidForInputType) {
    throw new Error("At least one input is required for the selected submission type.");
  }

  return {
    id: randomUUID(),
    inputType: payload.inputType,
    xUrl: payload.xUrl,
    pastedText: payload.pastedText,
    uploadedImages: payload.uploadedImages,
    status: "queued",
    createdAt: new Date().toISOString()
  };
}
