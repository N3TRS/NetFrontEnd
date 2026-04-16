"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock,
  Code2,
  Crown,
  Pencil,
  Trash2,
  User,
  X,
} from "lucide-react";
import {
  renameSession,
  deleteSession,
  HttpError,
  type SessionSummary,
} from "@/app/codeEditor/api";

function formatDateTime(value: string): string {
  try {
    return new Date(value).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function extractErrorMessage(err: unknown): string {
  if (err instanceof HttpError && err.status === 409) {
    return "Ya existe una sesión con este nombre, intenta otro";
  }
  if (err instanceof HttpError && typeof err.body?.message === "string") {
    return err.body.message;
  }
  return err instanceof Error ? err.message : "Ocurrio un error.";
}

type CardMode = "view" | "renaming" | "confirming-delete";

interface SessionCardProps {
  session: SessionSummary;
  currentUserEmail: string | null | undefined;
  token: string | null;
  onRenamed: (id: string, newName: string) => void;
  onDeleted: (id: string) => void;
}

export default function SessionCard({
  session,
  currentUserEmail,
  token,
  onRenamed,
  onDeleted,
}: SessionCardProps) {
  const [mode, setMode] = useState<CardMode>("view");
  const [nameDraft, setNameDraft] = useState(session.name);
  const [isBusy, setIsBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isOwner =
    !!currentUserEmail && session.ownerEmail === currentUserEmail;

  const continueHref = `/codeEditor?sessionId=${encodeURIComponent(session.id)}&language=${encodeURIComponent(session.language)}&inviteCode=${encodeURIComponent(session.inviteCode)}`;

  const startRenaming = () => {
    setNameDraft(session.name);
    setErrorMsg(null);
    setMode("renaming");
  };

  const cancelRenaming = () => {
    setMode("view");
    setErrorMsg(null);
  };

  const submitRename = async () => {
    const trimmed = nameDraft.trim();
    if (!trimmed || !token) return;
    if (trimmed === session.name) {
      setMode("view");
      return;
    }

    setIsBusy(true);
    setErrorMsg(null);
    try {
      await renameSession(token, session.id, trimmed);
      onRenamed(session.id, trimmed);
      setMode("view");
    } catch (err) {
      setErrorMsg(extractErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  };

  const startDeleteConfirm = () => {
    setErrorMsg(null);
    setMode("confirming-delete");
  };

  const cancelDelete = () => {
    setMode("view");
    setErrorMsg(null);
  };

  const submitDelete = async () => {
    if (!token) return;
    setIsBusy(true);
    setErrorMsg(null);
    try {
      await deleteSession(token, session.id);
      onDeleted(session.id);
    } catch (err) {
      setErrorMsg(extractErrorMessage(err));
      setIsBusy(false);
    }
  };

  const borderClass =
    mode === "confirming-delete"
      ? "border-destructive/40"
      : "border-white/10 hover:border-primary/40";

  return (
    <article
      className={`group flex flex-col rounded-2xl border bg-[#0d1117] p-5 transition-colors ${borderClass}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {mode === "renaming" ? (
            <div className="flex items-center gap-1.5">
              <input
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitRename();
                  if (e.key === "Escape") cancelRenaming();
                }}
                disabled={isBusy}
                autoFocus
                className="w-full rounded-md border border-purple-400/30 bg-black/30 px-2 py-1 text-sm text-white outline-none ring-primary/40 focus:ring disabled:opacity-50"
              />
              <button
                type="button"
                onClick={submitRename}
                disabled={isBusy || !nameDraft.trim()}
                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-green-400 disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={cancelRenaming}
                disabled={isBusy}
                className="flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-white disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <h3 className="truncate text-lg font-semibold text-white">
              {session.name}
            </h3>
          )}

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-md border border-purple-400/30 bg-purple-500/15 px-2 py-0.5 text-xs font-medium text-purple-200">
              <Code2 className="h-3 w-3" />
              {session.language}
            </span>
            {isOwner ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                <Crown className="h-3 w-3" />
                Owner
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/5 px-2 py-0.5 text-xs font-medium text-white/70">
                <User className="h-3 w-3" />
                Guest
              </span>
            )}
          </div>
        </div>

        {/* Owner action icons */}
        {isOwner && mode === "view" && (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={startRenaming}
              className="flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-primary"
              title="Renombrar"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={startDeleteConfirm}
              className="flex size-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-destructive"
              title="Eliminar"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {errorMsg && (
        <p className="mt-3 rounded-md border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          {errorMsg}
        </p>
      )}

      {/* Delete confirmation */}
      {mode === "confirming-delete" ? (
        <div className="mt-5 flex flex-col gap-3">
          <p className="text-sm text-white/80">
            ¿Eliminar <span className="font-semibold">&quot;{session.name}&quot;</span>?
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={submitDelete}
              disabled={isBusy}
              className="cursor-pointer rounded-md bg-destructive/20 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/30 disabled:opacity-50"
            >
              {isBusy ? "Eliminando..." : "Confirmar"}
            </button>
            <button
              type="button"
              onClick={cancelDelete}
              disabled={isBusy}
              className="cursor-pointer rounded-md border border-white/15 px-3 py-1.5 text-xs text-white hover:bg-white/5 disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Dates */}
          <dl className="mt-5 grid gap-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              <dt className="font-medium">Creada:</dt>
              <dd>{formatDateTime(session.createdAt)}</dd>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              <dt className="font-medium">Actualizada:</dt>
              <dd>{formatDateTime(session.updatedAt)}</dd>
            </div>
          </dl>

          {/* Continue button */}
          <Link
            href={continueHref}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
          >
            Continuar
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </>
      )}
    </article>
  );
}
