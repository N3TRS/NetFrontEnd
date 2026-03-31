"use client";

import { useEditorStore } from "../../_stores/editorStore";
import { FileExplorer } from "./FileExplorer/FileExplorer";
import { SearchPanel } from "./SearchPanel/SearchPanel";
import { GitPanel } from "./GitPanel/GitPanel";

export function PanelContainer() {
  const { activePanel } = useEditorStore();

  if (!activePanel || activePanel === "ai") {
    return null;
  }

  return (
    <div className="flex h-full w-full flex-col bg-background/30">
      {activePanel === "files" && <FileExplorer />}
      {activePanel === "search" && <SearchPanel />}
      {activePanel === "git" && <GitPanel />}
    </div>
  );
}
