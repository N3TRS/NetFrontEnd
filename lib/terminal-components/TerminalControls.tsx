"use client"

import { Loader, FolderGit2, Eraser } from "lucide-react"
import { useTerminalStyles, useTerminalButtonStyles } from "@/lib/theme/useTerminalStyles"

interface TerminalControlsProps {
  projectUrl: string | null
  isRunning: boolean
  onRun: () => void
  onClear: () => void
  onStop: () => void
}

export default function TerminalControls({
  projectUrl,
  isRunning,
  onRun,
  onClear,
  onStop,
}: TerminalControlsProps) {
  const { baseStyles, textSecondary, textPrimary } = useTerminalStyles()
  const { runButtonStyles, clearButtonStyles } = useTerminalButtonStyles()

  return (
    <div
      className="flex flex-col gap-3 px-4 py-4 sm:px-5 border-b"
      style={{
        backgroundColor: baseStyles.backgroundColor,
        borderBottomColor: baseStyles.borderColor,
      }}
    >
      {/* Repository URL row */}
      <div className="flex items-center gap-2 min-w-0">
        <FolderGit2 className="h-3.5 w-3.5 shrink-0" style={textSecondary} aria-hidden />
        <span className="text-xs font-jetbrains-mono shrink-0" style={textSecondary}>
          Repositorio:
        </span>
        <span
          className="text-xs font-jetbrains-mono font-medium truncate"
          style={textPrimary}
        >
          {projectUrl || "No hay repositorio seleccionado"}
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* Run button */}
        <button
          onClick={onRun}
          disabled={isRunning}
          className="flex items-center justify-center gap-2 px-5 py-2 rounded-lg font-jetbrains-mono font-bold text-xs tracking-wider transition-all focus-ring touch-action-manipulation"
          style={isRunning ? runButtonStyles.disabled : runButtonStyles.default}
          onMouseEnter={(e) => {
            if (!isRunning) e.currentTarget.style.backgroundColor = runButtonStyles.hover.backgroundColor
          }}
          onMouseLeave={(e) => {
            if (!isRunning) e.currentTarget.style.backgroundColor = runButtonStyles.default.backgroundColor
          }}
          aria-busy={isRunning}
          aria-label={isRunning ? "Ejecutando construcción" : "Ejecutar construcción"}
        >
          {isRunning ? (
            <>
              <Loader className="w-3.5 h-3.5 animate-spin" />
              <span>PROCESANDO...</span>
            </>
          ) : (
            <span>▶ EJECUTAR</span>
          )}
        </button>

        {/* Stop / Clear button */}
        {isRunning ? (
          <button
            onClick={onStop}
            className="px-5 py-2 rounded-lg font-jetbrains-mono font-bold text-xs tracking-wider transition-all focus-ring touch-action-manipulation"
            style={{
              backgroundColor: 'rgba(239,68,68,0.10)',
              color: '#fca5a5',
              border: '1px solid rgba(239,68,68,0.22)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.20)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.10)' }}
            aria-label="Detener ejecución"
          >
            ■ DETENER
          </button>
        ) : (
          <button
            onClick={onClear}
            className="flex items-center justify-center gap-2 px-5 py-2 rounded-lg font-jetbrains-mono font-semibold text-xs tracking-wider transition-all focus-ring touch-action-manipulation"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--terminal-text-secondary)',
              border: '1px solid var(--terminal-border)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
              e.currentTarget.style.color = 'var(--terminal-text-primary)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--terminal-text-secondary)'
              e.currentTarget.style.borderColor = 'var(--terminal-border)'
            }}
            aria-label="Limpiar consola"
          >
            <Eraser className="w-3.5 h-3.5" aria-hidden />
            LIMPIAR
          </button>
        )}
      </div>
    </div>
  )
}
