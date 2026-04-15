"use client";

import Link from "next/link";
import { FolderOpen, Plus, RefreshCw } from "lucide-react";
import { useAuth } from "@/app/auth/_hooks/useAuth";
import { useMySessions } from "./_hooks/useMySessions";
import SessionCard from "./_components/SessionCard";

export default function SessionsListPage() {
  const { token } = useAuth();
  const { sessions, isLoading, error, refetch } = useMySessions(token);

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <FolderOpen className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Mis sesiones</h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Sesiones colaborativas que has creado o a las que te has unido.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
        >
          <Plus className="h-4 w-4" />
          Crear sesion
        </Link>
      </div>

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

      {!isLoading && !error && sessions && sessions.length === 0 && (
        <EmptySessions />
      )}

      {!isLoading && !error && sessions && sessions.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
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

function EmptySessions() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#0d1117] px-6 py-16 text-center">
      <FolderOpen className="h-10 w-10 text-muted-foreground" />
      <h2 className="mt-4 text-lg font-semibold">Aun no tienes sesiones</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Crea una sesion desde el dashboard o unete con un codigo de invitacion
        para empezar a colaborar.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
      >
        <Plus className="h-4 w-4" />
        Ir al dashboard
      </Link>
    </div>
  );
}
