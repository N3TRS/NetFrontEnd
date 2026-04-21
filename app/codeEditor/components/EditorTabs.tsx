"use client";

import { X } from "lucide-react";

interface EditorTabsProps {
  filename: string;
  onClose?: () => void;
}

export function EditorTabs({ filename, onClose }: EditorTabsProps) {
  return (
    <div className="flex h-9 shrink-0 items-center border-b border-white/5 bg-secondary px-3">
      <div className="group inline-flex items-center gap-2 border-b-2 border-primary/60 px-2 py-1.5 text-sm text-white">
        <span className="font-mono text-sm text-muted-foreground group-hover:text-white">
          {filename}
        </span>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${filename}`}
            className="grid size-4 cursor-pointer place-items-center rounded text-muted-foreground hover:bg-white/5 hover:text-white"
          >
            <X className="size-3" aria-hidden />
          </button>
        ) : null}
      </div>
    </div>
  );
}
