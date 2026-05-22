import { fireEvent, render, screen } from "@testing-library/react";
import { EditorTabs } from "./EditorTabs";

describe("EditorTabs", () => {
  it("renders filename", () => {
    render(<EditorTabs filename="main.ts" />);
    expect(screen.getByText("main.ts")).toBeInTheDocument();
  });

  it("hides close button when onClose not provided", () => {
    render(<EditorTabs filename="main.ts" />);
    expect(screen.queryByRole("button", { name: /Close main\.ts/i })).toBeNull();
  });

  it("calls onClose when close button clicked", () => {
    const close = jest.fn();
    render(<EditorTabs filename="main.ts" onClose={close} />);
    fireEvent.click(screen.getByRole("button", { name: /Close main\.ts/i }));
    expect(close).toHaveBeenCalledTimes(1);
  });
});
