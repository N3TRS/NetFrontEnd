import Image from "next/image";
import omnicodeImage from "@/public/OmniCodeDocumentation.png";
import Link from "next/link";

export default function Documentation() {
  return (
    <div className="flex flex-col items-center px-6 py-10">
      <div className="w-full max-w-4xl flex flex-col items-center gap-8">

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">Iniciemos</p>
          <h1 className="text-3xl font-bold">
            Documentación de
            <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
              {" "}OmniCode
            </span>
          </h1>
        </div>

        <Image
          src={omnicodeImage}
          alt="OmniCode Documentation"
          width={950}
          height={950}
          className="rounded-xl w-full"
        />

        <p className="max-w-2xl text-center text-sm text-muted-foreground leading-relaxed">
          OmniCode es la forma más sencilla de desarrollar y colaborar en
          proyectos Spring Boot con Maven. Programa en tiempo real con tu
          equipo, comunícate mediante llamadas integradas y aprovecha el
          poder de la IA para análisis estático y dinámico de tu código.
          Todo desde tu navegador, sin configuración local.
        </p>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="cursor-pointer px-5 py-2.5 text-sm font-semibold rounded-lg border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 inline-block"
          >
            Página Principal
          </Link>
          <Link
            href="/login"
            className="cursor-pointer px-5 py-2.5 text-sm font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/85 hover:scale-105 transition-all active:scale-95 glow-orange inline-block"
          >
            Inicio Rápido
          </Link>
        </div>

      </div>
    </div>
  );
}
