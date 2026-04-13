"use client"

import { Settings } from "lucide-react"

type TerminalStatus = "idle" | "running" | "completed" | "failed"

interface TerminalHeaderProps {
  status: TerminalStatus
}

const getStatusColor = (status: TerminalStatus): string => {
  switch (status) {
    case "running":
      return "text-orange-500 animate-pulse"
    case "completed":
      return "text-green-500"
    case "failed":
      return "text-red-500"
    default:
      return "text-gray-400"
  }
}

const getStatusText = (status: TerminalStatus): string => {
  switch (status) {
    case "running":
      return "RUNNING"
    case "completed":
      return "COMPLETED"
    case "failed":
      return "FAILED"
    default:
      return "SYSTEM_READY"
  }
}

export default function TerminalHeader({ status }: TerminalHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[rgba(26,31,46,0.95)]">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
        <span className="font-jetbrains-mono font-bold text-lg text-orange-500">
          Omnicode Terminal System V1.0
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className={`font-jetbrains-mono text-sm font-semibold ${getStatusColor(status)}`}>
          {getStatusText(status)}
        </div>
        <button
          className="text-gray-400 hover:text-white transition-colors cursor-pointer p-2 hover:bg-white/5 rounded"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
