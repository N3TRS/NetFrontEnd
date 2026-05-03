"use client"

import { Settings } from "lucide-react"
import { useTerminalStyles } from "@/lib/theme/useTerminalStyles"

type TerminalStatus = "idle" | "running" | "completed" | "failed"

interface TerminalHeaderProps {
  status: TerminalStatus
}

export default function TerminalHeader({ status }: TerminalHeaderProps) {
  const {
    getStatusColor,
    getStatusAnimation,
    getStatusText,
    baseStyles,
    secondaryStyles,
    textSecondary,
  } = useTerminalStyles({ status })

  return (
    <div
      className="flex items-center justify-between px-4 py-3 border-b"
      style={{
        backgroundColor: baseStyles.backgroundColor,
        borderBottomColor: baseStyles.borderColor,
      }}
    >
      {/* Left: window dots + status indicator + title */}
      <div className="flex items-center gap-3">
        {/* Decorative macOS-style window dots */}
        <div className="flex items-center gap-1.5" aria-hidden>
          <div className="h-3 w-3 rounded-full bg-red-500/75" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/75" />
          <div className="h-3 w-3 rounded-full bg-green-500/75" />
        </div>

        <div className="h-4 w-px bg-white/10" aria-hidden />

        <div className="flex items-center gap-2.5">
          <div
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${getStatusAnimation()}`}
            style={{ backgroundColor: getStatusColor() }}
            aria-label={`Estado: ${getStatusText()}`}
            role="status"
          />
          <span
            className="font-jetbrains-mono font-semibold text-sm tracking-tight"
            style={{ color: 'var(--terminal-text-primary)' }}
          >
            Omnicode Terminal System{" "}
            <span style={{ color: 'var(--terminal-text-secondary)', fontWeight: 400 }}>V1.0</span>
          </span>
        </div>
      </div>

      {/* Right: status badge + settings */}
      <div className="flex items-center gap-2">
        <div
          className="font-jetbrains-mono text-[11px] font-bold px-2.5 py-1 rounded-md tracking-wider"
          style={{
            color: getStatusColor(),
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
          aria-live="polite"
          aria-atomic="true"
        >
          {getStatusText()}
        </div>

        <button
          className="p-1.5 rounded-md transition-colors focus-ring"
          aria-label="Abrir configuración de terminal"
          style={{ color: textSecondary.color }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = secondaryStyles.backgroundColor
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
