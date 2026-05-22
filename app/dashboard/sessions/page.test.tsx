import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock("@/app/auth/_hooks/useAuth", () => ({
  useAuth: () => ({ token: "tk" }),
}));

import { createSession, joinSession } from "@/app/codeEditor/api";
jest.mock("@/app/codeEditor/api", () => {
  const actual = jest.requireActual("@/app/codeEditor/api");
  return { ...actual, createSession: jest.fn(), joinSession: jest.fn() };
});

import Sessions from "./page";

const createMock = createSession as unknown as jest.Mock;
const joinMock = joinSession as unknown as jest.Mock;

beforeEach(() => {
  pushMock.mockReset();
  createMock.mockReset();
  joinMock.mockReset();
});

describe("Sessions (legacy page)", () => {
  it("renders headings and inputs", () => {
    render(<Sessions />);
    expect(screen.getByText("Sesiones colaborativas")).toBeInTheDocument();
    expect(screen.getByText("Crear sesion")).toBeInTheDocument();
    expect(screen.getByText("Unirse a sesion")).toBeInTheDocument();
  });

  it("Crear button disabled when name < 3 chars", () => {
    render(<Sessions />);
    fireEvent.change(screen.getByPlaceholderText("Backend pairing"), {
      target: { value: "ab" },
    });
    expect(screen.getByRole("button", { name: /Crear y entrar/i })).toBeDisabled();
  });

  it("Crear button enabled when name >= 3 chars", () => {
    render(<Sessions />);
    fireEvent.change(screen.getByPlaceholderText("Backend pairing"), {
      target: { value: "abc" },
    });
    expect(screen.getByRole("button", { name: /Crear y entrar/i })).not.toBeDisabled();
  });

  it("Unirse button disabled when code < 8 chars", () => {
    render(<Sessions />);
    fireEvent.change(screen.getByPlaceholderText("A1B2C3D4"), {
      target: { value: "ABCD123" },
    });
    expect(screen.getByRole("button", { name: /^Unirse$/i })).toBeDisabled();
  });

  it("Unirse button enabled when code = 8 chars", () => {
    render(<Sessions />);
    fireEvent.change(screen.getByPlaceholderText("A1B2C3D4"), {
      target: { value: "ABCD1234" },
    });
    expect(screen.getByRole("button", { name: /^Unirse$/i })).not.toBeDisabled();
  });

  it("creates session and routes to codeEditor on success", async () => {
    createMock.mockResolvedValueOnce({
      session: { id: "sid", inviteCode: "AAAA1111" },
    });
    render(<Sessions />);
    fireEvent.change(screen.getByPlaceholderText("Backend pairing"), {
      target: { value: "My Session" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Crear y entrar/i }));
    });
    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith(expect.stringContaining("sessionId=sid")),
    );
  });

  it("shows error message when createSession fails", async () => {
    createMock.mockRejectedValueOnce(new Error("Server error"));
    render(<Sessions />);
    fireEvent.change(screen.getByPlaceholderText("Backend pairing"), {
      target: { value: "My Session" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Crear y entrar/i }));
    });
    await waitFor(() =>
      expect(screen.getByText("Server error")).toBeInTheDocument(),
    );
  });

  it("shows generic error message for non-Error thrown during create", async () => {
    createMock.mockRejectedValueOnce("plain error");
    render(<Sessions />);
    fireEvent.change(screen.getByPlaceholderText("Backend pairing"), {
      target: { value: "My Session" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Crear y entrar/i }));
    });
    await waitFor(() =>
      expect(screen.getByText(/No se pudo crear/)).toBeInTheDocument(),
    );
  });

  it("joins session and routes to codeEditor on success", async () => {
    joinMock.mockResolvedValueOnce({
      session: { id: "jid", inviteCode: "BBBB2222" },
    });
    render(<Sessions />);
    fireEvent.change(screen.getByPlaceholderText("A1B2C3D4"), {
      target: { value: "ABCD1234" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^Unirse$/i }));
    });
    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith(expect.stringContaining("sessionId=jid")),
    );
  });

  it("shows error message when joinSession fails", async () => {
    joinMock.mockRejectedValueOnce(new Error("Code not found"));
    render(<Sessions />);
    fireEvent.change(screen.getByPlaceholderText("A1B2C3D4"), {
      target: { value: "ABCD1234" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^Unirse$/i }));
    });
    await waitFor(() =>
      expect(screen.getByText("Code not found")).toBeInTheDocument(),
    );
  });

  it("creates session without inviteCode in URL when not returned", async () => {
    createMock.mockResolvedValueOnce({ session: { id: "sid2" } });
    render(<Sessions />);
    fireEvent.change(screen.getByPlaceholderText("Backend pairing"), {
      target: { value: "My Session" },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Crear y entrar/i }));
    });
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith(expect.stringContaining("sessionId=sid2"));
      expect(pushMock.mock.calls[0][0]).not.toContain("inviteCode");
    });
  });
});
