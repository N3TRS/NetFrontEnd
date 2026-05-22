import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { useForgotPassword } from "./forgotPasswordHook";

const fetchMock = global.fetch as jest.Mock;

function Harness() {
  const { email, setEmail, handleForgot, isPending, submitted } = useForgotPassword();
  return (
    <form onSubmit={handleForgot}>
      <input aria-label="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button disabled={isPending}>submit</button>
      <span data-testid="submitted">{String(submitted)}</span>
    </form>
  );
}

beforeEach(() => fetchMock.mockReset());

describe("useForgotPassword", () => {
  it("does not call API when email is empty", () => {
    render(<Harness />);
    fireEvent.submit(screen.getByRole("button").closest("form")!);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByTestId("submitted").textContent).toBe("false");
  });

  it("sets submitted=true on success", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, status: 200 });
    render(<Harness />);
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "x@y.io" } });
    fireEvent.submit(screen.getByRole("button").closest("form")!);
    await waitFor(() =>
      expect(screen.getByTestId("submitted").textContent).toBe("true"),
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("still sets submitted=true on network failure (silent UX)", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockRejectedValueOnce(new Error("nope"));
    render(<Harness />);
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "x@y.io" } });
    fireEvent.submit(screen.getByRole("button").closest("form")!);
    await waitFor(() =>
      expect(screen.getByTestId("submitted").textContent).toBe("true"),
    );
  });
});
