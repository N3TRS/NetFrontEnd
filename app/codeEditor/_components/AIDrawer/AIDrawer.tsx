"use client";

import { X, Bot, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEditorStore } from "../../_stores/editorStore";

export function AIDrawer() {
  const { toggleAIDrawer } = useEditorStore();

  return (
    <div className="flex h-full w-full flex-col border-l border-white/10 bg-background/50">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">AI Assistant</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={toggleAIDrawer}
          aria-label="Close AI Assistant"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="rounded-lg bg-white/5 p-3">
          <p className="text-sm text-muted-foreground">
            Hi! I'm your AI coding assistant. How can I help you today?
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 p-3">
        <div className="flex gap-2">
          <Input placeholder="Ask anything..." className="flex-1" />
          <Button size="icon" aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
