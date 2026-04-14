"use client"

import { Loader } from "lucide-react"
import { useTerminalStyles, useTerminalButtonStyles } from "@/lib/theme/useTerminalStyles"

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
  const { baseStyles, textSecondary, textPrimary } = useTerminalStyles()
  const { runButtonStyles, clearButtonStyles } = useTerminalButtonStyles()

  return (
    <div 
      className="flex flex-col gap-3 sm:gap-4 px-4 py-4 sm:px-6 sm:py-4 border-b transition-theme touch-action-manipulation"
      style={{
        backgroundColor: baseStyles.backgroundColor,
        borderBottomColor: baseStyles.borderColor,
      }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2">
        <span 
          className="text-xs sm:text-sm font-jetbrains-mono transition-theme flex-shrink-0"
          style={textSecondary}
        >
          Repositorio:
        </span>
        <span 
          className="text-xs sm:text-sm font-jetbrains-mono truncate transition-theme"
          style={textPrimary}
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
