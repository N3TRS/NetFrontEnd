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
    topPx: 135,
    leftPx: 200,
    bgClass: "bg-primary",
    textClass: "text-primary-foreground",
  },
  {
    name: "alejo",
    topPx: 250,
    leftPx: 510,
    bgClass: "bg-accent",
    textClass: "text-accent-foreground",
  },
];

/**
 * Simulated collaborative IDE editor window — purely presentational, server component.
 */
export default function EditorWindow() {
  return (
    <div className="group relative w-full max-w-5xl">
      {/* Glow border */}
      <div className="absolute -inset-1 rounded-2xl bg-linear-to-r from-primary/30 to-accent/30 opacity-25 blur transition duration-1000 group-hover:opacity-50" />

      <div className="glow-purple relative overflow-hidden rounded-xl border border-white/10 bg-background/80 shadow-2xl backdrop-blur-xl">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
          {/* Traffic lights */}
          <div className="flex gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500/50" />
            <div className="h-3 w-3 rounded-full bg-amber-500/50" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/50" />
          </div>

          {/* File path */}
          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <Terminal className="h-3 w-3" />
            project-omni / src / main.java
          </div>

          {/* Collaborator avatars */}
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

        {/* Editor body */}
        <div className="flex h-100">
          {/* Line numbers */}
          <div className="w-12 select-none border-r border-white/5 py-4 pr-3 text-right font-mono text-xs text-slate-600">
            {Array.from({ length: 16 }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Code area */}
          <div className="relative flex-1 p-4 text-left font-mono text-sm leading-relaxed">
            {/* package */}
            <div>
              <span className="text-accent">package</span>{" "}
              <span className="text-foreground">com.omnicode.api</span>
              <span className="text-muted-foreground">;</span>
            </div>

            {/* imports */}
            <div className="mt-3">
              <span className="text-accent">import</span>{" "}
              <span className="text-slate-300">org.springframework.boot.</span>
              <span className="text-blue-400">SpringApplication</span>
              <span className="text-muted-foreground">;</span>
            </div>
            <div>
              <span className="text-accent">import</span>{" "}
              <span className="text-slate-300">org.springframework.boot.autoconfigure.</span>
              <span className="text-blue-400">SpringBootApplication</span>
              <span className="text-muted-foreground">;</span>
            </div>
            <div>
              <span className="text-accent">import</span>{" "}
              <span className="text-slate-300">org.springframework.web.bind.annotation.</span>
              <span className="text-blue-400">RestController</span>
              <span className="text-muted-foreground">;</span>
            </div>

            {/* annotations */}
            <div className="mt-3">
              <span className="text-primary">@SpringBootApplication</span>
            </div>
            <div>
              <span className="text-primary">@RestController</span>
            </div>

            {/* class */}
            <div>
              <span className="text-accent">public class</span>{" "}
              <span className="text-blue-400">OmniCodeApplication</span>{" "}
              <span className="text-foreground">{"{"}</span>
            </div>

            {/* main */}
            <div className="ml-4 mt-1 text-muted-foreground">
              {"// Entry point — shared live with your team"}
            </div>
            <div className="ml-4">
              <span className="text-accent">public static void</span>{" "}
              <span className="text-blue-400">main</span>
              <span className="text-foreground">(</span>
              <span className="text-accent">String</span>
              <span className="text-foreground">{"[] args) {"}</span>
            </div>
            <div className="ml-8">
              <span className="text-blue-400">SpringApplication</span>
              <span className="text-foreground">.</span>
              <span className="text-primary">run</span>
              <span className="text-foreground">(</span>
              <span className="text-blue-400">OmniCodeApplication</span>
              <span className="text-foreground">.class, args);</span>
            </div>
            <div className="ml-4">
              <span className="text-foreground">{"}"}</span>
            </div>
            <div>
              <span className="text-foreground">{"}"}</span>
            </div>

            {/* Collaborator cursors */}
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
