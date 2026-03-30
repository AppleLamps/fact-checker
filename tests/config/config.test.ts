import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("deployment config docs", () => {
  it("documents required environment variables", () => {
    const envExample = readFileSync(".env.example", "utf8");

    expect(envExample).toContain("XAI_API_KEY=");
    expect(envExample).toContain("DATABASE_URL=");
    expect(envExample).toContain("BLOB_READ_WRITE_TOKEN=");
  });
});
