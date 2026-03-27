import { Zap, Brain, Leaf, type LucideIcon } from "lucide-react";
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
      "Programa juntos en tiempo real con terminales compartidos y seguimiento multicursor. La programación en pareja nunca ha sido tan fluida.",
    iconColorClass: "text-primary",
    iconBgClass: "bg-primary/10",
    hoverBorderClass: "hover:border-primary/30",
  },
  {
    icon: Brain,
    title: "Análisis Impulsado por IA",
    description:
      "Obtén completados de código inteligentes y detección automática de errores impulsados por modelos especializados entrenados para desarrolladores Java.",
    iconColorClass: "text-accent",
    iconBgClass: "bg-accent/10",
    hoverBorderClass: "hover:border-accent/30",
  },
  {
    icon: Leaf,
    title: "Ejecución Instantánea",
    description:
      "Ejecuta compilaciones Maven y aplicaciones SpringBoot al instante en nuestra infraestructura cloud escalable sin configuración local.",
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
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>
    </section>
  );
}
