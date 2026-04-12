"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { X, Search, RefreshCw } from "lucide-react";
import { useGithubRepos } from "../_hooks/useGithubRepos";
import GithubRepoCard from "./GithubRepoCard";
import type { GithubRepo } from "../_types/github-repo";

interface SelectProjectProps {
  open: boolean;
  onClose: () => void;
  token: string | null;
  onRepoSelected?: (repo: GithubRepo) => void;
}
export default function SelectProject({
  open,
  onClose,
  token,
  onRepoSelected,
}: SelectProjectProps) {
  const { repos, loading, error, refetch } = useGithubRepos(token);
  const [search, setSearch] = useState("");
  const [onlyJava, setOnlyJava] = useState(true);

  const route = useRouter();

  const filteredRepos = useMemo(() => {
    let result = onlyJava
      ? repos.filter((r) => r.language === "Java")
      : repos;

    const query = search.trim().toLowerCase();
    if (query) {
      result = result.filter((r) => r.name.toLowerCase().includes(query));
    }

    return result;
  }, [repos, search, onlyJava]);

  const handleSelect = (repo: GithubRepo) => {
    onRepoSelected?.(repo);
    route.push('running')
  };

  const handleClose = () => {
    setSearch("");
    setOnlyJava(true);
    onClose();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative z-10 w-full max-w-2xl max-h-[80vh] flex flex-col mx-4 rounded-2xl border border-white/10 bg-[#0d1117] shadow-[0_0_60px_-15px_rgba(255,139,16,0.15)]">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-white text-lg font-semibold">
              Seleccionar Repositorio
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Elige el repositorio que deseas ejecutar
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 px-6 pt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar repositorio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-foreground/80 text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {!loading && (
            <button
              onClick={refetch}
              title="Actualizar"
              className="shrink-0 text-muted-foreground hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>
        {!loading && !error && (
          <p className="px-6 pt-3 text-[11px] text-muted-foreground">
            {filteredRepos.length}{" "}
            {filteredRepos.length === 1 ? "repositorio" : "repositorios"}
          </p>
        )}
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
          {loading && (
            <div className="flex flex-col gap-2 mt-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="card-noir px-4 py-3 flex items-center justify-between animate-pulse"
                >
                  <div className="h-4 bg-white/5 rounded w-1/3" />
                  <div className="h-3 bg-white/5 rounded w-16" />
                </div>
              ))}
            </div>
          )}
          {error && !loading && (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <p className="text-sm text-muted-foreground">{error}</p>
              <button
                onClick={refetch}
                className="text-xs text-primary hover:underline cursor-pointer"
              >
                Reintentar
              </button>
            </div>
          )}
          {!loading && !error && filteredRepos.length > 0 && (
            <div className="flex flex-col gap-2 mt-2">
              {filteredRepos.map((repo) => (
                <GithubRepoCard
                  key={repo.id}
                  repo={repo}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
