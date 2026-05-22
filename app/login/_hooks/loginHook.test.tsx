import { act, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import React from "react";
import { useLogin } from "./loginHook";

const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const fetchMock = global.fetch as jest.Mock;

function Harness() {
  const { email, password, setEmail, setPassword, handleLogin, isPending } = useLogin();
  return (
    <form onSubmit={handleLogin}>
      <input aria-label="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input aria-label="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit" disabled={isPending}>
        submit
      </button>
      <span data-testid="pending">{String(isPending)}</span>
    </form>
  );
}

beforeEach(() => {
  fetchMock.mockReset();
  pushMock.mockReset();
  localStorage.clear();
  jest.spyOn(window, "alert").mockImplementation(() => {});
});

describe("useLogin", () => {
  it("starts with empty fields, not pending", () => {
    const { result } = renderHook(() => useLogin());
    expect(result.current.email).toBe("");
    expect(result.current.password).toBe("");
    expect(result.current.isPending).toBe(false);
  });

  it("alerts and resets when fields are empty", async () => {
    render(<Harness />);
    fireEvent.submit(screen.getByRole("button").closest("form")!);
    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith("Por favor llene todos los campos"),
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("stores user and routes to /dashboard on success", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ token: "tk", email: "u@x.io" }),
    });

    render(<Harness />);
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "u@x.io" } });
    fireEvent.change(screen.getByLabelText("password"), { target: { value: "pw" } });
    fireEvent.submit(screen.getByRole("button").closest("form")!);

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/dashboard"));
    expect(JSON.parse(localStorage.getItem("user")!)).toEqual({
      token: "tk",
      email: "u@x.io",
    });
  });

  it("alerts on non-ok response with server message", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: jest.fn().mockResolvedValue({ message: "Credenciales inválidas" }),
    });
    render(<Harness />);
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "u@x.io" } });
    fireEvent.change(screen.getByLabelText("password"), { target: { value: "pw" } });
    fireEvent.submit(screen.getByRole("button").closest("form")!);
    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith("Credenciales inválidas"),
    );
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("handles network/throw with generic alert", async () => {
    fetchMock.mockRejectedValueOnce(new Error("network down"));
    jest.spyOn(console, "error").mockImplementation(() => {});
    render(<Harness />);
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "u@x.io" } });
    fireEvent.change(screen.getByLabelText("password"), { target: { value: "pw" } });
    fireEvent.submit(screen.getByRole("button").closest("form")!);
    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith("Error en el inicio de sesión"),
    );
  });

  it("alerts generic message when non-ok response has no message", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: jest.fn().mockResolvedValue({}),
    });
    render(<Harness />);
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "u@x.io" } });
    fireEvent.change(screen.getByLabelText("password"), { target: { value: "pw" } });
    fireEvent.submit(screen.getByRole("button").closest("form")!);
    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith("Error en el inicio de sesión"),
    );
  });

  it("uses NEXT_PUBLIC_URL_APIGATEWAY env var when set", async () => {
    const original = process.env.NEXT_PUBLIC_URL_APIGATEWAY;
    process.env.NEXT_PUBLIC_URL_APIGATEWAY = "http://custom-api:4000";
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ token: "tk" }),
    });
    render(<Harness />);
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "u@x.io" } });
    fireEvent.change(screen.getByLabelText("password"), { target: { value: "pw" } });
    fireEvent.submit(screen.getByRole("button").closest("form")!);
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/dashboard"));
    expect(fetchMock.mock.calls[0][0]).toContain("http://custom-api:4000");
    process.env.NEXT_PUBLIC_URL_APIGATEWAY = original;
  });
});
