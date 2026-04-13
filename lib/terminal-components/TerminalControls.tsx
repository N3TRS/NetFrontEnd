"use client"

import { Loader } from "lucide-react"

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
  return (
    <div className="flex flex-col gap-4 px-6 py-4 border-b border-white/5 bg-[rgba(26,31,46,0.95)]">
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-sm font-jetbrains-mono">Repository:</span>
        <span className="text-white text-sm font-jetbrains-mono truncate">
          {projectUrl || "No repository selected"}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onRun}
          disabled={isRunning}
          className={`flex items-center justify-center gap-2 px-6 py-2 rounded font-jetbrains-mono font-semibold text-sm transition-all ${isRunning
            ? "bg-gray-600 text-gray-300 cursor-not-allowed opacity-60"
            : "bg-orange-500 text-white hover:bg-orange-600 active:scale-95 cursor-pointer"
            }`}
        >
          {isRunning ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>PROCESANDO</span>
            </>
          ) : (
            <span>CORRER</span>
          )}
        </button>

        <button
          onClick={onClear}
          disabled={isRunning}
          className={`px-6 py-2 rounded font-jetbrains-mono font-semibold text-sm transition-all ${isRunning
            ? "bg-gray-700 text-gray-400 cursor-not-allowed opacity-60"
            : "bg-gray-800 text-gray-300 hover:bg-gray-700 active:scale-95 cursor-pointer border border-white/10"
            }`}
        >
          LIMPIAR CONSOLA
        </button>
      </div>
    </div>
  )
}
