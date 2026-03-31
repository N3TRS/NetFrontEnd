"use client";

import { useState, useEffect } from "react";
import { Users, ArrowLeft, Crown, Trash2, LogOut, Link2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/_hooks/useAuth";
import { useSessionApi, type SessionSummary } from "@/app/codeEditor/_hooks/useSessionApi";
import CollaborativeSessionCard from "../_components/CollaborativeSessionCard";
import JoinSessionModal from "../_components/JoinSessionModal";
import CreateSessionModal from "../_components/CreateSessionModal";

type FilterType = "all" | "owned" | "joined";

export default function AllSessions() {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  const {
    loading: apiLoading,
    error: apiError,
    getMySessions,
    leaveSession,
    closeSession,
    createSession,
    joinSessionByCode,
  } = useSessionApi(token);

  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);

  // Load sessions
  useEffect(() => {
    const loadSessions = async () => {
      if (!token) {
        setLoadingSessions(false);
        return;
      }

      setLoadingSessions(true);
      const data = await getMySessions();
      setSessions(data);
      setLoadingSessions(false);
    };

    if (!authLoading) {
      loadSessions();
    }
  }, [token, authLoading, getMySessions]);

  // Filter sessions
  const filteredSessions = sessions.filter((s) => {
    if (filter === "owned") return s.isOwner;
    if (filter === "joined") return !s.isOwner;
    return true;
  });

  // Handle leave session
  const handleLeave = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("¿Estás seguro de que quieres salir de esta sesión?")) return;

    setActionLoading(sessionId);
    const success = await leaveSession(sessionId);
    if (success) {
      setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
    }
    setActionLoading(null);
  };

  // Handle close session (owner only)
  const handleClose = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("¿Estás seguro de que quieres cerrar esta sesión? Todos los participantes serán desconectados.")) return;

    setActionLoading(sessionId);
    const success = await closeSession(sessionId);
    if (success) {
      setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
    }
    setActionLoading(null);
  };

  const handleSessionCreated = () => {
    getMySessions().then(setSessions);
  };

  return (
    <>
      <div className={`section-container mx-auto py-8 ${createModalOpen || joinModalOpen ? "blur-sm pointer-events-none" : ""}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Todas las Sesiones</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setJoinModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              <Link2 className="h-4 w-4" />
              Unirse
            </button>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/85 text-primary-foreground text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              <span className="text-lg leading-none">+</span>
              Nueva Sesión
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6">
          {(["all", "owned", "joined"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
              }`}
            >
              {f === "all" && "Todas"}
              {f === "owned" && (
                <span className="flex items-center gap-1.5">
                  <Crown className="h-3.5 w-3.5" />
                  Mis sesiones
                </span>
              )}
              {f === "joined" && "Invitado"}
            </button>
          ))}
        </div>

        {/* Content */}
        {authLoading || loadingSessions ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card-noir p-5 animate-pulse">
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
        ) : filteredSessions.length === 0 ? (
          <div className="card-noir p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {filter === "all" && "No hay sesiones"}
              {filter === "owned" && "No has creado sesiones"}
              {filter === "joined" && "No te has unido a ninguna sesión"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {filter === "all" && "Crea una nueva sesión o únete con un código de invitación"}
              {filter === "owned" && "Crea tu primera sesión colaborativa"}
              {filter === "joined" && "Pide un código de invitación a un compañero"}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setCreateModalOpen(true)}
                className="px-6 py-2.5 bg-primary hover:bg-primary/85 text-primary-foreground text-sm font-medium rounded-lg transition-colors cursor-pointer"
              >
                Crear Sesión
              </button>
              <button
                onClick={() => setJoinModalOpen(true)}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
              >
                Unirse con Código
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSessions.map((session) => (
              <div key={session.sessionId} className="relative group">
                <CollaborativeSessionCard session={session} />
                
                {/* Action buttons overlay */}
                <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {session.isOwner ? (
                    <button
                      onClick={(e) => handleClose(session.sessionId, e)}
                      disabled={actionLoading === session.sessionId}
                      className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      title="Cerrar sesión"
                    >
                      {actionLoading === session.sessionId ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleLeave(session.sessionId, e)}
                      disabled={actionLoading === session.sessionId}
                      className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      title="Salir de sesión"
                    >
                      {actionLoading === session.sessionId ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <LogOut className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {!authLoading && !loadingSessions && sessions.length > 0 && (
          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <span>
              Total: <strong className="text-white">{sessions.length}</strong> sesiones
            </span>
            <span>
              Propias: <strong className="text-white">{sessions.filter((s) => s.isOwner).length}</strong>
            </span>
            <span>
              Invitado: <strong className="text-white">{sessions.filter((s) => !s.isOwner).length}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateSessionModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSessionCreated={handleSessionCreated}
        createSession={createSession}
        loading={apiLoading}
        error={apiError}
      />

      <JoinSessionModal
        open={joinModalOpen}
        onClose={() => setJoinModalOpen(false)}
        onSessionJoined={() => {}}
        joinSessionByCode={joinSessionByCode}
        loading={apiLoading}
        error={apiError}
      />
    </>
  );
}
