import { act, renderHook, waitFor } from "@testing-library/react";
import { useAuth } from "./useAuth";

function makeJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.sig`;
}

describe("useAuth", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns unauthenticated when localStorage empty", async () => {
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it("uses stored email/role/avatar if present (no JWT decode)", async () => {
    localStorage.setItem(
      "user",
      JSON.stringify({
        token: "raw-token",
        email: "stored@x.io",
        role: "VIEW_EDIT",
        avatarUrl: "https://img/avatar.png",
      }),
    );
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual({
      token: "raw-token",
      email: "stored@x.io",
      role: "VIEW_EDIT",
      avatarUrl: "https://img/avatar.png",
    });
    expect(result.current.token).toBe("raw-token");
  });

  it("falls back to JWT payload decode when email is missing", async () => {
    const token = makeJwt({ email: "jwt@x.io", role: "VIEW", avatarUrl: "a.png" });
    localStorage.setItem("user", JSON.stringify({ token }));

    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user?.email).toBe("jwt@x.io");
    expect(result.current.user?.role).toBe("VIEW");
    expect(result.current.user?.avatarUrl).toBe("a.png");
  });

  it("ignores malformed JWT (not 3 parts)", async () => {
    localStorage.setItem("user", JSON.stringify({ token: "not.a.valid.jwt.here" }));
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("returns unauthenticated when stored token is non-string", async () => {
    localStorage.setItem("user", JSON.stringify({ token: 123 }));
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toBeNull();
  });

  it("returns unauthenticated when stored JSON is invalid", async () => {
    localStorage.setItem("user", "{not json");
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toBeNull();
  });

  it("logout clears storage + state", async () => {
    localStorage.setItem(
      "user",
      JSON.stringify({ token: "t", email: "x@y.io" }),
    );
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    act(() => result.current.logout());
    expect(localStorage.getItem("user")).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it("refreshAuth re-reads storage", async () => {
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.user).toBeNull();

    localStorage.setItem(
      "user",
      JSON.stringify({ token: "t2", email: "later@x.io" }),
    );
    act(() => result.current.refreshAuth());
    await waitFor(() =>
      expect(result.current.user?.email).toBe("later@x.io"),
    );
  });

  it("responds to storage events from other tabs", async () => {
    const { result } = renderHook(() => useAuth());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    localStorage.setItem(
      "user",
      JSON.stringify({ token: "t3", email: "tab@x.io" }),
    );
    act(() => {
      window.dispatchEvent(new StorageEvent("storage", { key: "user" }));
    });
    await waitFor(() => expect(result.current.user?.email).toBe("tab@x.io"));
  });
});
