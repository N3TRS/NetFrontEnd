import { render, screen } from "@testing-library/react";
import { Label } from "./label";

describe("Label", () => {
  it("renders children", () => {
    render(<Label htmlFor="x">Username</Label>);
    expect(screen.getByText("Username")).toBeInTheDocument();
  });

  it("sets data-slot=label", () => {
    render(<Label>Y</Label>);
    expect(screen.getByText("Y").getAttribute("data-slot")).toBe("label");
  });
});
