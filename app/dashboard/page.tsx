"use client";
import { GitBranch } from "lucide-react";
import { useAuth } from "@/app/auth/_hooks/useAuth";
import { useState } from "react";
import EmptyState from "./_components/EmptyState";
import SelectProject from "./_components/SelectProject";
import type { GithubRepo } from "./_types/github-repo";
import { useSessionActions } from "./_hooks/useSessionActions";
import CreateSessionModal from "./_components/CreateSessionModal";
import JoinSessionModal from "./_components/JoinSessionModal";
import SessionsHero from "./_components/SessionsHero";
import { useMySessions } from "@/app/sessions/_hooks/useMySessions";

export default function Dashboard() {
  const { token, user } = useAuth();
  const [configOpen, setConfigOpen] = useState(false);
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

  const { sessions, isLoading: sessionsLoading } = useMySessions(token);

  const recentSessions = sessions
    ? [...sessions]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 3)
    : null;

  const handleRepoSelected = (_repo: GithubRepo) => {};

  const openCreateModal = () => { resetCreateState(); setCreateOpen(true); };
  const openJoinModal = () => { resetJoinState(); setJoinOpen(true); };
  const closeCreateModal = () => setCreateOpen(false);
  const closeJoinModal = () => setJoinOpen(false);

  return (
    <>
      <div
        className={`section-container mx-auto py-8 flex flex-col gap-8 transition-all duration-300 ${
          configOpen ? "blur-sm pointer-events-none select-none" : ""
        }`}
      >
        {/* ── Primary: Sessions ── */}
        <SessionsHero
          sessions={recentSessions}
          isLoading={sessionsLoading}
          currentUserEmail={user?.email}
          onCreateClick={openCreateModal}
          onJoinClick={openJoinModal}
        />

        {/* ── Divider ── */}
        <div className="flex items-center gap-4">
          <hr className="flex-1 border-white/[0.05]" />
          <span className="text-[10px] font-semibold text-white/25 uppercase tracking-[0.18em]">
            Herramientas
          </span>
          <hr className="flex-1 border-white/[0.05]" />
        </div>

        {/* ── GitHub Repos card ── */}
        <div className="relative overflow-hidden rounded-2xl border border-sky-500/[0.16] bg-[#0d1117] flex flex-col transition-colors hover:border-sky-500/[0.28]">
          {/* Top accent line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/40 to-transparent" />

          {/* Header */}
          <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-white/[0.05]">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 ring-1 ring-sky-500/25">
              <GitBranch className="h-4 w-4 text-sky-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white/80">Repositorios GitHub</h2>
              <p className="text-xs text-muted-foreground">Ejecuta tu proyecto Maven</p>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 flex-1">
            <EmptyState onSelectProject={() => setConfigOpen(true)} />
          </div>
        </div>
      </div>

      <SelectProject
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        token={token}
        onRepoSelected={handleRepoSelected}
      />

      <CreateSessionModal
        open={createOpen}
        sessionName={sessionName}
        language={language}
        isCreating={isCreating}
        error={createError}
        canCreate={canCreate}
        onChangeSessionName={setSessionName}
        onChangeLanguage={(value) => setLanguage(value as typeof language)}
        onClose={closeCreateModal}
        onCreate={handleCreateSession}
      />

      <JoinSessionModal
        open={joinOpen}
        inviteCode={inviteCode}
        isJoining={isJoining}
        error={joinError}
        canJoin={canJoin}
        onChangeInviteCode={setInviteCode}
        onClose={closeJoinModal}
        onJoin={handleJoinSession}
      />
    </>
  );
}
