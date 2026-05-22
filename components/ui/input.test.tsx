import { fireEvent, render, screen } from "@testing-library/react";
import { Input } from "./input";

describe("Input", () => {
  it("renders with placeholder and accepts user typing via fireEvent", () => {
    render(<Input placeholder="enter" />);
    const el = screen.getByPlaceholderText("enter") as HTMLInputElement;
    fireEvent.change(el, { target: { value: "hello" } });
    expect(el.value).toBe("hello");
  });

  it("forwards type attribute", () => {
    render(<Input type="password" placeholder="pw" />);
    const el = screen.getByPlaceholderText("pw") as HTMLInputElement;
    expect(el.type).toBe("password");
  });

  it("respects disabled", () => {
    render(<Input placeholder="x" disabled />);
    expect(screen.getByPlaceholderText("x")).toBeDisabled();
  });
});
