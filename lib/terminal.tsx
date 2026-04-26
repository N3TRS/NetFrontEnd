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
  const { detectJavaVersion, submitBuild, streamLogs, clearJob } = useNetOrchestrator()
  const [terminalState, setTerminalState] = useState<TerminalState>({
    status: "idle",
    isRunning: false,
    jobName: null,
    logs: [],
    startTime: null,
    exitCode: undefined,
    errorMessage: null,
  })
  const [testingTimeRemaining, setTestingTimeRemaining] = useState<number | null>(null)
  const [tunnelUrl, setTunnelUrl] = useState<string | null>(null)

  const cancelStreamRef = useRef<(() => void) | null>(null)
  const jobNameRef = useRef<string | null>(
    typeof window !== "undefined" ? sessionStorage.getItem("active_job_name") : null
  )

  useEffect(() => {
    jobNameRef.current = terminalState.jobName
    if (terminalState.jobName) {
      sessionStorage.setItem("active_job_name", terminalState.jobName)
    } else {
      sessionStorage.removeItem("active_job_name")
    }
  }, [terminalState.jobName])

  const handleRun = useCallback(async () => {
    if (jobNameRef.current) {
      clearJob(jobNameRef.current)
    }

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
      logs: ["[INFO] Detectando versión de Java..."],
      startTime: new Date(),
      exitCode: undefined,
      errorMessage: null,
    })

    try {
      const javaVersion = await detectJavaVersion(projectUrl)

      setTerminalState((prev) => ({
        ...prev,
        logs: [...prev.logs, `[INFO] Versión de Java detectada: ${javaVersion}`],
      }))

      const jobName = await submitBuild(projectUrl, javaVersion)

      setTerminalState((prev) => ({
        ...prev,
        jobName,
      }))

      const cancel = streamLogs(jobName, {
        onLog: (line: string) => {
          const match = line.match(/TUNNEL_URL:\s*(https:\/\/[^\s]+)/)
          if (match) setTunnelUrl(match[1])
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

          if (exitCode === 0 || exitCode === undefined) {
            setTestingTimeRemaining(1800)  // 30 minutos en segundos
          }
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
  }, [projectUrl, submitBuild, streamLogs, clearJob])

  const handleClear = useCallback(() => {
    if (jobNameRef.current) {
      clearJob(jobNameRef.current)
    }

    cancelStreamRef.current?.()
    cancelStreamRef.current = null
    setTunnelUrl(null)

    setTerminalState({
      status: "idle",
      isRunning: false,
      jobName: null,
      logs: [],
      startTime: null,
      exitCode: undefined,
      errorMessage: null,
    })
  }, [clearJob])

  const handleStop = useCallback(() => {
    if (jobNameRef.current) {
      clearJob(jobNameRef.current)
    }

    cancelStreamRef.current?.()
    cancelStreamRef.current = null
    setTunnelUrl(null)

    setTerminalState((prev) => ({
      ...prev,
      status: "failed",
      isRunning: false,
      errorMessage: null,
    }))
  }, [clearJob])

  useEffect(() => {
    return () => {
      cancelStreamRef.current?.()
    }
  }, [])

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!jobNameRef.current) return
      clearJob(jobNameRef.current, true)
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [clearJob])

  useEffect(() => {
    if (testingTimeRemaining === null) return

    if (testingTimeRemaining === 0) {
      handleClear()
      return
    }

    const timer = setInterval(() => {
      setTestingTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer)
          return null
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [testingTimeRemaining, handleClear])

  useEffect(() => {
    if (terminalState.errorMessage) {
      console.error("Terminal Error:", terminalState.errorMessage)

      if (terminalState.errorMessage.includes('WebSocket') ||
        terminalState.errorMessage.includes('disconnect') ||
        terminalState.errorMessage.includes('Connection')) {
        console.warn("WebSocket connection issue - attempting automatic recovery")
      }
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
        onStop={handleStop}
      />

      <TerminalOutput logs={terminalState.logs} />

      <TerminalFooter
        status={terminalState.status}
        jobName={terminalState.jobName}
        startTime={terminalState.startTime}
        logCount={terminalState.logs.length}
        exitCode={terminalState.exitCode}
      />

      {tunnelUrl && (
        <a
          href={tunnelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 px-4 py-3 rounded-lg border bg-green-900 border-green-700 text-green-100 text-sm font-jetbrains-mono hover:bg-green-800 transition-colors"
        >
          <span className="opacity-60 text-xs block mb-0.5">PUBLIC URL</span>
          {tunnelUrl}
        </a>
      )}

      {testingTimeRemaining !== null && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className={`flex-1 px-4 py-3 rounded-lg border text-sm font-jetbrains-mono ${testingTimeRemaining > 60
            ? 'bg-blue-900 border-blue-700 text-blue-100'
            : testingTimeRemaining > 0
              ? 'bg-orange-900 border-orange-700 text-orange-100'
              : 'bg-red-900 border-red-700 text-red-100'
            }`}>
            <p>
              {testingTimeRemaining > 0
                ? `Testing environment ready - ${Math.floor(testingTimeRemaining / 60)}:${String(testingTimeRemaining % 60).padStart(2, '0')} remaining`
                : 'Testing environment expired - cleanup in progress'
              }
            </p>
          </div>
        </div>
      )}

      {terminalState.errorMessage && (
        <div className="fixed bottom-4 right-4 bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg max-w-sm">
          <p className="text-sm font-jetbrains-mono">{terminalState.errorMessage}</p>
        </div>
      )}
    </div>
  )
}
