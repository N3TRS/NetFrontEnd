"use client";

import { useEffect, useRef } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import type { TerminalLine } from "../hooks/useCodeExecution";

interface EditorTerminalProps {
  command: string;
  lines: TerminalLine[];
  onCollapse: () => void;
  onClose: () => void;
}

export function EditorTerminal({
  command,
  lines,
  onCollapse,
  onClose,
}: EditorTerminalProps) {
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  return (
    <section
      className="flex h-[220px] shrink-0 flex-col border-t border-white/5"
      aria-label="Terminal"
    >
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-white/5 bg-background px-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white">Terminal</span>
          <span
            className="size-2 rounded-full bg-green-500"
            aria-label="Active"
          />
          <span className="font-mono text-muted-foreground">{command}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onCollapse}
            aria-label="Collapse terminal"
            className="grid size-6 cursor-pointer place-items-center rounded text-muted-foreground hover:bg-white/5 hover:text-white"
          >
            <ChevronDown className="size-3.5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close terminal"
            className="grid size-6 cursor-pointer place-items-center rounded text-muted-foreground hover:bg-white/5 hover:text-white"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        </div>
      </div>

      <div
        ref={bodyRef}
        className="flex-1 overflow-y-auto bg-secondary px-4 py-2 font-mono text-sm leading-relaxed"
      >
        {lines.length === 0 ? (
          <div className="text-muted-foreground">$ _</div>
        ) : (
          lines.map((line, idx) => <TerminalLineRow key={idx} line={line} />)
        )}
      </div>
    </section>
  );
}

function TerminalLineRow({ line }: { line: TerminalLine }) {
  if (line.kind === "command") {
    return (
      <div className="whitespace-pre-wrap text-white">
        <span className="mr-2 text-primary">$</span>
        {line.text}
      </div>
    );
  }
  if (line.kind === "stdout") {
    return <div className="whitespace-pre-wrap text-white">{line.text}</div>;
  }
  if (line.kind === "stderr") {
    return <div className="whitespace-pre-wrap text-red-400">{line.text}</div>;
  }
  const color = line.status === "ok" ? "text-green-400" : "text-red-400";
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">[{line.timestamp}]</span>
      <Check className={`size-3.5 ${color}`} aria-hidden />
      <span className={color}>{line.text}</span>
    </div>
  );
}
