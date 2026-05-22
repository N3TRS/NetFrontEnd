import { renderHook } from "@testing-library/react";

jest.mock("@/app/auth/_hooks/useAuth", () => ({
  useAuth: () => ({ token: "tk" }),
}));

const onLog = jest.fn();
const onError = jest.fn();
const onComplete = jest.fn();
const socketOn = jest.fn();
const socketEmit = jest.fn();
const socketDisconnect = jest.fn();
const ioMock = jest.fn(() => ({
  on: socketOn,
  emit: socketEmit,
  disconnect: socketDisconnect,
}));

jest.mock("socket.io-client", () => ({ io: (...args: unknown[]) => ioMock(...args) }));

import { useNetOrchestrator } from "./useNetOrchestrator";

const fetchMock = global.fetch as jest.Mock;

beforeEach(() => {
  fetchMock.mockReset();
  ioMock.mockClear();
  socketOn.mockClear();
  socketEmit.mockClear();
  socketDisconnect.mockClear();
  onLog.mockClear();
  onError.mockClear();
  onComplete.mockClear();
});

function getHook() {
  return renderHook(() => useNetOrchestrator()).result.current;
}

describe("useNetOrchestrator.detectJavaVersion", () => {
  it("returns javaVersion on success", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: "OK",
      json: jest.fn().mockResolvedValue({ javaVersion: "17" }),
    });
    const hook = getHook();
    await expect(hook.detectJavaVersion("repo")).resolves.toBe("17");
    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer tk");
  });

  it("throws server detail on non-ok", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: "Bad",
      json: jest.fn().mockResolvedValue({ detail: "bad repo" }),
    });
    const hook = getHook();
    await expect(hook.detectJavaVersion("repo")).rejects.toThrow("bad repo");
  });

  it("falls back to statusText when json fails", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Server Error",
      json: jest.fn().mockRejectedValue(new Error("not json")),
    });
    const hook = getHook();
    await expect(hook.detectJavaVersion("repo")).rejects.toThrow(/Server Error/);
  });
});

describe("useNetOrchestrator.submitBuild", () => {
  it("returns jobName on success", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ jobName: "job-1", message: "ok" }),
    });
    const hook = getHook();
    await expect(hook.submitBuild("repo", "17")).resolves.toBe("job-1");
  });

  it("wraps non-ok in error", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      statusText: "Internal",
    });
    const hook = getHook();
    await expect(hook.submitBuild("repo", "17")).rejects.toThrow(/Internal/);
  });
});

describe("useNetOrchestrator.clearJob", () => {
  it("posts payload (fire and forget)", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true });
    const hook = getHook();
    await hook.clearJob("job-1", true);
    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init.body)).toEqual({ jobName: "job-1" });
    expect(init.keepalive).toBe(true);
  });

  it("swallows errors silently", async () => {
    fetchMock.mockRejectedValueOnce(new Error("nope"));
    const hook = getHook();
    await expect(hook.clearJob("job-1")).resolves.toBeUndefined();
  });
});

describe("useNetOrchestrator.streamLogs", () => {
  it("registers handlers and forwards log lines", () => {
    const hook = getHook();
    const stop = hook.streamLogs("job-1", { onLog, onError, onComplete });

    expect(ioMock).toHaveBeenCalledTimes(1);
    const handlers: Record<string, (...args: unknown[]) => unknown> = {};
    socketOn.mock.calls.forEach(([event, fn]) => {
      handlers[event] = fn;
    });

    handlers.connect();
    expect(socketEmit).toHaveBeenCalledWith("logs", "job-1");

    handlers["logs:data"]("hello");
    expect(onLog).toHaveBeenCalledWith("hello");

    handlers["logs:complete"]();
    expect(onComplete).toHaveBeenCalledWith(0);

    handlers["logs:error"]({ message: "boom" });
    expect(onError).toHaveBeenCalledWith("boom");

    stop();
    expect(socketDisconnect).toHaveBeenCalled();
  });

  it("ignores logs after cancellation", () => {
    const hook = getHook();
    const stop = hook.streamLogs("job-1", { onLog, onError, onComplete });
    const handlers: Record<string, (...args: unknown[]) => unknown> = {};
    socketOn.mock.calls.forEach(([event, fn]) => {
      handlers[event] = fn;
    });
    stop();
    handlers["logs:data"]("late");
    expect(onLog).not.toHaveBeenCalled();
  });

  it("handles synchronous io throw", () => {
    ioMock.mockImplementationOnce(() => {
      throw new Error("io down");
    });
    const hook = getHook();
    hook.streamLogs("job-1", { onLog, onError, onComplete });
    expect(onError).toHaveBeenCalledWith("io down");
    expect(onComplete).toHaveBeenCalledWith(-1);
  });
});
