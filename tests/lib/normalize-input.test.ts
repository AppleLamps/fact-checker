import { describe, expect, it } from "vitest";
import { normalizeSubmissionInput } from "../../src/lib/submissions/normalize-input";

describe("normalizeSubmissionInput", () => {
  it("labels x url submissions as direct post links", async () => {
    const normalized = await normalizeSubmissionInput(
      {
        inputType: "x_url",
        xUrl: "https://x.com/example/status/123",
        uploadedImages: []
      },
      {
        extractText: async () => ""
      }
    );

    expect(normalized.provenanceLabel).toBe("direct_x_url");
    expect(normalized.provenanceConfidence).toBe(1);
    expect(normalized.extractedText).toBe("");
  });

  it("labels pasted text submissions as user supplied text", async () => {
    const normalized = await normalizeSubmissionInput(
      {
        inputType: "pasted_text",
        pastedText: "Quote: the mayor banned gas stoves.",
        uploadedImages: []
      },
      {
        extractText: async () => ""
      }
    );

    expect(normalized.provenanceLabel).toBe("user_supplied_text");
    expect(normalized.provenanceConfidence).toBe(0.65);
    expect(normalized.extractedText).toContain("mayor");
  });

  it("uses OCR fallback for screenshot submissions", async () => {
    const normalized = await normalizeSubmissionInput(
      {
        inputType: "screenshot",
        uploadedImages: [
          {
            name: "post.png",
            mimeType: "image/png",
            size: 2048
          }
        ]
      },
      {
        extractText: async () => "Recovered screenshot text"
      }
    );

    expect(normalized.provenanceLabel).toBe("ocr_screenshot");
    expect(normalized.provenanceConfidence).toBe(0.45);
    expect(normalized.extractedText).toBe("Recovered screenshot text");
  });

  it("prefers url provenance but merges text from mixed submissions", async () => {
    const normalized = await normalizeSubmissionInput(
      {
        inputType: "mixed",
        xUrl: "https://x.com/example/status/123",
        pastedText: "Original post text",
        uploadedImages: [
          {
            name: "post.png",
            mimeType: "image/png",
            size: 2048
          }
        ]
      },
      {
        extractText: async () => "OCR backup text"
      }
    );

    expect(normalized.provenanceLabel).toBe("mixed_with_direct_x_url");
    expect(normalized.provenanceConfidence).toBe(0.92);
    expect(normalized.extractedText).toContain("Original post text");
    expect(normalized.extractedText).toContain("OCR backup text");
  });
});
