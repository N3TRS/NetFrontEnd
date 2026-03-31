"use client";

import { useState, useEffect } from "react";
import { FolderOpen, ArrowRight, Users, Link2 } from "lucide-react";
import ProjectConfiguration from "./_components/ProjectConfiguration";
import EmptyState from "./_components/EmptyState";
import SessionCard from "./_components/SessionCard";
import CollaborativeSessionCard from "./_components/CollaborativeSessionCard";
import CreateSessionModal from "./_components/CreateSessionModal";
import JoinSessionModal from "./_components/JoinSessionModal";
import type { ProjectSession } from "./_types/session";
import type { SessionSummary, Session } from "./_types/collaborative-session";
import { useAuth } from "@/app/_hooks/useAuth";
import { useSessionApi } from "@/app/codeEditor/_hooks/useSessionApi";

export default function Dashboard() {
  // Project configuration modal
  const [configOpen, setConfigOpen] = useState(false);
  const [sessions, setSessions] = useState<ProjectSession[]>([]);

  // Collaborative sessions
  const [createSessionOpen, setCreateSessionOpen] = useState(false);
  const [joinSessionOpen, setJoinSessionOpen] = useState(false);
  const [collaborativeSessions, setCollaborativeSessions] = useState<SessionSummary[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // Auth & API
  const { token, isLoading: authLoading } = useAuth();
  const {
    loading: apiLoading,
    error: apiError,
    createSession,
    joinSessionByCode,
    getMySessions,
  } = useSessionApi(token);

  // Load collaborative sessions on mount
  useEffect(() => {
    const loadSessions = async () => {
      if (!token) {
        setLoadingSessions(false);
        return;
      }

      setLoadingSessions(true);
      const sessions = await getMySessions();
      setCollaborativeSessions(sessions);
      setLoadingSessions(false);
    };

    if (!authLoading) {
      loadSessions();
    }
  }, [token, authLoading, getMySessions]);

  const handleProjectCreated = (session: ProjectSession) => {
    setSessions((prev) => [session, ...prev]);
  };

  const handleSessionCreated = (session: Session) => {
    // Refresh the sessions list
    getMySessions().then(setCollaborativeSessions);
  };

  const handleSessionJoined = () => {
    // Session joined - will navigate to editor
  };

  const recentSessions = sessions.slice(0, 3);
  const recentCollaborative = collaborativeSessions.slice(0, 3);
  const hasAnySessions = sessions.length > 0 || collaborativeSessions.length > 0;
  const isAnyModalOpen = configOpen || createSessionOpen || joinSessionOpen;

  return (
    <>
      <div
        className={`section-container mx-auto py-8 flex flex-col gap-8 transition-all duration-300 ${
          isAnyModalOpen ? "blur-sm pointer-events-none select-none" : ""
        }`}
      >
        {/* Collaborative Sessions Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Sesiones Colaborativas</h2>
            </div>
            {collaborativeSessions.length > 3 && (
              <a
                href="/dashboard/sessions"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Ver todas
                <ArrowRight className="h-4 w-4" />
              </a>
            )}
          </div>

          {authLoading || loadingSessions ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="card-noir p-5 animate-pulse"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/5" />
                    <div className="flex-1">
                      <div className="h-4 bg-white/5 rounded w-2/3 mb-2" />
                      <div className="h-3 bg-white/5 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentCollaborative.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentCollaborative.map((session) => (
                <CollaborativeSessionCard key={session.sessionId} session={session} />
              ))}
            </div>
          ) : (
            <div className="card-noir p-8 text-center">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                No tienes sesiones colaborativas activas
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => setCreateSessionOpen(true)}
              className="cursor-pointer group bg-white/5 border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:border-primary/60 hover:bg-primary/5 transition-all w-full max-w-xs"
            >
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-[0_0_20px_rgba(249,139,21,0.3)] group-hover:scale-110 transition-transform">
                <span className="text-2xl font-bold leading-none">+</span>
              </div>
              <div className="text-center">
                <span className="block text-sm font-bold text-white">
                  Nueva Sesión
                </span>
                <span className="text-xs text-muted-foreground">
                  Crear espacio colaborativo
                </span>
              </div>
            </button>

            <button
              onClick={() => setJoinSessionOpen(true)}
              className="cursor-pointer group bg-white/5 border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:border-purple-500/60 hover:bg-purple-500/5 transition-all w-full max-w-xs"
            >
              <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(90,24,154,0.3)] group-hover:scale-110 transition-transform">
                <Link2 className="h-5 w-5" />
              </div>
              <div className="text-center">
                <span className="block text-sm font-bold text-white">
                  Unirse con Código
                </span>
                <span className="text-xs text-muted-foreground">
                  Ingresar a sesión existente
                </span>
              </div>
            </button>
          </div>
        </section>

        {/* Divider */}
        <hr className="border-white/5" />

        {/* Spring Boot Projects Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FolderOpen className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Proyectos Spring Boot</h2>
            </div>
            {sessions.length > 0 && (
              <a
                href="/dashboard/sessions"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Ver todos
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
                  <SessionCard key={session.containerId} session={session} />
                ))}
              </div>

              <div className="flex items-center justify-center mt-6">
                <button
                  onClick={() => setConfigOpen(true)}
                  className="cursor-pointer group bg-white/5 border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:border-primary/60 hover:bg-primary/5 transition-all w-full max-w-xs"
                >
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-[0_0_20px_rgba(249,139,21,0.3)] group-hover:scale-110 transition-transform">
                    <span className="text-2xl font-bold leading-none">+</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-sm font-bold text-white">
                      Nuevo Proyecto
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Crear proyecto Spring Boot
                    </span>
                  </div>
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      {/* Modals */}
      <ProjectConfiguration
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        onProjectCreated={handleProjectCreated}
      />

      <CreateSessionModal
        open={createSessionOpen}
        onClose={() => setCreateSessionOpen(false)}
        onSessionCreated={handleSessionCreated}
        createSession={createSession}
        loading={apiLoading}
        error={apiError}
      />

      <JoinSessionModal
        open={joinSessionOpen}
        onClose={() => setJoinSessionOpen(false)}
        onSessionJoined={handleSessionJoined}
        joinSessionByCode={joinSessionByCode}
        loading={apiLoading}
        error={apiError}
      />
    </>
  );
}
