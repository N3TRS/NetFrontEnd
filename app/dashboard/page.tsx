"use client";
import { FolderOpen } from "lucide-react";
import EmptyState from "./_components/EmptyState";
import { useAuth } from "@/app/auth/_hooks/useAuth";
import { useState } from "react";
import SelectProject from "./_components/SelectProject";
import type { GithubRepo } from "./_types/github-repo";

export default function Dashboard() {
  const { token } = useAuth();
  const [configOpen, setConfigOpen] = useState(false);

  const handleRepoSelected = (repo: GithubRepo) => {
    console.log("Repo seleccionado:", repo.clone_url);
  };

  return (
    <>
      <div
        className={`section-container mx-auto py-8 flex flex-col gap-8 transition-all duration-300 ${configOpen ? "blur-sm pointer-events-none select-none" : ""
          }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FolderOpen className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Sesiones</h2>
          </div>
        </div>
        <hr className="border-white/5" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FolderOpen className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Proyectos Spring Boot</h2>
          </div>
        </div>
        <EmptyState onSelectProject={() => setConfigOpen(true)} />
      </div>

      <SelectProject
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        token={token}
        onRepoSelected={handleRepoSelected}
      />
    </>
  );
}
