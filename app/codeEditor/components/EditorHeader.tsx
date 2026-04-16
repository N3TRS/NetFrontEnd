"use client";

import { Code2, Play, Save, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageBadge } from "./LanguageBadge";
import {
  ParticipantAvatars,
  type Participant,
} from "./ParticipantAvatars";

interface EditorHeaderProps {
  sessionName: string;
  language: string;
  participants: Participant[];
  isSaving: boolean;
  isRunning: boolean;
  canRun: boolean;
  onInvite: () => void;
  onSave: () => void;
  onRun: () => void;
}

export function EditorHeader({
  sessionName,
  language,
  participants,
  isSaving,
  isRunning,
  canRun,
  onInvite,
  onSave,
  onRun,
}: EditorHeaderProps) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/5 bg-secondary px-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="grid size-7 place-items-center rounded-md bg-accent">
            <Code2 className="size-4 text-white" aria-hidden />
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">
            CodeSync
          </span>
        </div>

        <div className="h-5 w-px bg-white/10" aria-hidden />

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Session:</span>
          <span className="font-medium text-white">{sessionName}</span>
        </div>

        <LanguageBadge language={language} />
      </div>

      <div className="flex items-center gap-3">
        <ParticipantAvatars participants={participants} />

        <Button
          variant="ghost"
          size="sm"
          onClick={onInvite}
          className="cursor-pointer text-white hover:bg-white/5 hover:text-white"
        >
          <UserPlus className="size-4" aria-hidden />
          Invite
        </Button>

        <Button
          size="sm"
          onClick={onSave}
          disabled={isSaving}
          className="cursor-pointer bg-accent text-white hover:bg-accent/85"
        >
          <Save className="size-4" aria-hidden />
          {isSaving ? "Saving..." : "Save"}
        </Button>

        <Button
          size="sm"
          onClick={onRun}
          disabled={isRunning || !canRun}
          className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Play className="size-4 fill-current" aria-hidden />
          {isRunning ? "Running..." : "Run"}
        </Button>
      </div>
    </header>
  );
}
