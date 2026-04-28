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
      className="flex w-80 shrink-0 flex-col border-r border-white/[0.06] bg-[#0d1117]"
      aria-label="AI assistant"
    >
      {/* ── Header ── */}
      <div className="relative flex h-10 shrink-0 items-center justify-between border-b border-white/[0.06] px-3">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="flex items-center gap-2">
          <div className="flex size-5 items-center justify-center rounded-md bg-primary/15 ring-1 ring-primary/30">
            <Sparkles className="size-3 text-primary" aria-hidden />
          </div>
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-xs font-bold text-transparent">
            AI Assistant
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close AI assistant"
          className="rounded p-0.5 text-muted-foreground transition-colors hover:text-white"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {/* ── Messages ── */}
      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-3 overflow-y-auto px-3 py-3"
      >
        {/* Empty state */}
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
              <Sparkles className="size-5 text-primary" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-medium text-white/60">Asistente de código</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Pregunta cualquier cosa sobre tu código.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg) =>
          msg.role === "user" ? (
            /* ── User bubble ── */
            <div key={msg.id} className="flex justify-end">
              <div className="max-w-[85%] rounded-xl rounded-tr-sm border border-primary/20 bg-primary/10 px-3 py-2 text-xs leading-relaxed text-white/90">
                {msg.content}
              </div>
            </div>
          ) : (
            /* ── AI bubble ── */
            <div key={msg.id} className="flex gap-2">
              <div className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-md bg-accent/15 ring-1 ring-accent/30">
                <Sparkles className="size-3 text-accent" aria-hidden />
              </div>
              <div className="flex-1 rounded-xl rounded-tl-sm border border-white/[0.07] bg-white/[0.03] px-3 py-2.5">
                <p className="text-xs leading-relaxed text-white/90 whitespace-pre-wrap">
                  {msg.content}
                </p>
              </div>
            </div>
          ),
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex gap-2">
            <div className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-md bg-accent/15 ring-1 ring-accent/30">
              <Sparkles className="size-3 text-accent" aria-hidden />
            </div>
            <div className="flex items-center gap-1.5 rounded-xl rounded-tl-sm border border-white/[0.07] bg-white/[0.03] px-3 py-3">
              <span className="size-1.5 animate-pulse rounded-full bg-primary" />
              <span className="size-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
              <span className="size-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/[0.08] px-3 py-2 text-xs text-red-300">
            <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              aria-label="Dismiss error"
              className="text-red-400 transition-colors hover:text-red-200"
            >
              <X className="size-3" />
            </button>
          </div>
        )}
      </div>

      {/* ── Input ── */}
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="shrink-0 border-t border-white/[0.06] p-3"
      >
        <div className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pregunta sobre tu código…"
            disabled={isLoading}
            className="h-9 flex-1 border-white/10 bg-white/[0.04] text-xs text-white placeholder:text-muted-foreground/60 focus-visible:border-primary/40 focus-visible:ring-primary/20"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="size-9 shrink-0 bg-primary text-primary-foreground hover:bg-primary/85 disabled:opacity-40"
            aria-label="Send message"
          >
            <Send className="size-3.5" aria-hidden />
          </Button>
        </div>
      </form>
    </aside>
  );
}
