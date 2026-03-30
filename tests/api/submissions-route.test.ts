import { beforeEach, describe, expect, it } from "vitest";
import type { SubmissionRecord } from "../../src/lib/db/types";
import { setSubmissionRepositoryAdapter } from "../../src/lib/repositories/submissions";
import { POST } from "../../app/api/submissions/route";

const submissionStore = new Map<string, SubmissionRecord>();

setSubmissionRepositoryAdapter({
  async create(submission) {
    submissionStore.set(submission.id, submission);
    return submission;
  },
  async updateStatus(submissionId, status) {
    const existing = submissionStore.get(submissionId);

    if (!existing) {
      return null;
    }

    const updated = {
      ...existing,
      status
    };

    submissionStore.set(submissionId, updated);
    return updated;
  },
  async getById(submissionId) {
    return submissionStore.get(submissionId) ?? null;
  }
});

describe("POST /api/submissions", () => {
  beforeEach(() => {
    submissionStore.clear();
  });

  it("accepts a url-only submission", async () => {
    const response = await POST(
      new Request("http://localhost/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputType: "x_url",
          xUrl: "https://x.com/example/status/123",
          uploadedImages: []
        })
      })
    );

    expect(response.status).toBe(201);

    const body = await response.json();
    expect(body.submission.status).toBe("queued");
    expect(body.submission.xUrl).toBe("https://x.com/example/status/123");
  });

  it("accepts a text-only submission", async () => {
    const response = await POST(
      new Request("http://localhost/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputType: "pasted_text",
          pastedText: "Claim: this city banned gas stoves statewide.",
          uploadedImages: []
        })
      })
    );

    expect(response.status).toBe(201);

    const body = await response.json();
    expect(body.submission.status).toBe("queued");
    expect(body.submission.pastedText).toContain("gas stoves");
  });

  it("accepts screenshot metadata submission", async () => {
    const response = await POST(
      new Request("http://localhost/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputType: "screenshot",
          uploadedImages: [
            {
              name: "post.png",
              mimeType: "image/png",
              size: 2048
            }
          ]
        })
      })
    );

    expect(response.status).toBe(201);

    const body = await response.json();
    expect(body.submission.status).toBe("queued");
    expect(body.submission.uploadedImages).toHaveLength(1);
  });

  it("rejects an empty request", async () => {
    const response = await POST(
      new Request("http://localhost/api/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputType: "mixed",
          uploadedImages: []
        })
      })
    );

    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.error).toMatch(/at least one input/i);
  });
});
