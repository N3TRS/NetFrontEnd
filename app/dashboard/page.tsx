"use client";

import { useState } from "react";
import { FolderOpen, ArrowRight } from "lucide-react";
import ProjectConfiguration from "./_components/ProjectConfiguration";
import EmptyState from "./_components/EmptyState";
import SessionCard from "./_components/SessionCard";
import type { ProjectSession } from "./_types/session";

export default function Dashboard() {
  const [configOpen, setConfigOpen] = useState(false);
  const [sessions, setSessions] = useState<ProjectSession[]>([]);

  const handleProjectCreated = (session: ProjectSession) => {
    setSessions((prev) => [session, ...prev]);
  };

  const recentSessions = sessions.slice(0, 3);

  return (
    <>
      <div
        className={`section-container mx-auto py-8 flex flex-col gap-8 transition-all duration-300 ${configOpen ? "blur-sm pointer-events-none select-none" : ""
          }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderOpen className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold">Sesiones de Proyecto</h1>
          </div>
          {sessions.length > 0 && (
            <a
              href="/dashboard/sessions"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Ver todas las sesiones
              <ArrowRight className="h-4 w-4" />
            </a>
          )}
        </div>

        {sessions.length === 0 ? (
          <EmptyState onCreateProject={() => setConfigOpen(true)} />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>

            <div className="flex items-center justify-center">
              <button
                onClick={() => setConfigOpen(true)}
                className="cursor-pointer group bg-white/5 border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center gap-4 hover:border-primary/60 hover:bg-primary/5 transition-all w-full max-w-sm"
              >
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-[0_0_20px_rgba(249,139,21,0.3)] group-hover:scale-110 transition-transform">
                  <span className="text-4xl font-bold leading-none">+</span>
                </div>
                <div className="text-center">
                  <span className="block text-lg font-bold text-white">
                    Nueva Sesion
                  </span>
                  <span className="text-xs text-muted-foreground uppercase tracking-tighter">
                    Empezar un espacio de trabajo vacio
                  </span>
                </div>
              </button>
            </div>
          </>
        )}
      </div>

      <ProjectConfiguration
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </>
  );
}
