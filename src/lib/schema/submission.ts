import { z } from "zod";

export const submissionInputTypeSchema = z.enum([
  "x_url",
  "pasted_text",
  "screenshot",
  "mixed"
]);

export const uploadedImageSchema = z.object({
  name: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().int().nonnegative()
});

export const submissionPayloadSchema = z.object({
  inputType: submissionInputTypeSchema,
  xUrl: z.string().url().optional(),
  pastedText: z.string().trim().min(1).optional(),
  uploadedImages: z.array(uploadedImageSchema).default([])
});

export type SubmissionInputType = z.infer<typeof submissionInputTypeSchema>;
export type UploadedImage = z.infer<typeof uploadedImageSchema>;
export type SubmissionPayload = z.infer<typeof submissionPayloadSchema>;
