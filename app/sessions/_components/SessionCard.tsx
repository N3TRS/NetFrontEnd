"use client";

import Link from "next/link";
import { ArrowRight, Clock, Code2 } from "lucide-react";
import type { SessionSummary } from "@/app/codeEditor/api";

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

export default function SessionCard({ session }: { session: SessionSummary }) {
  const continueHref = `/codeEditor?sessionId=${encodeURIComponent(session.id)}&language=${encodeURIComponent(session.language)}&inviteCode=${encodeURIComponent(session.inviteCode)}`;

  return (
    <article className="group flex flex-col rounded-2xl border border-white/10 bg-[#0d1117] p-5 transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-white">{session.name}</h3>
        <span className="inline-flex items-center gap-1 rounded-md border border-purple-400/30 bg-purple-500/15 px-2 py-0.5 text-xs font-medium text-purple-200">
          <Code2 className="h-3 w-3" />
          {session.language}
        </span>
      </div>

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

      <Link
        href={continueHref}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/85"
      >
        Continuar
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </article>
  );
}
