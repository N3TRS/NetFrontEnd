"use client";
import { FolderOpen, GitBranch, PenTool } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import EmptyState from "./_components/EmptyState";
import { useAuth } from "@/app/auth/_hooks/useAuth";
import { useState } from "react";
import SelectProject from "./_components/SelectProject";
import type { GithubRepo } from "./_types/github-repo";
import { useSessionActions } from "./_hooks/useSessionActions";
import CreateSessionModal from "./_components/CreateSessionModal";
import JoinSessionModal from "./_components/JoinSessionModal";

export default function Dashboard() {
  const { token } = useAuth();
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

  const handleRepoSelected = (_repo: GithubRepo) => {};

  const openCreateModal = () => {
    resetCreateState();
    setCreateOpen(true);
  };

  const openJoinModal = () => {
    resetJoinState();
    setJoinOpen(true);
  };

  const closeCreateModal = () => {
    setCreateOpen(false);
  };

  const closeJoinModal = () => {
    setJoinOpen(false);
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
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openCreateModal}
              className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/85 transition-colors"
            >
              Crear sesion
            </button>
            <button
              type="button"
              onClick={openJoinModal}
              className="cursor-pointer rounded-md border border-purple-400/40 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-200 hover:bg-purple-500/20 transition-colors"
            >
              Unirse a sesion
            </button>
            <Link
              href="/sessions"
              className="cursor-pointer rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 transition-colors"
            >
              Ver sesiones
            </Link>
          </div>
        </div>
        <hr className="border-white/5" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <GitBranch className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Repositorios GitHub</h2>
          </div>
        </div>
        <EmptyState onSelectProject={() => setConfigOpen(true)} />

        <hr className="border-white/5" />

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <PenTool className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-bold">Diseño</h2>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 flex flex-col items-center gap-4 text-center">
          <p className="text-muted-foreground text-sm max-w-md">
            Crea diagramas, wireframes y esquemas de arquitectura con la pizarra colaborativa.
          </p>
          <Link href="/design">
            <Button className="cursor-pointer bg-accent hover:bg-accent/85 text-accent-foreground font-semibold px-6 glow-purple transition-all">
              Abrir Pizarra
            </Button>
          </Link>
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
