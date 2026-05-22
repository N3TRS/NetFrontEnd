import { renderHook, waitFor, act } from "@testing-library/react";
import { useGithubRepos } from "./useGithubRepos";

const fetchMock = global.fetch as jest.Mock;

beforeEach(() => fetchMock.mockReset());

describe("useGithubRepos", () => {
  it("noop when token is null (no fetch, not loading)", async () => {
    const { result } = renderHook(() => useGithubRepos(null));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.repos).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("loads repos on success", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue([{ id: 1, name: "r1" }]),
    });
    const { result } = renderHook(() => useGithubRepos("tk"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.repos).toEqual([{ id: 1, name: "r1" }]);
    expect(result.current.error).toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/users\/github\/repos$/),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer tk" }),
      }),
    );
  });

  it("captures server error message", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: jest.fn().mockResolvedValue({ message: "unauthorized" }),
    });
    const { result } = renderHook(() => useGithubRepos("tk"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("unauthorized");
  });

  it("handles thrown network error", async () => {
    fetchMock.mockRejectedValueOnce(new Error("boom"));
    const { result } = renderHook(() => useGithubRepos("tk"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("boom");
  });

  it("refetch triggers a new fetch", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([{ id: 1 }]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue([{ id: 2 }]),
      });
    const { result } = renderHook(() => useGithubRepos("tk"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      result.current.refetch();
    });
    await waitFor(() => expect(result.current.repos).toEqual([{ id: 2 }]));
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
