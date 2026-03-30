import { render, screen } from "@testing-library/react";
import Page from "../app/page";

describe("Landing page", () => {
  it("renders the fact checker headline, submission shell, and reply explanation", () => {
    render(<Page />);

    expect(
      screen.getByRole("heading", { name: /evidence-first fact checker/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("form", { name: /analyze a post/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/you'll get a neutral fact check and a reply draft/i)
    ).toBeInTheDocument();
  });
});
