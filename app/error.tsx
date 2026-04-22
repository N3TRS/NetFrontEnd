"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
        <AlertTriangle aria-hidden="true" className="h-7 w-7 text-red-400" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Algo salió mal</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Ocurrió un error inesperado. Puedes intentar de nuevo o volver al inicio.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="cursor-pointer rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/85 active:scale-95"
        >
          Intentar de nuevo
        </button>
        <Link
          href="/"
          className="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-white/10 active:scale-95"
        >
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
