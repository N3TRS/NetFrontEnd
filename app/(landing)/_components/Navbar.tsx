import Link from "next/link";
import { Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/10 backdrop-blur-md">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary p-1.5 text-primary-foreground">
            <Terminal className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent text-2xl font-bold">
            OmniCode
          </span>
        </div>
        <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden items-center gap-8 text-sm font-medium opacity-80 md:flex">
          <a
            href="/documentation"
            className="transition-colors hover:text-primary"
          >
            Documentacion
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <Button
            asChild
            className="glow-purple bg-accent text-accent-foreground font-bold hover:brightness-110 hover:scale-105 transition-all px-5 py-2.5 text-sm rounded-lg border-0"
          >
            <Link href="/login">Iniciar Sesión</Link>
          </Button>
          <Button
            asChild
            className="glow-orange bg-primary text-primary-foreground font-bold hover:brightness-110 hover:scale-105 transition-all px-5 py-2.5 text-sm rounded-lg border-0"
          >
            <Link href="/register">Registrarse</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
