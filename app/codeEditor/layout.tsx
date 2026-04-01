"use client";

import { Header } from "./_components/Header/Header";
import { ActivityBar } from "./_components/ActivityBar/ActivityBar";
import { PanelContainer } from "./_components/Panels/PanelContainer";
import { AIDrawer } from "./_components/AIDrawer/AIDrawer";
import { TerminalPanel } from "./_components/Panels/TerminalPanel/TerminalPanel";
import { useEditorStore } from "./_stores/editorStore";

const LEFT_PANEL_WIDTH = 260;
const AI_PANEL_WIDTH = 360;
const TERMINAL_HEIGHT = 220;

export default function CodeEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { activePanel, isAIDrawerOpen, isTerminalOpen } = useEditorStore();
  const showLeftPanel = activePanel !== null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <ActivityBar />

        <div
          style={{ width: showLeftPanel ? LEFT_PANEL_WIDTH : 0 }}
          className="shrink-0 overflow-hidden transition-[width] duration-200 ease-in-out"
        >
          <div
            style={{ width: LEFT_PANEL_WIDTH }}
            className="h-full border-r border-white/10"
          >
            <PanelContainer />
          </div>
        </div>

        <main className="min-w-0 flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">{children}</div>

          <div
            style={{ height: isTerminalOpen ? TERMINAL_HEIGHT : 0 }}
            className="shrink-0 overflow-hidden transition-[height] duration-200 ease-in-out border-t border-white/10"
          >
            <div style={{ height: TERMINAL_HEIGHT }} className="h-full">
              <TerminalPanel />
            </div>
          </div>
        </main>

        <div
          style={{ width: isAIDrawerOpen ? AI_PANEL_WIDTH : 0 }}
          className="shrink-0 overflow-hidden transition-[width] duration-200 ease-in-out"
        >
          <div style={{ width: AI_PANEL_WIDTH }} className="h-full">
            <AIDrawer />
          </div>
        </div>
      </div>
    </div>
  );
}
