"use client";

import { Lock } from "lucide-react";
import type { GithubRepo } from "../_types/github-repo";

const LANGUAGE_COLORS: Record<string, string> = {
  Java: "bg-orange-500",
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-400",
  Python: "bg-green-500",
  "C#": "bg-purple-500",
  "C++": "bg-pink-500",
  Go: "bg-cyan-400",
  Rust: "bg-orange-400",
  Kotlin: "bg-violet-500",
  HTML: "bg-red-400",
  CSS: "bg-blue-400",
};

function LanguageDot({ language }: { language: string }) {
  const color = LANGUAGE_COLORS[language] ?? "bg-gray-400";
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />
      {language}
    </span>
  );
}

interface GithubRepoCardProps {
  repo: GithubRepo;
  onSelect: (repo: GithubRepo) => void;
}

export default function GithubRepoCard({ repo, onSelect }: GithubRepoCardProps) {
  return (
    <button
      onClick={() => onSelect(repo)}
      className="w-full text-left card-noir px-4 py-3 flex items-center justify-between gap-4 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-2 min-w-0">
        {repo.private && (
          <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        )}
        <span className="text-sm font-medium text-white group-hover:text-primary transition-colors truncate">
          {repo.name}
        </span>
      </div>

      {repo.language && <LanguageDot language={repo.language} />}
    </button>
  );
}
