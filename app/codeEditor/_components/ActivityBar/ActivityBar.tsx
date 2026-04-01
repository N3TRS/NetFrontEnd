"use client";

import { Files, Search, GitBranch, Bot, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditorStore, type PanelType, type LeftPanelType } from "../../_stores/editorStore";

interface ActivityItem {
  id: PanelType;
  icon: LucideIcon;
  label: string;
}

const ACTIVITIES: ActivityItem[] = [
  { id: "files", icon: Files, label: "Explorer" },
  { id: "search", icon: Search, label: "Search" },
  { id: "git", icon: GitBranch, label: "Source Control" },
  { id: "ai", icon: Bot, label: "AI Assistant" },
];

export function ActivityBar() {
  const { activePanel, isAIDrawerOpen, setActivePanel, toggleAIDrawer } = useEditorStore();

  const handleClick = (id: PanelType) => {
    if (id === "ai") {
      toggleAIDrawer();
    } else {
      setActivePanel(activePanel === id ? null : (id as LeftPanelType));
    }
  };

  const isActive = (id: PanelType) =>
    id === "ai" ? isAIDrawerOpen : activePanel === id;

  return (
    <aside className="flex w-12 flex-col items-center gap-1 border-r border-white/10 bg-background/50 py-2">
      {ACTIVITIES.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => handleClick(id)}
          aria-label={label}
          aria-pressed={isActive(id)}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-md transition-colors",
            "hover:bg-white/10",
            isActive(id)
              ? "border-l-2 border-primary bg-white/5 text-primary"
              : "text-muted-foreground",
          )}
        >
          <Icon className="h-5 w-5" />
        </button>
      ))}
    </aside>
  );
}
