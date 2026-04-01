"use client";

import { Play, Square, Trash2, X } from "lucide-react";
import { useEditorStore } from "../../../_stores/editorStore";

export function TerminalPanel() {
  const { toggleTerminal } = useEditorStore();

  return (
    <div className="flex h-full flex-col bg-background font-mono text-sm">
      <div className="flex items-center gap-1 border-b border-white/10 px-3 py-1.5">
        <span className="flex-1 text-xs font-medium text-muted-foreground">
          Terminal
        </span>
        <button
          aria-label="Ejecutar"
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
        >
          <Play className="h-3.5 w-3.5" />
        </button>
        <button
          aria-label="Detener"
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
        >
          <Square className="h-3.5 w-3.5" />
        </button>
        <button
          aria-label="Limpiar terminal"
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <div className="mx-1 h-4 w-px bg-white/10" />
        <button
          onClick={toggleTerminal}
          aria-label="Cerrar terminal"
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-3 text-xs leading-relaxed text-muted-foreground/70">
        <span className="text-primary/70">$</span>
        <span className="ml-1 animate-pulse">_</span>
      </div>
    </div>
  );
}
