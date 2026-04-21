"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { analyzeCode } from "../api";

interface AIChatPanelProps {
  onGetCode: () => string;
  onClose: () => void;
}

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function AIChatPanel({ onGetCode, onClose }: AIChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const code = onGetCode();
      const { analysis } = await analyzeCode(trimmed, code);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: analysis },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <aside
      className="flex w-80 shrink-0 flex-col border-r border-white/5 bg-background"
      aria-label="AI assistant"
    >
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-white/5 px-3">
        <div className="flex items-center gap-1.5 text-xs font-medium text-white">
          <Sparkles className="size-3.5 text-primary" aria-hidden />
          AI Assistant
        </div>
        <button
          onClick={onClose}
          aria-label="Close AI assistant"
          className="text-muted-foreground transition-colors hover:text-white"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-3 overflow-y-auto px-3 py-3"
      >
        {messages.length === 0 && !isLoading && (
          <p className="text-center text-xs text-muted-foreground">
            Ask anything about your code.
          </p>
        )}

        {messages.map((msg) =>
          msg.role === "user" ? (
            <div key={msg.id} className="flex justify-end">
              <div className="max-w-[85%] rounded-lg bg-white/5 px-3 py-2 text-xs text-white">
                {msg.content}
              </div>
            </div>
          ) : (
            <div key={msg.id} className="flex gap-2">
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
              <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {msg.content}
              </p>
            </div>
          ),
        )}

        {isLoading && (
          <div className="flex gap-1.5 pl-5">
            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
            <span className="size-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
            <span className="size-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
            <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} aria-label="Dismiss error">
              <X className="size-3 hover:text-red-300" />
            </button>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="shrink-0 border-t border-white/5 p-3"
      >
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your code…"
            disabled={isLoading}
            className="h-9 flex-1 border-white/10 bg-secondary text-xs"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="size-9 shrink-0"
            aria-label="Send message"
          >
            <Send className="size-4" aria-hidden />
          </Button>
        </div>
      </form>
    </aside>
  );
}
