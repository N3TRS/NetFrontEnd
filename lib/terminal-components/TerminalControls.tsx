"use client"

import { Loader } from "lucide-react"
import { useTheme } from "@/lib/theme/useTheme"
import { terminalColors } from "@/lib/theme/colors"

interface TerminalControlsProps {
  projectUrl: string | null
  isRunning: boolean
  onRun: () => void
  onClear: () => void
}

export default function TerminalControls({
  projectUrl,
  isRunning,
  onRun,
  onClear,
}: TerminalControlsProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const colors = isDark ? terminalColors.dark : terminalColors.light

  const runButtonStyles = {
    default: {
      backgroundColor: colors.status.running,
      color: isDark ? '#ffffff' : '#ffffff',
      border: 'none',
    },
    hover: {
      backgroundColor: isDark ? colors.status.running : '#0a5db5',
    },
    disabled: {
      backgroundColor: colors.bg.secondary,
      color: colors.text.secondary,
      cursor: 'not-allowed',
      opacity: 0.6,
    },
  }

  const clearButtonStyles = {
    default: {
      backgroundColor: colors.button.bg,
      color: colors.text.primary,
      borderColor: colors.border.primary,
      borderWidth: '1px',
    },
    hover: {
      backgroundColor: colors.button.bgHover,
    },
    disabled: {
      backgroundColor: colors.bg.secondary,
      color: colors.text.secondary,
      cursor: 'not-allowed',
      opacity: 0.6,
      borderColor: colors.border.secondary,
    },
  }

  return (
    <div 
      className="flex flex-col gap-3 sm:gap-4 px-4 py-4 sm:px-6 sm:py-4 border-b transition-theme touch-action-manipulation"
      style={{
        backgroundColor: colors.bg.primary,
        borderBottomColor: colors.border.primary,
      }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2">
        <span 
          className="text-xs sm:text-sm font-jetbrains-mono transition-theme flex-shrink-0"
          style={{ color: colors.text.secondary }}
        >
          Repositorio:
        </span>
        <span 
          className="text-xs sm:text-sm font-jetbrains-mono truncate transition-theme"
          style={{ color: colors.text.primary }}
        >
          {projectUrl || "No hay repositorio seleccionado"}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <button
          onClick={onRun}
          disabled={isRunning}
          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 rounded font-jetbrains-mono font-semibold text-xs sm:text-sm transition-all focus-ring touch-action-manipulation"
          style={isRunning ? runButtonStyles.disabled : runButtonStyles.default}
          onMouseEnter={(e) => {
            if (!isRunning) {
              e.currentTarget.style.backgroundColor = runButtonStyles.hover.backgroundColor
            }
          }}
          onMouseLeave={(e) => {
            if (!isRunning) {
              e.currentTarget.style.backgroundColor = runButtonStyles.default.backgroundColor
            }
          }}
          aria-busy={isRunning}
          aria-label={isRunning ? "Ejecutando construcción" : "Ejecutar construcción"}
        >
          {isRunning ? (
            <>
              <Loader className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
              <span>Procesando…</span>
            </>
          ) : (
            <span>EJECUTAR</span>
          )}
        </button>

        <button
          onClick={onClear}
          disabled={isRunning}
          className="px-4 sm:px-6 py-2 rounded font-jetbrains-mono font-semibold text-xs sm:text-sm transition-all focus-ring touch-action-manipulation"
          style={isRunning ? clearButtonStyles.disabled : clearButtonStyles.default}
          onMouseEnter={(e) => {
            if (!isRunning) {
              e.currentTarget.style.backgroundColor = clearButtonStyles.hover.backgroundColor
            }
          }}
          onMouseLeave={(e) => {
            if (!isRunning) {
              e.currentTarget.style.backgroundColor = clearButtonStyles.default.backgroundColor
            }
          }}
          aria-label="Limpiar consola"
        >
          LIMPIAR CONSOLA
        </button>
      </div>
    </div>
  )
}
