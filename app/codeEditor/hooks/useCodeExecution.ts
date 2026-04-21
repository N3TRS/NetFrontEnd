"use client";

import { useCallback, useEffect, useState } from "react";
import { executeCode } from "../api";
import { LANGUAGE_VERSIONS } from "../Utils/constants";

type Language = keyof typeof LANGUAGE_VERSIONS;

type ExecutionRun = {
  stdout: string;
  stderr: string;
  code: number;
  output?: string;
};

type ExternalExecutionResult = {
  run?: ExecutionRun;
} | null;

export type TerminalLine =
  | { kind: "command"; text: string }
  | { kind: "stdout"; text: string }
  | { kind: "stderr"; text: string }
  | { kind: "info"; text: string; timestamp: string; status: "ok" | "fail" };

interface UseCodeExecutionArgs {
  token: string | null;
  sessionId: string | null;
  language: Language;
  command: string;
  externalResult: ExternalExecutionResult;
}

function timestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function splitLines(text: string): string[] {
  if (!text) return [];
  return text.replace(/\n+$/, "").split("\n");
}

export function useCodeExecution({
  token,
  sessionId,
  language,
  command,
  externalResult,
}: UseCodeExecutionArgs) {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const appendResult = useCallback((run: ExecutionRun) => {
    const stdoutLines = splitLines(run.stdout || run.output || "");
    const stderrLines = splitLines(run.stderr || "");

    setLines((prev) => {
      const next: TerminalLine[] = [...prev];
      stdoutLines.forEach((text) => next.push({ kind: "stdout", text }));
      stderrLines.forEach((text) => next.push({ kind: "stderr", text }));
      const ok = !run.stderr;
      const ts = timestamp();
      next.push({
        kind: "info",
        text: ok ? "Program executed successfully" : "Execution failed",
        timestamp: ts,
        status: ok ? "ok" : "fail",
      });
      next.push({
        kind: "info",
        text: `Exit code: ${run.code}`,
        timestamp: ts,
        status: ok ? "ok" : "fail",
      });
      return next;
    });
  }, []);

  useEffect(() => {
    if (externalResult?.run) appendResult(externalResult.run);
  }, [externalResult, appendResult]);

  const pushLog = useCallback(
    (text: string, status: "ok" | "fail" = "ok") => {
      setLines((prev) => [
        ...prev,
        { kind: "info", text, timestamp: timestamp(), status },
      ]);
    },
    [],
  );

  const run = useCallback(
    async (code: string) => {
      if (!code) {
        pushLog("Please write some code to execute", "fail");
        return;
      }
      if (!token || !sessionId) {
        pushLog("Missing session context. Please rejoin the session.", "fail");
        return;
      }

      setLines((prev) => [...prev, { kind: "command", text: command }]);
      setIsRunning(true);

      try {
        const result = (await executeCode(token, sessionId, language, code)) as
          | { run?: ExecutionRun }
          | undefined;
        if (result?.run) appendResult(result.run);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unknown error occurred";
        setLines((prev) => [
          ...prev,
          {
            kind: "stderr",
            text: `Error: ${message}. Make sure the code is valid for the selected language.`,
          },
        ]);
      } finally {
        setIsRunning(false);
      }
    },
    [appendResult, command, language, pushLog, sessionId, token],
  );

  const clear = useCallback(() => {
    setLines([]);
  }, []);

  return { lines, isRunning, run, pushLog, clear };
}
