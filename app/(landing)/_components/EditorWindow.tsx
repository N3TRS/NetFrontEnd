import { Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface Collaborator {
  initials: string;
  bgClass: string;
  textClass: string;
}

interface CollaboratorCursor {
  name: string;
  topPx: number;
  leftPx: number;
  bgClass: string;
  textClass: string;
}

const COLLABORATORS: Collaborator[] = [
  { initials: "JD", bgClass: "bg-primary", textClass: "text-primary-foreground" },
  { initials: "SK", bgClass: "bg-accent", textClass: "text-accent-foreground" },
  { initials: "+2", bgClass: "bg-blue-500", textClass: "text-white" },
];

const CURSORS: CollaboratorCursor[] = [
  {
    name: "tulio",
    topPx: 120,
    leftPx: 180,
    bgClass: "bg-primary",
    textClass: "text-primary-foreground",
  },
  {
    name: "alejo",
    topPx: 200,
    leftPx: 200,
    bgClass: "bg-accent",
    textClass: "text-accent-foreground",
  },
];

export default function EditorWindow() {
  return (
    <div className="group relative w-full max-w-5xl">
      <div className="absolute -inset-1 rounded-2xl bg-linear-to-r from-primary/30 to-accent/30 opacity-25 blur transition duration-1000 group-hover:opacity-50" />

      <div className="glow-purple relative overflow-hidden rounded-xl border border-white/10 bg-background/80 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
          <div className="flex gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500/50" />
            <div className="h-3 w-3 rounded-full bg-amber-500/50" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/50" />
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <Terminal className="h-3 w-3" />
            session-abc / main.py
            <span className="ml-2 rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
              Python 3.12
            </span>
          </div>

          <div className="flex -space-x-2">
            {COLLABORATORS.map(({ initials, bgClass, textClass }) => (
              <div
                key={initials}
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border-2 border-background text-[10px] font-bold",
                  bgClass,
                  textClass,
                )}
              >
                {initials}
              </div>
            ))}
          </div>
        </div>

        <div className="flex h-100">
          <div className="w-12 select-none border-r border-white/5 py-4 pr-3 text-right font-mono text-xs text-slate-600">
            {Array.from({ length: 16 }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          <div className="relative flex-1 p-4 text-left font-mono text-sm leading-relaxed">
            <div className="text-slate-500">{"# OmniCode — edición colaborativa en vivo"}</div>
            <div className="mt-3">
              <span className="text-accent">from</span>{" "}
              <span className="text-foreground">flask</span>{" "}
              <span className="text-accent">import</span>{" "}
              <span className="text-blue-400">Flask</span>
              <span className="text-muted-foreground">, </span>
              <span className="text-blue-400">jsonify</span>
            </div>

            <div className="mt-3">
              <span className="text-foreground">app </span>
              <span className="text-muted-foreground">= </span>
              <span className="text-blue-400">Flask</span>
              <span className="text-foreground">(</span>
              <span className="text-emerald-400">__name__</span>
              <span className="text-foreground">)</span>
            </div>

            <div className="mt-3">
              <span className="text-primary">@app.route</span>
              <span className="text-foreground">(</span>
              <span className="text-amber-400">&ldquo;/hello&rdquo;</span>
              <span className="text-foreground">)</span>
            </div>

            <div>
              <span className="text-accent">def</span>{" "}
              <span className="text-blue-400">hello</span>
              <span className="text-foreground">():</span>
            </div>
            <div className="ml-4">
              <span className="text-accent">return</span>{" "}
              <span className="text-blue-400">jsonify</span>
              <span className="text-foreground">({`{`}</span>
              <span className="text-amber-400">&ldquo;message&rdquo;</span>
              <span className="text-foreground">: </span>
              <span className="text-amber-400">&ldquo;Hello, OmniCode!&rdquo;</span>
              <span className="text-foreground">{`})`}</span>
            </div>

            <div className="mt-3">
              <span className="text-accent">if</span>{" "}
              <span className="text-emerald-400">__name__</span>
              <span className="text-muted-foreground"> == </span>
              <span className="text-amber-400">&ldquo;__main__&rdquo;</span>
              <span className="text-foreground">:</span>
            </div>
            <div className="ml-4">
              <span className="text-foreground">app.</span>
              <span className="text-blue-400">run</span>
              <span className="text-foreground">(</span>
              <span className="text-emerald-400">debug</span>
              <span className="text-muted-foreground">=</span>
              <span className="text-primary">True</span>
              <span className="text-foreground">)</span>
            </div>

            {CURSORS.map(({ name, topPx, leftPx, bgClass, textClass }) => (
              <div
                key={name}
                className="absolute flex flex-col"
                style={{ top: topPx, left: leftPx }}
              >
                <div className={cn("h-5 w-0.5", bgClass)} />
                <div
                  className={cn(
                    "rounded-sm px-1.5 py-0.5 text-[10px] font-bold",
                    bgClass,
                    textClass,
                  )}
                >
                  {name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
