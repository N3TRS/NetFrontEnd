import { act, renderHook, waitFor } from "@testing-library/react";

import { executeCode } from "../api";
jest.mock("../api", () => ({
  executeCode: jest.fn(),
}));

import { useCodeExecution, type TerminalLine } from "./useCodeExecution";

const executeMock = executeCode as unknown as jest.Mock;

function setup(overrides: Partial<Parameters<typeof useCodeExecution>[0]> = {}) {
  const args = {
    token: "tk",
    sessionId: "sid",
    language: "typescript" as const,
    command: "> run",
    externalResult: null,
    ...overrides,
  };
  return renderHook(({ a }) => useCodeExecution(a), { initialProps: { a: args } });
}

beforeEach(() => executeMock.mockReset());

describe("useCodeExecution", () => {
  it("initial state: empty lines + not running", () => {
    const { result } = setup();
    expect(result.current.lines).toEqual([]);
    expect(result.current.isRunning).toBe(false);
  });

  it("rejects empty code with fail log", async () => {
    const { result } = setup();
    await act(async () => {
      await result.current.run("");
    });
    expect(result.current.lines.find((l) => l.kind === "info" && l.status === "fail")).toBeTruthy();
    expect(executeMock).not.toHaveBeenCalled();
  });

  it("rejects when token or sessionId missing", async () => {
    const { result } = setup({ token: null });
    await act(async () => {
      await result.current.run("x");
    });
    const failLine = result.current.lines.find(
      (l): l is Extract<TerminalLine, { kind: "info" }> =>
        l.kind === "info" && l.status === "fail",
    );
    expect(failLine?.text).toMatch(/Missing session context/);
  });

  it("appends stdout/stderr + ok info on success", async () => {
    executeMock.mockResolvedValueOnce({
      run: { stdout: "hello\nworld", stderr: "", code: 0 },
    });
    const { result } = setup();
    await act(async () => {
      await result.current.run("print x");
    });
    await waitFor(() => expect(result.current.isRunning).toBe(false));
    const kinds = result.current.lines.map((l) => l.kind);
    expect(kinds).toContain("command");
    expect(kinds).toContain("stdout");
    const info = result.current.lines.filter((l) => l.kind === "info");
    expect(info.some((l) => l.kind === "info" && l.status === "ok")).toBe(true);
  });

  it("uses output field when stdout empty", async () => {
    executeMock.mockResolvedValueOnce({
      run: { stdout: "", output: "alt-output", stderr: "", code: 0 },
    });
    const { result } = setup();
    await act(async () => {
      await result.current.run("x");
    });
    expect(
      result.current.lines.find((l) => l.kind === "stdout" && l.text === "alt-output"),
    ).toBeTruthy();
  });

  it("marks fail on stderr", async () => {
    executeMock.mockResolvedValueOnce({
      run: { stdout: "", stderr: "boom", code: 1 },
    });
    const { result } = setup();
    await act(async () => {
      await result.current.run("x");
    });
    const fail = result.current.lines.find(
      (l) => l.kind === "info" && l.status === "fail",
    );
    expect(fail).toBeTruthy();
  });

  it("logs stderr-error line on thrown executeCode", async () => {
    executeMock.mockRejectedValueOnce(new Error("boom"));
    const { result } = setup();
    await act(async () => {
      await result.current.run("x");
    });
    expect(
      result.current.lines.find(
        (l) => l.kind === "stderr" && l.text.includes("boom"),
      ),
    ).toBeTruthy();
  });

  it("clear empties lines", async () => {
    const { result } = setup();
    act(() => result.current.pushLog("hi"));
    expect(result.current.lines).toHaveLength(1);
    act(() => result.current.clear());
    expect(result.current.lines).toEqual([]);
  });

  it("processes externalResult.run automatically", async () => {
    const { result, rerender } = renderHook(
      ({ a }) => useCodeExecution(a),
      {
        initialProps: {
          a: {
            token: "tk",
            sessionId: "sid",
            language: "typescript" as const,
            command: ">",
            externalResult: null,
          },
        },
      },
    );
    rerender({
      a: {
        token: "tk",
        sessionId: "sid",
        language: "typescript" as const,
        command: ">",
        externalResult: { run: { stdout: "ext", stderr: "", code: 0 } },
      },
    });
    await waitFor(() => expect(result.current.lines.length).toBeGreaterThan(0));
    expect(
      result.current.lines.find((l) => l.kind === "stdout" && l.text === "ext"),
    ).toBeTruthy();
  });
});
