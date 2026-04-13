"use client"

import { useEffect, useState } from "react"

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

  const getStatusColor = (): string => {
    switch (status) {
      case "running":
        return "text-orange-500"
      case "completed":
        return "text-green-500"
      case "failed":
        return "text-red-500"
      default:
        return "text-gray-400"
    }
  }

  const getStatusText = (): string => {
    switch (status) {
      case "running":
        return "RUNNING"
      case "completed":
        return "COMPLETED"
      case "failed":
        return "FAILED"
      default:
        return "No active job"
    }
  }

  const getFooterContent = (): string => {
    if (status === "idle") {
      return "No active job"
    }

    if (status === "failed") {
      const duration = formatDuration(elapsedSeconds)
      const exitCodeText = exitCode !== undefined ? ` | Exit Code: ${exitCode}` : ""
      return `Job: ${jobName} | FAILED → ${exitCodeText} | Duration: ${duration} | Logs: ${logCount} lines`
    }

    const startTimeStr = startTime ? formatTime(startTime) : ""
    const duration = formatDuration(elapsedSeconds)
    const statusStr = status === "running" ? "RUNNING" : "COMPLETED"

    return `Job: ${jobName} | ${statusStr} → Started: ${startTimeStr} | Duration: ${duration} | Logs: ${logCount} lines`
  }

  return (
    <div
      className={`px-6 py-3 border-t border-white/5 bg-[rgba(26,31,46,0.8)] font-jetbrains-mono text-xs ${getStatusColor()}`}
    >
      {getFooterContent()}
    </div>
  )
}
