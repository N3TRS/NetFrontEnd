"use client";

import { Rocket } from "lucide-react";
import { useShaderBackground } from "@/components/ui/animated-shader-hero";

interface EmptyStateProps {
  onSelectProject: () => void;
}

export default function EmptyState({ onSelectProject }: EmptyStateProps) {
  const canvasRef = useShaderBackground();

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/10">
      <div className="absolute inset-0">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full touch-none pointer-events-none"
          style={{ background: "#0a0e14" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center gap-6 py-20 px-8 pointer-events-auto">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <div className="relative w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center backdrop-blur-sm">
            <Rocket className="h-9 w-9 text-primary" />
          </div>
        </div>

        <div className="text-center space-y-3 max-w-md">
          <h3 className="text-xl font-semibold text-white">
            No tienes sesiones activas
          </h3>
          <p className="text-sm text-white leading-relaxed">
            Escoge tu respositorio de Maven Spring-Boot
            y preparate para hacer pruebas, sin tener que descargar nada localmente.
          </p>
        </div>

        <button
          className="cursor-pointer flex items-center gap-2 bg-primary hover:bg-primary/85 text-primary-foreground font-semibold rounded-xl px-6 py-3 text-sm transition-all active:scale-95 glow-orange"
          onClick={onSelectProject}
        >
          <span className="text-lg font-bold">+</span>
          <span>Seleccionar Repositorio</span>
        </button>
      </div>
    </div>
  );
}
