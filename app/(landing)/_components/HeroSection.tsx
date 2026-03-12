import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import EditorWindow from "./EditorWindow";

/**
 * Landing hero — badge, headline, description, CTAs, and the editor mockup.
 * Server component: no client state required.
 */
export default function HeroSection() {
  return (
    <main className="flex w-full max-w-7xl flex-col items-center px-6 pb-24 pt-16 text-center">
      {/* Animated badge */}
      <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        Con AI-Powered Pair Programming
      </div>

      {/* Headline */}
      <h1 className="mb-6 max-w-4xl text-5xl font-black leading-tight tracking-tighter md:text-7xl">
        El futuro de la{" "}
        <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
          Programacion Colaborativa
        </span>
      </h1>

      {/* Subheading */}
      <p className="mb-12 max-w-2xl text-lg font-light text-muted-foreground md:text-xl">
        Experimenta el poder de un IDE completo de SpringBoot en tu navegador.
        Construye, prueba y despliega con asistencia de IA y colaboración en
        tiempo real. No más &ldquo;en mi máquina funciona&rdquo;.
      </p>

      {/* CTAs */}
      <div className="mb-20 flex flex-col gap-4 sm:flex-row">
        <Button className="glow-orange flex h-14 min-w-45 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-lg font-bold text-primary-foreground hover:brightness-110 transition-all border-0">
          <Play className="h-5 w-5 fill-current" />
          Start Coding
        </Button>
        <Button
          variant="outline"
          className="flex h-14 min-w-45 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-8 text-lg font-bold backdrop-blur-sm hover:bg-white/10 transition-all"
        >
          Demo
        </Button>
      </div>

      {/* Collaborative editor mockup */}
      <EditorWindow />
    </main>
  );
}
