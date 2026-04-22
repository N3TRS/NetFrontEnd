import Link from "next/link";
import { Terminal } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8 px-6 text-center">
      <Link href="/" className="flex items-center gap-3">
        <div className="rounded-lg bg-primary p-1.5 text-primary-foreground">
          <Terminal aria-hidden="true" className="h-5 w-5" strokeWidth={2.5} />
        </div>
        <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent text-2xl font-bold">
          OmniCode
        </span>
      </Link>

      <div className="flex flex-col gap-3">
        <p className="font-mono text-6xl font-black text-primary">404</p>
        <h1 className="text-2xl font-bold">Página no encontrada</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          La ruta que buscas no existe o fue movida.
        </p>
      </div>

      <Link
        href="/"
        className="cursor-pointer rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/85 hover:scale-105 active:scale-95 glow-orange"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
