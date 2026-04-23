import { Zap, Brain, Play, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";


interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColorClass: string;
  iconBgClass: string;
  hoverBorderClass: string;
}


const FEATURES: FeatureCardProps[] = [
  {
    icon: Zap,
    title: "Colaboración en Tiempo Real",
    description:
      "Programa junto a tu equipo en JavaScript, Python, Java o TypeScript con sincronización en tiempo real. Los cambios se guardan automáticamente y el historial se mantiene en sesión.",
    iconColorClass: "text-primary",
    iconBgClass: "bg-primary/10",
    hoverBorderClass: "hover:border-primary/30",
  },
  {
    icon: Brain,
    title: "Análisis Impulsado por IA",
    description:
      "Obtén completados inteligentes y análisis de errores para cualquier lenguaje. El asistente IA está integrado directamente en el editor para que no pierdas el contexto de tu código.",
    iconColorClass: "text-accent",
    iconBgClass: "bg-accent/10",
    hoverBorderClass: "hover:border-accent/30",
  },
  {
    icon: Play,
    title: "Ejecución Multi-Lenguaje",
    description:
      "Ejecuta tu código al instante en la nube mediante Piston API para múltiples lenguajes. O selecciona un repositorio de GitHub, compílalo y obtén una URL de prueba pública en minutos.",
    iconColorClass: "text-primary",
    iconBgClass: "bg-primary/10",
    hoverBorderClass: "hover:border-primary/30",
  },
];


function FeatureCard({
  icon: Icon,
  title,
  description,
  iconColorClass,
  iconBgClass,
  hoverBorderClass,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        "group rounded-2xl border border-white/10 bg-white/5 p-8 transition-all",
        hoverBorderClass,
      )}
    >
      <div
        className={cn(
          "mb-6 flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
          iconBgClass,
          iconColorClass,
        )}
      >
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-4 text-xl font-bold">{title}</h3>
      <p className="font-light text-muted-foreground">{description}</p>
    </div>
  );
}



export default function FeaturesSection() {
  return (
    <section className="w-full max-w-7xl border-t border-primary/5 px-6 py-24">
      <div className="mb-14 text-center">
        <h2 className="mb-4 text-3xl font-black tracking-tight md:text-4xl">
          Todo lo que necesitas para{" "}
          <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
            colaborar
          </span>
        </h2>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Una plataforma completa para equipos que quieren escribir, ejecutar y discutir código sin fricciones.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  );
}
