"use client";

import { GitBranch, GitCommit } from "lucide-react";

export function GitPanel() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-4 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Source Control
        </h2>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <GitBranch className="h-4 w-4" />
          <span>main</span>
        </div>
        <div className="mt-4 space-y-2">
          <p className="text-xs text-muted-foreground">No changes</p>
        </div>
      </div>
    </div>
  );
}
