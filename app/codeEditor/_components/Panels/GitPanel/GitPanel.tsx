"use client";

import { useState } from "react";
import { GitBranch, Plus, Upload, GitCommit } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GitPanel() {
  const [commitMessage, setCommitMessage] = useState("");

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-4 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Source Control
        </h2>
      </div>

      <div className="border-b border-white/10 p-3 flex flex-col gap-2">
        <textarea
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="Mensaje del commit..."
          rows={3}
          className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-foreground/80 placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none transition-colors"
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5 text-xs"
            aria-label="Añadir todos los cambios"
          >
            <Plus className="h-3.5 w-3.5" />
            Add All
          </Button>
          <Button
            size="sm"
            className="flex-1 gap-1.5 text-xs"
            aria-label="Hacer commit"
          >
            <GitCommit className="h-3.5 w-3.5" />
            Commit
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-1.5 text-xs"
          aria-label="Subir cambios a GitHub"
        >
          <Upload className="h-3.5 w-3.5" />
          Push to GitHub
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
          <GitBranch className="h-3.5 w-3.5" />
          <span>main</span>
        </div>
        <p className="text-xs text-muted-foreground">Sin cambios pendientes</p>
      </div>
    </div>
  );
}
