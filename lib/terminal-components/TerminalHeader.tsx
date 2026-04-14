"use client"

import { Settings } from "lucide-react"
import { useTheme } from "@/lib/theme/useTheme"
import { terminalColors } from "@/lib/theme/colors"

type TerminalStatus = "idle" | "running" | "completed" | "failed"

interface TerminalHeaderProps {
  status: TerminalStatus
}

const getStatusColor = (status: TerminalStatus, isDark: boolean): string => {
  const baseColors = isDark ? terminalColors.dark : terminalColors.light
  
  switch (status) {
    case "running":
      return baseColors.status.running
    case "completed":
      return baseColors.status.completed
    case "failed":
      return baseColors.status.failed
    default:
      return baseColors.text.tertiary
  }
}

const getStatusAnimation = (status: TerminalStatus): string => {
  if (status === "running") {
    return "terminal-pulse"
  }
  return ""
}

const getStatusText = (status: TerminalStatus): string => {
  switch (status) {
    case "running":
      return "EJECUTÁNDOSE"
    case "completed":
      return "COMPLETADO"
    case "failed":
      return "FALLIDO"
    default:
      return "SISTEMA_LISTO"
  }
}

export default function TerminalHeader({ status }: TerminalHeaderProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const colors = isDark ? terminalColors.dark : terminalColors.light
  const statusColor = getStatusColor(status, isDark)
  const animation = getStatusAnimation(status)

  return (
    <div 
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-4 sm:px-6 sm:py-4 border-b md:gap-3 transition-theme"
      style={{
        backgroundColor: colors.bg.primary,
        borderBottomColor: colors.border.primary,
      }}
    >
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div 
          className={`w-3 h-3 rounded-full flex-shrink-0 ${animation}`}
          style={{ backgroundColor: statusColor }}
          aria-label={`Estado: ${getStatusText(status)}`}
          role="status"
        ></div>
        <span 
          className="font-jetbrains-mono font-bold text-base sm:text-lg transition-theme"
          style={{ color: statusColor }}
        >
          Omnicode Terminal System V1.0
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-0 w-full sm:w-auto">
        <div 
          className="font-jetbrains-mono text-xs sm:text-sm font-semibold transition-theme"
          style={{ color: statusColor }}
          aria-live="polite"
          aria-atomic="true"
        >
          {getStatusText(status)}
        </div>
        <button
          className="transition-theme p-2 rounded focus-ring"
          aria-label="Abrir configuración de terminal"
          style={{
            color: colors.text.secondary,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.bg.secondary
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

