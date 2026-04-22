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
  const { getStatusColor, secondaryStyles, textSecondary } = useTerminalStyles({ status: status as any })

  useEffect(() => {
    if (status !== "running" || !startTime) {
      return
    }

    const interval = setInterval(() => {
      const now = new Date()
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000)
      setElapsedSeconds(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [status, startTime])

  const getFooterContent = (): { main: string; secondary?: string } => {
    if (status === "idle") {
      return { main: "Sin trabajo activo" }
    }

    if (status === "failed") {
      const duration = formatDuration(elapsedSeconds)
      const exitCodeText = exitCode !== undefined ? ` | Código: ${exitCode}` : ""
      return { 
        main: `${jobName || 'Job'} | FALLIDO → ${exitCodeText}`,
        secondary: `Duración: ${duration} | Líneas: ${logCount}`
      }
    }

    const startTimeStr = startTime ? formatTime(startTime) : ""
    const duration = formatDuration(elapsedSeconds)
    const statusStr = status === "running" ? "EJECUTÁNDOSE" : "COMPLETADO"

    return {
      main: `${jobName || 'Job'} | ${statusStr} → Inicio: ${startTimeStr}`,
      secondary: `Duración: ${duration} | Líneas: ${logCount}`
    }
  }

  const footerContent = getFooterContent()

  return (
    <div
      className="px-4 py-3 sm:px-6 sm:py-3 border-t font-jetbrains-mono text-xs sm:text-sm transition-theme space-y-1"
      style={{
        backgroundColor: secondaryStyles.backgroundColor,
        borderTopColor: secondaryStyles.borderColor,
        color: getStatusColor(),
      }}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex flex-col sm:flex-row gap-1 sm:gap-0">
        <span className="truncate">{footerContent.main}</span>
      </div>
      {footerContent.secondary && (
        <div className="flex flex-col sm:flex-row gap-1 sm:gap-0">
          <span className="truncate text-xs" style={textSecondary}>
            {footerContent.secondary}
          </span>
        </div>
      )}
    </div>
  )
}

