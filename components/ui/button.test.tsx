import { fireEvent, render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  it("renders text content", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("forwards onClick", () => {
    const cb = jest.fn();
    render(<Button onClick={cb}>Go</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("respects disabled", () => {
    const cb = jest.fn();
    render(
      <Button disabled onClick={cb}>
        x
      </Button>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(cb).not.toHaveBeenCalled();
  });

  it("applies data-variant and data-size attributes", () => {
    render(
      <Button variant="outline" size="sm">
        v
      </Button>,
    );
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("data-variant", "outline");
    expect(btn).toHaveAttribute("data-size", "sm");
  });

  it("renders as slot when asChild", () => {
    render(
      <Button asChild>
        <a href="#go">link</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "link" });
    expect(link).toHaveAttribute("data-slot", "button");
  });
});
