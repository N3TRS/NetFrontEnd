"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { ExternalLink, Timer, AlertCircle } from "lucide-react"
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
    if (jobNameRef.current) clearJob(jobNameRef.current)

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
      setTerminalState((prev) => ({ ...prev, jobName }))

      const cancel = streamLogs(jobName, {
        onLog: (line: string) => {
          const match = line.match(/TUNNEL_URL:\s*(https:\/\/[^\s]+)/)
          if (match) setTunnelUrl(match[1])
          setTerminalState((prev) => ({ ...prev, logs: [...prev.logs, line] }))
        },
        onError: (error: string) => {
          setTerminalState((prev) => ({ ...prev, errorMessage: error }))
        },
        onComplete: (exitCode?: number) => {
          setTerminalState((prev) => ({
            ...prev,
            status: exitCode === 0 || exitCode === undefined ? "completed" : "failed",
            isRunning: false,
            exitCode,
          }))
          cancelStreamRef.current = null
          if (exitCode === 0 || exitCode === undefined) setTestingTimeRemaining(1800)
        },
      })

      cancelStreamRef.current = cancel
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to submit build"
      setTerminalState((prev) => ({
        ...prev,
        status: "failed",
        isRunning: false,
        errorMessage: errorMsg,
      }))
    }
  }, [projectUrl, submitBuild, streamLogs, clearJob])

  const handleClear = useCallback(() => {
    if (jobNameRef.current) clearJob(jobNameRef.current)
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
    if (jobNameRef.current) clearJob(jobNameRef.current)
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
    return () => { cancelStreamRef.current?.() }
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
    if (testingTimeRemaining === 0) { handleClear(); return }
    const timer = setInterval(() => {
      setTestingTimeRemaining((prev) => {
        if (prev === null || prev <= 1) { clearInterval(timer); return null }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [testingTimeRemaining, handleClear])

  useEffect(() => {
    if (terminalState.errorMessage) {
      console.error("Terminal Error:", terminalState.errorMessage)
      if (
        terminalState.errorMessage.includes('WebSocket') ||
        terminalState.errorMessage.includes('disconnect') ||
        terminalState.errorMessage.includes('Connection')
      ) {
        console.warn("WebSocket connection issue - attempting automatic recovery")
      }
    }
  }, [terminalState.errorMessage])

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col gap-4">

      {/* ── Terminal panel card ── */}
      <div className="rounded-2xl border border-white/[0.08] overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.5)] flex flex-col">
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
      </div>

      {/* ── Tunnel URL ── */}
      {tunnelUrl && (
        <a
          href={tunnelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 rounded-xl border border-emerald-500/[0.22] bg-emerald-500/[0.07] px-5 py-4 transition-all hover:border-emerald-500/[0.38] hover:bg-emerald-500/[0.11]"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/[0.12] ring-1 ring-emerald-500/25">
            <ExternalLink className="h-4 w-4 text-emerald-400" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold font-jetbrains-mono text-emerald-400/60 uppercase tracking-widest mb-0.5">
              URL Pública · Activa
            </p>
            <p className="text-sm font-mono text-emerald-300 truncate group-hover:text-emerald-200 transition-colors">
              {tunnelUrl}
            </p>
          </div>
          <ExternalLink className="h-4 w-4 text-emerald-400/40 shrink-0 group-hover:text-emerald-400 transition-colors" aria-hidden />
        </a>
      )}

      {/* ── Testing timer ── */}
      {testingTimeRemaining !== null && (
        <div
          className={`flex items-center gap-3 rounded-xl border px-5 py-4 transition-colors ${
            testingTimeRemaining > 300
              ? 'border-primary/[0.22] bg-primary/[0.07] text-primary'
              : testingTimeRemaining > 60
                ? 'border-amber-500/[0.22] bg-amber-500/[0.07] text-amber-400'
                : 'border-red-500/[0.28] bg-red-500/[0.07] text-red-400'
          }`}
        >
          <Timer className="h-4 w-4 shrink-0" aria-hidden />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold font-jetbrains-mono uppercase tracking-widest opacity-60 mb-0.5">
              Entorno de Testing
            </p>
            <p className="text-sm font-jetbrains-mono">
              {testingTimeRemaining > 0
                ? `${Math.floor(testingTimeRemaining / 60)}:${String(testingTimeRemaining % 60).padStart(2, '0')} restantes`
                : 'Entorno expirado — limpiando...'}
            </p>
          </div>
        </div>
      )}

      {/* ── Error toast ── */}
      {terminalState.errorMessage && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-xl border border-red-500/[0.25] bg-[#0d1117] shadow-[0_0_40px_rgba(0,0,0,0.7),0_0_0_1px_rgba(239,68,68,0.08)] px-4 py-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" aria-hidden />
            <p className="text-sm font-mono text-red-300/90 leading-relaxed">
              {terminalState.errorMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
