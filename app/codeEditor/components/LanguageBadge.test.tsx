import { render, screen } from "@testing-library/react";
import { LanguageBadge } from "./LanguageBadge";

describe("LanguageBadge", () => {
  it("capitalizes the first letter", () => {
    render(<LanguageBadge language="typescript" />);
    expect(screen.getByText("Typescript")).toBeInTheDocument();
  });

  it("preserves single-letter input", () => {
    render(<LanguageBadge language="x" />);
    expect(screen.getByText("X")).toBeInTheDocument();
  });

  it("leaves already-capitalized labels alone (just capitalizes first char)", () => {
    render(<LanguageBadge language="JAVA" />);
    expect(screen.getByText("JAVA")).toBeInTheDocument();
  });
});
