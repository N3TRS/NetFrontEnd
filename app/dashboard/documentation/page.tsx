"use client";
import Image from 'next/image'
import omnicodeImage from '@/public/OmniCodeDocumentation.png'
import { useRouter } from 'next/navigation'

export default function Documentation() {

  const router = useRouter();

  return (
    <div className="flex flex-col items-center">
      <div>
        <div className="py-5">
          <div className="py-2">
            <h4>Iniciemos</h4>
          </div>
          <h1 className="text-2xl font-bold">Documentación de
            <span className="bg-linear-to-r from-primary to-accent bg-clip-text text-transparent text-2xl font-bold"> OmniCode</span>
          </h1>
        </div>
        <Image
          src={omnicodeImage}
          alt='Omnicode Family'
          width={950}
          height={950}
          className='rounded-xl'
        />
        <div className="py-5">
          <p className="mx-auto max-w-3xl text-balance text-center content-center">
            OmniCode es la forma más sencilla de desarrollar y colaborar en proyectos Spring Boot con Maven.
            Programa en tiempo real con tu equipo, comunícate mediante llamadas integradas y aprovecha el poder de la IA para análisis estático y dinámico de tu código. Todo desde tu navegador, sin configuración local.
          </p>
        </div>

        <div className="border border-t-amber-50/10 rounded-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between hover:scale-105 transition-transform">
            <button className="cursor-pointer" onClick={() => router.push('/dashboard')}>
              Pagina Principal
            </button>
            <button className="cursor-pointer" onClick={() => router.push('/')}>
              Inicio Rápido
            </button>
          </div>
        </div>
      </div>
    </div>
  );

}
