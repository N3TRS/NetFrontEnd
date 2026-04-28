"use client";

import { useState, useMemo } from "react";
import { Layers, LogIn, Plus, RefreshCw, Search } from "lucide-react";
import { useAuth } from "@/app/auth/_hooks/useAuth";
import { useMySessions } from "./_hooks/useMySessions";
import SessionCard from "./_components/SessionCard";
import { useSessionActions } from "@/app/dashboard/_hooks/useSessionActions";
import CreateSessionModal from "@/app/dashboard/_components/CreateSessionModal";
import JoinSessionModal from "@/app/dashboard/_components/JoinSessionModal";

export default function SessionsListPage() {
  const { token, user } = useAuth();
  const { sessions, isLoading, error, refetch, updateSessionName, removeSession } =
    useMySessions(token);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"updatedAt" | "createdAt" | "name">("updatedAt");
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const {
    sessionName,
    setSessionName,
    language,
    setLanguage,
    inviteCode,
    setInviteCode,
    isCreating,
    isJoining,
    createError,
    joinError,
    canCreate,
    canJoin,
    handleCreateSession,
    handleJoinSession,
    resetCreateState,
    resetJoinState,
  } = useSessionActions();

  const openCreateModal = () => {
    resetCreateState();
    setCreateOpen(true);
  };

  const openJoinModal = () => {
    resetJoinState();
    setJoinOpen(true);
  };

  const displayed = useMemo(() => {
    if (!sessions) return null;
    const filtered = sessions.filter((s) =>
      s.name.toLowerCase().includes(search.trim().toLowerCase())
    );
    return [...filtered].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return new Date(b[sortBy]).getTime() - new Date(a[sortBy]).getTime();
    });
  }, [sessions, search, sortBy]);

  const isSearchEmpty = displayed !== null && displayed.length === 0 && (sessions?.length ?? 0) > 0;

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-10">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/30">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Mis sesiones</h1>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground ml-12">
            Sesiones colaborativas que has creado o a las que te has unido.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
          >
            <Plus className="h-4 w-4" />
            Crear sesión
          </button>
          <button
            type="button"
            onClick={openJoinModal}
            className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-purple-400/40 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-200 transition-colors hover:bg-purple-500/20"
          >
            <LogIn className="h-4 w-4" />
            Unirse
          </button>
        </div>
      </div>

      {/* Toolbar: search + sort + refresh */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-4 py-2 text-sm text-white placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none transition-colors"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-primary/50 focus:outline-none"
        >
          <option value="updatedAt">Más recientes</option>
          <option value="createdAt">Más antiguas</option>
          <option value="name">Nombre A–Z</option>
        </select>
        <button
          type="button"
          onClick={refetch}
          title="Actualizar"
          className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-muted-foreground transition-colors hover:text-white"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Result count */}
      {displayed && !isLoading && !error && (
        <p className="mb-3 text-xs text-muted-foreground">
          {displayed.length} {displayed.length === 1 ? "sesión" : "sesiones"}
          {search.trim() && ` · resultados para "${search.trim()}"`}
        </p>
      )}

      {isLoading && <SkeletonGrid />}

      {error && !isLoading && (
        <div className="flex flex-col items-start gap-3 rounded-md border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          <span>{error}</span>
          <button
            type="button"
            onClick={refetch}
            className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-xs font-semibold text-amber-100 transition-colors hover:bg-amber-400/20"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reintentar
          </button>
        </div>
      )}

      {!isLoading && !error && sessions && sessions.length === 0 && <EmptySessions onCreateClick={openCreateModal} />}

      {isSearchEmpty && (
        <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
          <Search className="h-8 w-8 opacity-30" />
          <p className="text-sm">
            Sin resultados para{" "}
            <strong className="text-white">&quot;{search}&quot;</strong>
          </p>
          <button
            type="button"
            onClick={() => setSearch("")}
            className="text-xs text-primary hover:underline"
          >
            Limpiar búsqueda
          </button>
        </div>
      )}

      {!isLoading && !error && displayed && displayed.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayed.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              currentUserEmail={user?.email}
              token={token}
              onRenamed={updateSessionName}
              onDeleted={removeSession}
            />
          ))}
        </div>
      )}

      <CreateSessionModal
        open={createOpen}
        sessionName={sessionName}
        language={language}
        isCreating={isCreating}
        error={createError}
        canCreate={canCreate}
        onChangeSessionName={setSessionName}
        onChangeLanguage={(value) => setLanguage(value as typeof language)}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreateSession}
      />

      <JoinSessionModal
        open={joinOpen}
        inviteCode={inviteCode}
        isJoining={isJoining}
        error={joinError}
        canJoin={canJoin}
        onChangeInviteCode={setInviteCode}
        onClose={() => setJoinOpen(false)}
        onJoin={handleJoinSession}
      />
    </section>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-48 animate-pulse rounded-2xl border border-white/10 bg-white/5"
        />
      ))}
    </div>
  );
}

function EmptySessions({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#0d1117] px-6 py-16 text-center">
      <Layers className="h-10 w-10 text-muted-foreground" />
      <h2 className="mt-4 text-lg font-semibold">Aún no tienes sesiones</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Crea una sesión o únete con un código de invitación para empezar a colaborar.
      </p>
      <button
        type="button"
        onClick={onCreateClick}
        className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
      >
        <Plus className="h-4 w-4" />
        Crear sesión
      </button>
    </div>
  );
}
