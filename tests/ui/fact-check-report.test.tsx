import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FactCheckReport } from "../../src/components/fact-check-report";

const result = {
  submissionId: "submission-1",
  submissionSummary: "A post claims California banned gas stoves statewide.",
  postLevelSummary: "The post exaggerates standards policy into a statewide ban.",
  claims: [
    {
      id: "claim-1",
      text: "California banned gas stoves statewide.",
      factCheckable: true
    },
    {
      id: "claim-2",
      text: "The governor said this would start today.",
      factCheckable: false
    }
  ],
  evidence: [
    {
      id: "evidence-1",
      claimId: "claim-1",
      sourceUrl: "https://www.energy.ca.gov/policy-update",
      sourceTitle: "State energy policy update",
      sourceType: "primary",
      publisher: "California Energy Commission",
      publicationDate: "2026-03-20T00:00:00.000Z",
      excerpt: "The rule changes appliance standards and does not impose a statewide ban.",
      relevanceScore: 0.93
    }
  ],
  verdicts: [
    {
      claimId: "claim-1",
      label: "missing_context" as const,
      confidence: 0.84,
      rationale: "The post inflates standards changes into a statewide ban.",
      evidenceIds: ["evidence-1"],
      manipulationFlags: ["headline_overclaim"]
    },
    {
      claimId: "claim-2",
      label: "not_fact_checkable" as const,
      confidence: 0.4,
      rationale: "The quote is rhetorical and not directly verifiable as a factual claim.",
      evidenceIds: ["evidence-1"],
      manipulationFlags: []
    }
  ],
  replyDraft: {
    headline: "This post overstates the policy.",
    body: "There is no statewide gas-stove ban here. The cited source describes standards changes, not a blanket prohibition.",
    supportedClaimIds: ["claim-1"]
  },
  limitations: ["The post does not cite enacted statewide ban text."]
};

describe("FactCheckReport", () => {
  it("renders fact-check report and reply draft separately", () => {
    render(<FactCheckReport result={result} />);

    expect(screen.getByRole("heading", { name: /fact check/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /reply draft/i })).toBeInTheDocument();
  });

  it("shows limitations", () => {
    render(<FactCheckReport result={result} />);

    expect(screen.getByText(/does not cite enacted statewide ban text/i)).toBeInTheDocument();
  });

  it("shows source metadata", () => {
    render(<FactCheckReport result={result} />);

    expect(screen.getByText(/california energy commission/i)).toBeInTheDocument();
    expect(screen.getByText(/primary/i)).toBeInTheDocument();
  });

  it("renders non-fact-checkable outcomes clearly", () => {
    render(<FactCheckReport result={result} />);

    expect(screen.getByText(/not_fact_checkable/i)).toBeInTheDocument();
  });
});
