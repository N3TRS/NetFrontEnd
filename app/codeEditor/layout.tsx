"use client";

import { Panel, Group, Separator } from "react-resizable-panels";
import { Header } from "./_components/Header/Header";
import { ActivityBar } from "./_components/ActivityBar/ActivityBar";
import { PanelContainer } from "./_components/Panels/PanelContainer";
import { AIDrawer } from "./_components/AIDrawer/AIDrawer";
import { useEditorStore } from "./_stores/editorStore";

export default function CodeEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { activePanel, isAIDrawerOpen } = useEditorStore();
  const showLeftPanel = activePanel && activePanel !== "ai";
  const layoutKey = `${showLeftPanel ? "L" : ""}-${isAIDrawerOpen ? "R" : ""}`;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <ActivityBar />
        <Group key={layoutKey} orientation="horizontal" className="flex-1">
          {showLeftPanel && (
            <>
              <Panel id="left-panel" defaultSize={20} minSize={10} maxSize={80}>
                <PanelContainer />
              </Panel>
              <Separator className="relative w-1.5 cursor-col-resize bg-border/50 transition-colors hover:bg-primary/50 data-[resize-handle-active]:bg-primary before:absolute before:inset-y-0 before:-left-2 before:-right-2 before:content-['']" />
            </>
          )}

          <Panel id="editor-panel" minSize={15}>
            <main className="h-full">{children}</main>
          </Panel>

          {isAIDrawerOpen && (
            <>
              <Separator className="relative w-1.5 cursor-col-resize bg-border/50 transition-colors hover:bg-primary/50 data-[resize-handle-active]:bg-primary before:absolute before:inset-y-0 before:-left-2 before:-right-2 before:content-['']" />
              <Panel id="ai-panel" defaultSize={25} minSize={15} maxSize={80}>
                <AIDrawer />
              </Panel>
            </>
          )}
        </Group>
      </div>
    </div>
  );
}
