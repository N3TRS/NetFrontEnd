import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { useResetPassword } from "./resetPasswordHook";

const pushMock = jest.fn();
let searchToken: string | null = "good-token";
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => ({ get: (k: string) => (k === "token" ? searchToken : null) }),
}));

const fetchMock = global.fetch as jest.Mock;

function Harness() {
  const hk = useResetPassword();
  return (
    <form onSubmit={hk.handleReset}>
      <input
        aria-label="new"
        value={hk.newPassword}
        onChange={(e) => hk.setNewPassword(e.target.value)}
      />
      <input
        aria-label="confirm"
        value={hk.confirmPassword}
        onChange={(e) => hk.setConfirmPassword(e.target.value)}
      />
      <button disabled={hk.isPending}>submit</button>
      <span data-testid="error">{hk.error ?? ""}</span>
      <span data-testid="success">{String(hk.success)}</span>
    </form>
  );
}

beforeEach(() => {
  jest.useFakeTimers();
  fetchMock.mockReset();
  pushMock.mockReset();
  searchToken = "good-token";
});

afterEach(() => {
  jest.useRealTimers();
});

describe("useResetPassword", () => {
  it("rejects when token missing", async () => {
    searchToken = "";
    render(<Harness />);
    fireEvent.change(screen.getByLabelText("new"), { target: { value: "a" } });
    fireEvent.change(screen.getByLabelText("confirm"), { target: { value: "a" } });
    fireEvent.submit(screen.getByRole("button").closest("form")!);
    await waitFor(() =>
      expect(screen.getByTestId("error").textContent).toMatch(/Token no válido/),
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects when passwords do not match", async () => {
    render(<Harness />);
    fireEvent.change(screen.getByLabelText("new"), { target: { value: "a" } });
    fireEvent.change(screen.getByLabelText("confirm"), { target: { value: "b" } });
    fireEvent.submit(screen.getByRole("button").closest("form")!);
    await waitFor(() =>
      expect(screen.getByTestId("error").textContent).toMatch(/no coinciden/),
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("success: sets success and pushes to /login after timeout", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({}),
    });
    render(<Harness />);
    fireEvent.change(screen.getByLabelText("new"), { target: { value: "secret" } });
    fireEvent.change(screen.getByLabelText("confirm"), { target: { value: "secret" } });
    fireEvent.submit(screen.getByRole("button").closest("form")!);
    await waitFor(() =>
      expect(screen.getByTestId("success").textContent).toBe("true"),
    );
    jest.advanceTimersByTime(2000);
    expect(pushMock).toHaveBeenCalledWith("/login");
  });

  it("server error sets error message", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue({ message: "Token expired" }),
    });
    render(<Harness />);
    fireEvent.change(screen.getByLabelText("new"), { target: { value: "secret" } });
    fireEvent.change(screen.getByLabelText("confirm"), { target: { value: "secret" } });
    fireEvent.submit(screen.getByRole("button").closest("form")!);
    await waitFor(() =>
      expect(screen.getByTestId("error").textContent).toBe("Token expired"),
    );
  });

  it("network error sets connection message", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    fetchMock.mockRejectedValueOnce(new Error("nope"));
    render(<Harness />);
    fireEvent.change(screen.getByLabelText("new"), { target: { value: "secret" } });
    fireEvent.change(screen.getByLabelText("confirm"), { target: { value: "secret" } });
    fireEvent.submit(screen.getByRole("button").closest("form")!);
    await waitFor(() =>
      expect(screen.getByTestId("error").textContent).toMatch(/Error de conexión/),
    );
  });
});
