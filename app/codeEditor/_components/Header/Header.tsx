"use client";

import { useState } from "react";
import {
  Terminal,
  Settings,
  Users,
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEditorStore } from "../../_stores/editorStore";
import { InviteModal } from "./InviteModal";

export function Header() {
  const { toggleTerminal } = useEditorStore();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);

  return (
    <>
      <header className="flex h-12 items-center justify-between border-b border-white/10 bg-background/95 px-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary p-1.5 text-primary-foreground">
            <Terminal className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <span className="bg-gradient-to-linear from-primary to-accent bg-clip-text text-lg font-bold text-transparent">
            OmniCode
          </span>
        </div>

        {/* Call controls */}
        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1">
          <button
            onClick={() => setMuted((v) => !v)}
            aria-label={muted ? "Activar micrófono" : "Silenciar micrófono"}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-white/10",
              muted ? "text-red-400" : "text-muted-foreground",
            )}
          >
            {muted ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => setVideoOff((v) => !v)}
            aria-label={videoOff ? "Activar cámara" : "Desactivar cámara"}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-white/10",
              videoOff ? "text-red-400" : "text-muted-foreground",
            )}
          >
            {videoOff ? (
              <VideoOff className="h-4 w-4" />
            ) : (
              <Video className="h-4 w-4" />
            )}
          </button>
          <button
            aria-label="Finalizar llamada"
            className="flex h-7 w-7 items-center justify-center rounded-md bg-red-500/20 text-red-400 transition-colors hover:bg-red-500/30"
          >
            <PhoneOff className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-foreground"
            onClick={toggleTerminal}
            aria-label="Abrir terminal"
          >
            <Play className="h-4 w-4" />
            Run
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setInviteOpen(true)}
          >
            <Users className="h-4 w-4" />
            Invite
          </Button>
          <Button variant="ghost" size="icon" aria-label="Settings">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </>
  );
}
