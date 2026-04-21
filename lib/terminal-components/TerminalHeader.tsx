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
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-4 sm:px-6 sm:py-4 border-b md:gap-3 transition-theme"
      style={{
        backgroundColor: baseStyles.backgroundColor,
        borderBottomColor: baseStyles.borderColor,
      }}
    >
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div
          className={`w-3 h-3 rounded-full shrink-0 ${getStatusAnimation()}`}
          style={{ color: getStatusColor() }}
          aria-label={`Estado: ${getStatusText()}`}
          role="status"
        ></div>
        <span
          className="font-jetbrains-mono font-bold text-base sm:text-lg transition-theme"
          style={{ color: getStatusColor() }}
        >
          Omnicode Terminal System V1.0
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-0 w-full sm:w-auto">
        <div
          className="font-jetbrains-mono text-xs sm:text-sm font-semibold transition-theme"
          style={{ color: getStatusColor() }}
          aria-live="polite"
          aria-atomic="true"
        >
          {getStatusText()}
        </div>
        <button
          className="transition-theme p-2 rounded focus-ring"
          aria-label="Abrir configuración de terminal"
          style={textSecondary}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = secondaryStyles.backgroundColor
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  )
}

