import Image from "next/image";
import omnicodeImage from "@/public/OmniCodeDocumentation.png";
import Link from "next/link";
import { Code2, GitBranch, Brain, PenTool, Zap, CheckCircle } from "lucide-react";

const SECTIONS = [
  { id: "introduccion", label: "Introducción" },
  { id: "editor", label: "Editor Colaborativo" },
  { id: "repositorios", label: "Ejecución de Repos" },
  { id: "pizarra", label: "Pizarra de Diseño" },
  { id: "inicio-rapido", label: "Inicio Rápido" },
];

export default function Documentation() {
  return (
    <div className="flex flex-col items-center px-6 py-10">
      <div className="w-full max-w-5xl">

        <div className="text-center mb-12">
          <h1 className="text-4xl font-black tracking-tight mb-4">
            Bienvenido a
            <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
              {" "}OmniCode
            </span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Plataforma colaborativa para escribir, ejecutar y diseñar en equipo, sin configuración local.
          </p>
        </div>

        <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">

          <aside className="lg:w-52 shrink-0">
            <nav className="sticky top-24 flex flex-col gap-1">
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  {s.label}
                </a>
              ))}
              <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2">
                <Link
                  href="/"
                  className="rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  ← Inicio
                </Link>
                <Link
                  href="/login"
                  className="rounded-lg px-3 py-2 text-sm font-semibold bg-primary/10 text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  Empezar ahora →
                </Link>
              </div>
            </nav>
          </aside>

          <main className="flex-1 flex flex-col gap-14 min-w-0">

            <Image
              src={omnicodeImage}
              alt="OmniCode — vista general de la plataforma"
              width={900}
              height={500}
              priority
              className="rounded-xl w-full border border-white/10"
            />

            <section id="introduccion" className="flex flex-col gap-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <Zap aria-hidden="true" className="h-5 w-5 text-primary shrink-0" />
                <h2 className="text-2xl font-bold">Introducción</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                OmniCode es una plataforma web que permite a equipos de desarrollo colaborar en
                tiempo real sin necesidad de configurar entornos locales. Está compuesta por dos
                funcionalidades principales:
              </p>
              <ul className="flex flex-col gap-3">
                <li className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                  <Code2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm mb-1">Editor Colaborativo Multi-Lenguaje</p>
                    <p className="text-xs text-muted-foreground">
                      Escribe y ejecuta código en JavaScript, TypeScript, Python o Java junto a tu equipo,
                      con sincronización en tiempo real, asistente IA y ejecución vía Piston API.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                  <GitBranch className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm mb-1">Ejecución de Repositorios</p>
                    <p className="text-xs text-muted-foreground">
                      Selecciona un repositorio de GitHub, ejecútalo en la nube y obtén una URL pública
                      para hacer pruebas tipo Postman directamente desde el navegador.
                    </p>
                  </div>
                </li>
              </ul>
            </section>

            <hr className="border-white/5" />

            <section id="editor" className="flex flex-col gap-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <Code2 aria-hidden="true" className="h-5 w-5 text-primary shrink-0" />
                <h2 className="text-2xl font-bold">Editor Colaborativo</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                El editor usa Monaco (el mismo motor de VS Code) sincronizado en tiempo real mediante
                Yjs. Los cambios de cada colaborador se reflejan instantáneamente con cursores identificados.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold mb-2">Lenguajes soportados</p>
                  <div className="flex flex-wrap gap-2">
                    {["JavaScript", "TypeScript", "Python", "Java"].map((l) => (
                      <span key={l} className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold mb-2">Capacidades</p>
                  <ul className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2"><CheckCircle aria-hidden="true" className="h-3.5 w-3.5 text-primary" /> Cursores colaborativos en vivo</li>
                    <li className="flex items-center gap-2"><CheckCircle aria-hidden="true" className="h-3.5 w-3.5 text-primary" /> Ejecución de código vía Piston API</li>
                    <li className="flex items-center gap-2"><CheckCircle aria-hidden="true" className="h-3.5 w-3.5 text-primary" /> Asistente IA integrado</li>
                    <li className="flex items-center gap-2"><CheckCircle aria-hidden="true" className="h-3.5 w-3.5 text-primary" /> Guardado automático en sesión</li>
                  </ul>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Brain aria-hidden="true" className="h-4 w-4 text-accent" />
                  <p className="text-sm font-semibold">Asistente IA</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Abre el panel de IA desde el editor con el ícono de chispa. Puedes pedirle que analice
                  tu código, explique errores o sugiera mejoras. El asistente tiene acceso al código
                  activo en el editor para darte respuestas contextuales.
                </p>
              </div>
            </section>

            <hr className="border-white/5" />

            <section id="repositorios" className="flex flex-col gap-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <GitBranch aria-hidden="true" className="h-5 w-5 text-accent shrink-0" />
                <h2 className="text-2xl font-bold">Ejecución de Repositorios</h2>
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-400">
                  Coming Soon
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Esta funcionalidad está en desarrollo activo. Permitirá seleccionar cualquier repositorio
                de tu cuenta de GitHub, compilarlo en la nube y obtener una URL pública temporal para
                realizar pruebas de API directamente desde el navegador.
              </p>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
                <p className="text-sm font-semibold text-amber-400 mb-2">Flujo planeado</p>
                <ol className="flex flex-col gap-2 text-xs text-muted-foreground list-none">
                  {[
                    "Conectar tu cuenta de GitHub desde el dashboard",
                    "Seleccionar el repositorio que deseas ejecutar",
                    "Esperar la compilación en la nube (logs en tiempo real)",
                    "Obtener la URL pública para hacer requests de prueba",
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-[10px] font-bold text-amber-400">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </section>

            <hr className="border-white/5" />

            <section id="pizarra" className="flex flex-col gap-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <PenTool aria-hidden="true" className="h-5 w-5 text-accent shrink-0" />
                <h2 className="text-2xl font-bold">Pizarra de Diseño</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                OmniCode incluye una pizarra interactiva basada en Excalidraw para que puedas crear
                diagramas, wireframes y esquemas de arquitectura sin salir de la plataforma.
              </p>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-2">
                <p className="text-sm font-semibold">Cómo acceder</p>
                <p className="text-xs text-muted-foreground">
                  Desde el <strong className="text-white/80">Dashboard</strong>, busca la sección{" "}
                  <strong className="text-white/80">Diseño</strong> y haz clic en{" "}
                  <strong className="text-white/80">Abrir Pizarra</strong>. Se abrirá el editor de
                  diagramas en pantalla completa.
                </p>
              </div>
            </section>

            <hr className="border-white/5" />

            <section id="inicio-rapido" className="flex flex-col gap-4 scroll-mt-24">
              <div className="flex items-center gap-3">
                <Zap aria-hidden="true" className="h-5 w-5 text-primary shrink-0" />
                <h2 className="text-2xl font-bold">Inicio Rápido</h2>
              </div>
              <p className="text-muted-foreground">Empieza a colaborar en menos de 2 minutos:</p>
              <ol className="flex flex-col gap-3">
                {[
                  { step: "Crea tu cuenta", desc: "Regístrate con tu email o inicia sesión con GitHub." },
                  { step: "Crea una sesión", desc: "En el dashboard, haz clic en “Crear sesión”, ponle nombre y elige el lenguaje." },
                  { step: "Invita a tu equipo", desc: "Comparte el código de invitación de 8 caracteres con tus compañeros." },
                  { step: "Escribe y ejecuta", desc: "Escribe código en el editor compartido y ejecútalo con el botón de play." },
                  { step: "Usa la IA", desc: "Abre el panel de IA para obtener ayuda contextual sobre tu código." },
                ].map(({ step, desc }, i) => (
                  <li key={i} className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-black text-primary">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold mb-0.5">{step}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="flex items-center gap-4 pt-4">
                <Link
                  href="/login"
                  className="cursor-pointer px-5 py-2.5 text-sm font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/85 hover:scale-105 transition-all active:scale-95 glow-orange inline-block"
                >
                  Empezar ahora
                </Link>
                <Link
                  href="/"
                  className="cursor-pointer px-5 py-2.5 text-sm font-semibold rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 inline-block"
                >
                  Página Principal
                </Link>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
