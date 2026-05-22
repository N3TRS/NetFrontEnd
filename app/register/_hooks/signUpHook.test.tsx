import { fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import React from "react";
import { useSignUp } from "./signUpHook";

const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const fetchMock = global.fetch as jest.Mock;

function Harness() {
  const hk = useSignUp();
  return (
    <form onSubmit={hk.handleSignUp}>
      <input aria-label="name" value={hk.name} onChange={(e) => hk.setName(e.target.value)} />
      <input aria-label="email" value={hk.email} onChange={(e) => hk.setEmail(e.target.value)} />
      <input aria-label="password" value={hk.password} onChange={(e) => hk.setPassword(e.target.value)} />
      <button>submit</button>
    </form>
  );
}

beforeEach(() => {
  fetchMock.mockReset();
  pushMock.mockReset();
  localStorage.clear();
  jest.spyOn(window, "alert").mockImplementation(() => {});
});

describe("useSignUp", () => {
  it("initial empty + not pending", () => {
    const { result } = renderHook(() => useSignUp());
    expect(result.current.name).toBe("");
    expect(result.current.email).toBe("");
    expect(result.current.password).toBe("");
    expect(result.current.isPending).toBe(false);
  });

  it("alerts on empty submission", async () => {
    render(<Harness />);
    fireEvent.submit(screen.getByRole("button").closest("form")!);
    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith("Por favor llene todos los campos"),
    );
  });

  it("stores user + routes to /dashboard on success", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ token: "tk" }),
    });

    render(<Harness />);
    fireEvent.change(screen.getByLabelText("name"), { target: { value: "Alice" } });
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "a@x.io" } });
    fireEvent.change(screen.getByLabelText("password"), { target: { value: "pw" } });
    fireEvent.submit(screen.getByRole("button").closest("form")!);

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/dashboard"));
    expect(localStorage.getItem("user")).toBe(JSON.stringify({ token: "tk" }));
  });

  it("alerts on server error message", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValue({ message: "Email already used" }),
    });
    render(<Harness />);
    fireEvent.change(screen.getByLabelText("name"), { target: { value: "A" } });
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "e" } });
    fireEvent.change(screen.getByLabelText("password"), { target: { value: "p" } });
    fireEvent.submit(screen.getByRole("button").closest("form")!);

    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith("Email already used"),
    );
  });

  it("alerts on network error", async () => {
    fetchMock.mockRejectedValueOnce(new Error("oops"));
    jest.spyOn(console, "error").mockImplementation(() => {});
    render(<Harness />);
    fireEvent.change(screen.getByLabelText("name"), { target: { value: "A" } });
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "e" } });
    fireEvent.change(screen.getByLabelText("password"), { target: { value: "p" } });
    fireEvent.submit(screen.getByRole("button").closest("form")!);

    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith("Error en el registro"),
    );
  });
});
