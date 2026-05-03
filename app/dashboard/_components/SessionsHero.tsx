"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight, Crown, FolderOpen, Layers, LogIn, Plus } from "lucide-react";
import { LANGUAGE_COLORS } from "@/app/codeEditor/Utils/constants";
import type { SessionSummary } from "@/app/codeEditor/api";

function relativeTime(iso: string): string {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
  const abs = Math.abs(diff);
  if (abs < 3600) return rtf.format(Math.round(diff / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), "hour");
  return rtf.format(Math.round(diff / 86400), "day");
}

interface DashboardSessionRowProps {
  session: SessionSummary;
  currentUserEmail: string | null | undefined;
}

function DashboardSessionRow({ session, currentUserEmail }: DashboardSessionRowProps) {
  const isOwner = !!currentUserEmail && session.ownerEmail === currentUserEmail;
  const continueHref = `/codeEditor?sessionId=${encodeURIComponent(session.id)}&language=${encodeURIComponent(session.language)}&inviteCode=${encodeURIComponent(session.inviteCode)}&name=${encodeURIComponent(session.name)}`;
  const langColor = LANGUAGE_COLORS[session.language as keyof typeof LANGUAGE_COLORS] ?? "#6e7681";

  return (
    <article className="group flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 transition-colors hover:border-primary/45 hover:bg-primary/[0.08]">
      <span
        className="size-2 shrink-0 rounded-full"
        style={{ background: langColor }}
      />
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">
        {session.name}
      </span>
      {isOwner && (
        <span className="inline-flex shrink-0 items-center gap-1 rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
          <Crown className="h-2.5 w-2.5" />
          Owner
        </span>
      )}
      <span className="shrink-0 text-xs text-muted-foreground">
        {relativeTime(session.updatedAt)}
      </span>
      <Link
        href={continueHref}
        className="shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
        title="Continuar sesión"
      >
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </article>
  );
}

interface SessionsHeroProps {
  sessions: SessionSummary[] | null;
  isLoading: boolean;
  currentUserEmail: string | null | undefined;
  onCreateClick: () => void;
  onJoinClick: () => void;
}

export default function SessionsHero({
  sessions,
  isLoading,
  currentUserEmail,
  onCreateClick,
  onJoinClick,
}: SessionsHeroProps) {
  const hasData = !isLoading && sessions !== null;
  const sessionCount = sessions?.length ?? 0;

  return (
    <div className="sessions-ambient glow-orange-hero sessions-hero-border rounded-2xl p-6 flex flex-col gap-5 relative overflow-hidden">
      {/* Top accent line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-primary/55 to-transparent" />

      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/20 ring-1 ring-primary/38">
            <Layers className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold leading-none text-white">Sesiones</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Tu espacio colaborativo</p>
          </div>
        </div>
        {hasData && sessionCount > 0 && (
          <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {sessionCount} {sessionCount === 1 ? "sesión" : "sesiones"}
          </span>
        )}
      </div>

      {/* CTA buttons */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onCreateClick}
          className="flex cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98] glow-orange"
        >
          <Plus className="h-4 w-4" />
          Crear sesión
        </button>
        <button
          type="button"
          onClick={onJoinClick}
          className="flex cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-purple-400/35 bg-purple-500/10 px-5 py-3 text-sm font-bold text-purple-200 transition-all hover:border-purple-400/60 hover:bg-purple-500/20 active:scale-[0.98]"
        >
          <LogIn className="h-4 w-4" />
          Unirse con código
        </button>
      </div>

      {/* Recent sessions */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Recientes
        </p>

        {hasData && sessionCount === 0 && (
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-white/10 px-4 py-4 text-sm text-muted-foreground">
            <FolderOpen className="h-4 w-4 shrink-0" />
            <span>Aún no tienes sesiones. Crea una para empezar.</span>
          </div>
        )}

        {hasData && sessionCount > 0 && sessions!.map((session) => (
          <DashboardSessionRow
            key={session.id}
            session={session}
            currentUserEmail={currentUserEmail}
          />
        ))}
      </div>

      {/* Footer link */}
      <Link
        href="/sessions"
        className="flex items-center justify-end gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        Ver todas las sesiones
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
