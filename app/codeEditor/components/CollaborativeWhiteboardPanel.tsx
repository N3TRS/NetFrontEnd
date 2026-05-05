"use client";

import dynamic from "next/dynamic";
import { PenTool, X } from "lucide-react";

const CollaborativeWhiteboardDynamic = dynamic(
  () => import("./CollaborativeWhiteboard"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <PenTool className="size-8 text-purple-400/40 animate-pulse" aria-hidden />
          <span>Cargando pizarra…</span>
        </div>
      </div>
    ),
  },
);

interface CollaborativeWhiteboardPanelProps {
  sessionId: string | null;
  token: string | null;
  userEmail: string | null;
  userColor: string | null;
  onClose: () => void;
}

export function CollaborativeWhiteboardPanel({
  sessionId,
  token,
  userEmail,
  userColor,
  onClose,
}: CollaborativeWhiteboardPanelProps) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Header */}
      <div className="relative flex h-10 shrink-0 items-center justify-between border-b border-white/[0.06] bg-secondary px-3">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
        <div className="flex items-center gap-2">
          <div className="flex size-5 items-center justify-center rounded-md bg-purple-500/15 ring-1 ring-purple-500/30">
            <PenTool className="size-3 text-purple-400" aria-hidden />
          </div>
          <span className="text-xs font-bold text-white/70">Pizarra Colaborativa</span>
          <div className="flex items-center gap-1 rounded-full border border-green-500/30 bg-green-500/10 px-1.5 py-0.5">
            <span className="size-1.5 rounded-full bg-green-400 animate-pulse" aria-hidden />
            <span className="text-[10px] font-medium text-green-400">En vivo</span>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Cerrar pizarra"
          className="rounded p-0.5 text-muted-foreground transition-colors hover:text-white"
        >
          <X className="size-3.5" aria-hidden />
        </button>
      </div>

      {/* Board area */}
      <div className="flex-1 overflow-hidden">
        <CollaborativeWhiteboardDynamic
          sessionId={sessionId}
          token={token}
          userEmail={userEmail}
          userColor={userColor}
        />
      </div>
    </div>
  );
}
