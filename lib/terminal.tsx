"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useProject } from "@/app/_contexts/ProjectContext"
import { useNetOrchestrator } from "@/app/running/_hooks/useNetOrchestrator"
import TerminalHeader from "./terminal-components/TerminalHeader"
import TerminalControls from "./terminal-components/TerminalControls"
import TerminalOutput from "./terminal-components/TerminalOutput"
import TerminalFooter from "./terminal-components/TerminalFooter"

type TerminalStatus = "idle" | "running" | "completed" | "failed"

interface TerminalState {
  status: TerminalStatus
  isRunning: boolean
  jobName: string | null
  logs: string[]
  startTime: Date | null
  exitCode?: number
  errorMessage: string | null
}

export default function TerminalRunning() {
  const { projectUrl } = useProject()
  const { submitBuild, streamLogs } = useNetOrchestrator()
  const [terminalState, setTerminalState] = useState<TerminalState>({
    status: "idle",
    isRunning: false,
    jobName: null,
    logs: [],
    startTime: null,
    exitCode: undefined,
    errorMessage: null,
  })

  const cancelStreamRef = useRef<(() => void) | null>(null)

  const handleRun = useCallback(async () => {
    if (!projectUrl) {
      setTerminalState((prev) => ({
        ...prev,
        status: "failed",
        errorMessage: "No repository selected. Please select a project first.",
      }))
      return
    }

    setTerminalState({
      status: "running",
      isRunning: true,
      jobName: null,
      logs: [],
      startTime: new Date(),
      exitCode: undefined,
      errorMessage: null,
    })

    try {
      const jobName = await submitBuild(projectUrl)

      setTerminalState((prev) => ({
        ...prev,
        jobName,
      }))

      const cancel = streamLogs(jobName, {
        onLog: (line: string) => {
          setTerminalState((prev) => ({
            ...prev,
            logs: [...prev.logs, line],
          }))
        },
        onError: (error: string) => {
          setTerminalState((prev) => ({
            ...prev,
            errorMessage: error,
          }))
        },
        onComplete: (exitCode?: number) => {
          setTerminalState((prev) => ({
            ...prev,
            status: exitCode === 0 || exitCode === undefined ? "completed" : "failed",
            isRunning: false,
            exitCode,
          }))
          cancelStreamRef.current = null
        },
      })

      cancelStreamRef.current = cancel
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Failed to submit build"

      setTerminalState((prev) => ({
        ...prev,
        status: "failed",
        isRunning: false,
        errorMessage: errorMsg,
      }))
    }
  }, [projectUrl, submitBuild, streamLogs])

  const handleClear = useCallback(() => {
    cancelStreamRef.current?.()
    cancelStreamRef.current = null

    setTerminalState({
      status: "idle",
      isRunning: false,
      jobName: null,
      logs: [],
      startTime: null,
      exitCode: undefined,
      errorMessage: null,
    })
  }, [])

  useEffect(() => {
    return () => {
      cancelStreamRef.current?.()
    }
  }, [])

  useEffect(() => {
    if (terminalState.errorMessage) {
      console.error("Terminal Error:", terminalState.errorMessage)
    }
  }, [terminalState.errorMessage])

  return (
    <div className="w-full max-w-7xl mx-auto px-6 md:px-10 py-6 flex flex-col h-auto gap-4">
      <TerminalHeader status={terminalState.status} />

      <TerminalControls
        projectUrl={projectUrl}
        isRunning={terminalState.isRunning}
        onRun={handleRun}
        onClear={handleClear}
      />

      <TerminalOutput logs={terminalState.logs} />

      <TerminalFooter
        status={terminalState.status}
        jobName={terminalState.jobName}
        startTime={terminalState.startTime}
        logCount={terminalState.logs.length}
        exitCode={terminalState.exitCode}
      />

      {terminalState.errorMessage && (
        <div className="fixed bottom-4 right-4 bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg max-w-sm">
          <p className="text-sm font-jetbrains-mono">{terminalState.errorMessage}</p>
        </div>
      )}
    </div>
  )
}
