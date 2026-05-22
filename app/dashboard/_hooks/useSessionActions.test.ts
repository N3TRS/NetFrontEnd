import { act, renderHook, waitFor } from "@testing-library/react";

const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock("@/app/auth/_hooks/useAuth", () => ({
  useAuth: () => ({
    user: { email: "u@x.io", token: "tk" },
    token: "tk",
    isAuthenticated: true,
    isLoading: false,
    logout: jest.fn(),
    refreshAuth: jest.fn(),
  }),
}));

import { createSession, joinSession, HttpError } from "@/app/codeEditor/api";
jest.mock("@/app/codeEditor/api", () => {
  const actual = jest.requireActual("@/app/codeEditor/api");
  return {
    ...actual,
    createSession: jest.fn(),
    joinSession: jest.fn(),
  };
});

import { useSessionActions } from "./useSessionActions";

const createSessionMock = createSession as unknown as jest.Mock;
const joinSessionMock = joinSession as unknown as jest.Mock;

beforeEach(() => {
  pushMock.mockReset();
  createSessionMock.mockReset();
  joinSessionMock.mockReset();
});

describe("useSessionActions - canCreate / canJoin", () => {
  it("canCreate requires token + name >= 3 chars", () => {
    const { result } = renderHook(() => useSessionActions());
    expect(result.current.canCreate).toBe(false);
    act(() => result.current.setSessionName("ab"));
    expect(result.current.canCreate).toBe(false);
    act(() => result.current.setSessionName("abc"));
    expect(result.current.canCreate).toBe(true);
  });

  it("canJoin requires token + 8-char invite code", () => {
    const { result } = renderHook(() => useSessionActions());
    act(() => result.current.setInviteCode("ABCD123"));
    expect(result.current.canJoin).toBe(false);
    act(() => result.current.setInviteCode("ABCD1234"));
    expect(result.current.canJoin).toBe(true);
  });
});

describe("useSessionActions - handleCreateSession", () => {
  it("routes to /codeEditor on success with full query", async () => {
    createSessionMock.mockResolvedValueOnce({
      session: { id: "sid", name: "MySession", language: "python", inviteCode: "ABCD1234" },
    });
    const { result } = renderHook(() => useSessionActions());
    act(() => {
      result.current.setSessionName("MySession");
      result.current.setLanguage("python");
    });
    await act(async () => {
      await result.current.handleCreateSession();
    });
    expect(pushMock).toHaveBeenCalledWith(
      expect.stringContaining("sessionId=sid"),
    );
    const arg = pushMock.mock.calls[0][0] as string;
    expect(arg).toContain("language=python");
    expect(arg).toContain("inviteCode=ABCD1234");
  });

  it("sets createError on 409 from HttpError", async () => {
    createSessionMock.mockRejectedValueOnce(new HttpError(409, null, "conflict"));
    const { result } = renderHook(() => useSessionActions());
    act(() => result.current.setSessionName("Foo"));
    await act(async () => {
      await result.current.handleCreateSession();
    });
    expect(result.current.createError).toMatch(/Ya existe una sesión/);
  });

  it("sets createError on generic Error", async () => {
    createSessionMock.mockRejectedValueOnce(new Error("nope"));
    const { result } = renderHook(() => useSessionActions());
    act(() => result.current.setSessionName("Foo"));
    await act(async () => {
      await result.current.handleCreateSession();
    });
    expect(result.current.createError).toBe("nope");
  });

  it("sets createError when response lacks sessionId", async () => {
    createSessionMock.mockResolvedValueOnce({ session: {} });
    const { result } = renderHook(() => useSessionActions());
    act(() => result.current.setSessionName("Foo"));
    await act(async () => {
      await result.current.handleCreateSession();
    });
    expect(result.current.createError).toMatch(/no sessionId/);
  });
});

describe("useSessionActions - handleJoinSession", () => {
  it("normalizes invite code + routes", async () => {
    joinSessionMock.mockResolvedValueOnce({
      session: { id: "sid", name: "Joined", language: "java", inviteCode: "AAAA1111" },
    });
    const { result } = renderHook(() => useSessionActions());
    act(() => result.current.setInviteCode(" aaaa1111 "));
    await act(async () => {
      await result.current.handleJoinSession();
    });
    expect(joinSessionMock).toHaveBeenCalledWith("tk", "AAAA1111");
    expect(pushMock).toHaveBeenCalledWith(
      expect.stringContaining("sessionId=sid"),
    );
  });

  it("sets joinError when session id missing", async () => {
    joinSessionMock.mockResolvedValueOnce({ session: {} });
    const { result } = renderHook(() => useSessionActions());
    act(() => result.current.setInviteCode("ABCD1234"));
    await act(async () => {
      await result.current.handleJoinSession();
    });
    expect(result.current.joinError).toMatch(/No se encontro la sesion/);
  });
});

describe("useSessionActions - reset", () => {
  it("resetCreateState clears name/language/error", () => {
    const { result } = renderHook(() => useSessionActions());
    act(() => {
      result.current.setSessionName("foo");
      result.current.setLanguage("python");
    });
    act(() => result.current.resetCreateState());
    expect(result.current.sessionName).toBe("");
    expect(result.current.language).toBe("typescript");
    expect(result.current.createError).toBeNull();
  });

  it("resetJoinState clears code/error", () => {
    const { result } = renderHook(() => useSessionActions());
    act(() => result.current.setInviteCode("ABCD1234"));
    act(() => result.current.resetJoinState());
    expect(result.current.inviteCode).toBe("");
    expect(result.current.joinError).toBeNull();
  });
});
