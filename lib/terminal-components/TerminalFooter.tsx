"use client"

import { useEffect, useState } from "react"
import { useTerminalStyles } from "@/lib/theme/useTerminalStyles"

type FooterStatus = "idle" | "running" | "completed" | "failed"

interface TerminalFooterProps {
  status: FooterStatus
  jobName: string | null
  startTime: Date | null
  logCount: number
  exitCode?: number
}

const formatTime = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  const seconds = date.getSeconds().toString().padStart(2, "0")
  return `${hours}:${minutes}:${seconds}`
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}m ${secs}s`
}

export default function TerminalFooter({
  status,
  jobName,
  startTime,
  logCount,
  exitCode,
}: TerminalFooterProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const { getStatusColor, secondaryStyles, textSecondary } = useTerminalStyles({ status: status as "idle" | "running" | "completed" | "failed" })

  useEffect(() => {
    if (status !== "running" || !startTime) return
    const interval = setInterval(() => {
      const now = new Date()
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000)
      setElapsedSeconds(elapsed)
    }, 1000)
    return () => clearInterval(interval)
  }, [status, startTime])

  const getFooterContent = (): { main: string; secondary?: string } => {
    if (status === "idle") return { main: "Sin trabajo activo" }

    if (status === "failed") {
      const exitCodeText = exitCode !== undefined ? ` · código ${exitCode}` : ""
      return {
        main: `${jobName || "Job"} — FALLIDO${exitCodeText}`,
        secondary: `${formatDuration(elapsedSeconds)} · ${logCount} líneas`,
      }
    }

    const startTimeStr = startTime ? formatTime(startTime) : ""
    const statusStr = status === "running" ? "EJECUTÁNDOSE" : "COMPLETADO"

    return {
      main: `${jobName || "Job"} — ${statusStr} · inicio ${startTimeStr}`,
      secondary: `${formatDuration(elapsedSeconds)} · ${logCount} líneas`,
    }
  }

  const footerContent = getFooterContent()

  return (
    <div
      className="flex items-center justify-between gap-4 px-4 sm:px-5 py-2 border-t font-jetbrains-mono text-xs transition-theme"
      style={{
        backgroundColor: secondaryStyles.backgroundColor,
        borderTopColor: secondaryStyles.borderColor,
      }}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="truncate" style={{ color: getStatusColor() }}>
        {footerContent.main}
      </span>
      {footerContent.secondary && (
        <span className="shrink-0 opacity-55" style={textSecondary}>
          {footerContent.secondary}
        </span>
      )}
    </div>
  )
}
