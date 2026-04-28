"use client";

import { Folder, Phone, PhoneIncoming, Sparkles, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Call } from "./_stores/callStore";

interface EditorSidebarProps {
  terminalOpen: boolean;
  onToggleTerminal: () => void;
  aiPanelOpen: boolean;
  onToggleCall: () => void;
  onToggleAiPanel: () => void;
  joinableCall?: Call | null;
  onJoinCall?: (callId: string) => void;
}

export function EditorSidebar({
  terminalOpen,
  onToggleTerminal,
  onToggleCall,
  aiPanelOpen,
  onToggleAiPanel,
  joinableCall,
  onJoinCall,
}: EditorSidebarProps) {
  return (
    <aside
      className="flex w-12 shrink-0 flex-col items-center gap-2 bg-background pt-3"
      aria-label="Editor navigation"
    >
      <Button
        size="icon"
        className="cursor-pointer bg-accent text-white hover:bg-accent/85"
        title="File explorer"
        aria-label="File explorer"
        aria-current="page"
      >
        <Folder className="size-4" aria-hidden />
      </Button>

      {joinableCall ? (
        <div className="relative">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onJoinCall?.(joinableCall.id)}
            className="cursor-pointer text-green-400 hover:bg-green-500/10 hover:text-green-300 animate-pulse"
            title="Unirse a llamada activa"
            aria-label="Unirse a llamada activa"
          >
            <PhoneIncoming className="size-4" aria-hidden />
          </Button>
          <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
          </span>
        </div>
      ) : (
        <Button
          size="icon"
          variant="ghost"
          onClick={onToggleCall}
          className="cursor-pointer text-muted-foreground hover:bg-white/5 hover:text-white"
          title="Iniciar llamada"
          aria-label="Iniciar llamada"
        >
          <Phone className="size-4" aria-hidden />
        </Button>
      )}

      <Button
        size="icon"
        variant="ghost"
        onClick={onToggleAiPanel}
        aria-pressed={aiPanelOpen}
        className={cn(
          "cursor-pointer text-muted-foreground hover:bg-white/5 hover:text-white",
          aiPanelOpen && "bg-white/5 text-white",
        )}
        title={aiPanelOpen ? "Hide AI assistant" : "Show AI assistant"}
        aria-label="Toggle AI assistant"
      >
        <Sparkles className="size-4" aria-hidden />
      </Button>

      <Button
        size="icon"
        variant="ghost"
        onClick={onToggleTerminal}
        aria-pressed={terminalOpen}
        className="cursor-pointer text-muted-foreground hover:bg-white/5 hover:text-white data-[state=open]:bg-white/5 data-[state=open]:text-white"
        title={terminalOpen ? "Hide terminal" : "Show terminal"}
        aria-label="Toggle terminal"
      >
        <Terminal className="size-4" aria-hidden />
      </Button>
    </aside>
  );
}
