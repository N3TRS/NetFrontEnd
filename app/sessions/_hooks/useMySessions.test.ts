import { act, renderHook, waitFor } from "@testing-library/react";

import { listSessions, HttpError } from "@/app/codeEditor/api";
jest.mock("@/app/codeEditor/api", () => {
  const actual = jest.requireActual("@/app/codeEditor/api");
  return { ...actual, listSessions: jest.fn() };
});

import { useMySessions } from "./useMySessions";

const listMock = listSessions as unknown as jest.Mock;

beforeEach(() => listMock.mockReset());

const sample = {
  id: "1",
  name: "S1",
  language: "typescript",
  inviteCode: "AAAA1111",
  ownerEmail: "o@x.io",
  isActive: true,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

describe("useMySessions", () => {
  it("returns nulls when no token", async () => {
    const { result } = renderHook(() => useMySessions(null));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.sessions).toBeNull();
    expect(listMock).not.toHaveBeenCalled();
  });

  it("loads sessions on success", async () => {
    listMock.mockResolvedValueOnce({ sessions: [sample] });
    const { result } = renderHook(() => useMySessions("tk"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.sessions).toEqual([sample]);
  });

  it("uses HttpError body.message when available", async () => {
    listMock.mockRejectedValueOnce(
      new HttpError(500, { message: "DB down" }, "DB down"),
    );
    const { result } = renderHook(() => useMySessions("tk"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe("DB down");
  });

  it("falls back to Error.message", async () => {
    listMock.mockRejectedValueOnce(new Error("oops"));
    const { result } = renderHook(() => useMySessions("tk"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe("oops");
  });

  it("updateSessionName mutates the cached list", async () => {
    listMock.mockResolvedValueOnce({ sessions: [sample] });
    const { result } = renderHook(() => useMySessions("tk"));
    await waitFor(() => expect(result.current.sessions).toHaveLength(1));
    act(() => result.current.updateSessionName("1", "RenamedS"));
    expect(result.current.sessions?.[0].name).toBe("RenamedS");
  });

  it("removeSession filters by id", async () => {
    listMock.mockResolvedValueOnce({
      sessions: [sample, { ...sample, id: "2", name: "S2" }],
    });
    const { result } = renderHook(() => useMySessions("tk"));
    await waitFor(() => expect(result.current.sessions).toHaveLength(2));
    act(() => result.current.removeSession("1"));
    expect(result.current.sessions).toHaveLength(1);
    expect(result.current.sessions?.[0].id).toBe("2");
  });

  it("refetch triggers a new request", async () => {
    listMock
      .mockResolvedValueOnce({ sessions: [sample] })
      .mockResolvedValueOnce({ sessions: [{ ...sample, name: "Renamed" }] });
    const { result } = renderHook(() => useMySessions("tk"));
    await waitFor(() => expect(result.current.sessions).toHaveLength(1));
    act(() => result.current.refetch());
    await waitFor(() =>
      expect(result.current.sessions?.[0].name).toBe("Renamed"),
    );
    expect(listMock).toHaveBeenCalledTimes(2);
  });

  it("falls back to [] when data.sessions is null/undefined", async () => {
    listMock.mockResolvedValueOnce({});
    const { result } = renderHook(() => useMySessions("tk"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.sessions).toEqual([]);
  });

  it("uses generic message for non-Error thrown", async () => {
    listMock.mockRejectedValueOnce("plain string error");
    const { result } = renderHook(() => useMySessions("tk"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe("No se pudieron cargar las sesiones.");
  });

  it("updateSessionName is no-op when sessions is null", () => {
    const { result } = renderHook(() => useMySessions(null));
    act(() => result.current.updateSessionName("1", "New"));
    expect(result.current.sessions).toBeNull();
  });

  it("removeSession is no-op when sessions is null", () => {
    const { result } = renderHook(() => useMySessions(null));
    act(() => result.current.removeSession("1"));
    expect(result.current.sessions).toBeNull();
  });
});
