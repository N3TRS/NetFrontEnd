"use client";

import { Folder, Phone, Sparkles, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EditorSidebarProps {
  terminalOpen: boolean;
  onToggleTerminal: () => void;
  aiPanelOpen: boolean;
  onToggleAiPanel: () => void;
}

export function EditorSidebar({
  terminalOpen,
  onToggleTerminal,
  aiPanelOpen,
  onToggleAiPanel,
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

      <Button
        size="icon"
        variant="ghost"
        className="cursor-pointer text-muted-foreground hover:bg-white/5 hover:text-white"
        title="Voice call"
        aria-label="Voice call"
      >
        <Phone className="size-4" aria-hidden />
      </Button>

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
