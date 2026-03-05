import Image from 'next/image'
import editorCodigo from '@/public/editorCodigo.jpg'
import github from '@/public/icons/github.png'
import smartv from '@/public/icons/smart-tv.png'
import pairProgramming from '@/public/PairProgramming.jpg'
import codingPerson from '@/public/codingPerson.jpg'
import thinkingPerson from '@/public/thinkingPerson.jpg'
import Card from "@/app/(landing)/_components/Card"


export default function landingPage() {
  return (
    <div className="grid grid-cols-5 grid-rows-12 gap-4">
      <div className="col-span-3 row-span-3 col-start-1 row-start-1">
        <section className="border-y-taupe-200 py-20 px-10">
          <div className="w-fit bg-primary-action text-white px-2 py-0.5 rounded-full text-xs font-bold border border-blue-500/30">
            <span className="relative flex size-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex size-3 rounded-full bg-sky-500"></span>
            </span>
            Proximamente
          </div>
          <h1 className="text-6xl font-bold text-white leading-tight">
            SpringBoot <br />
            Colaborativo en el <span className="text-blue-500">Navegador</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl py-3">
            Experimenta el poder de un IDE completo de SpringBoot en tu navegador.
            Construye, prueba y despliega con asistencia de IA y colaboración en tiempo real.
            No más "en mi máquina funciona".
          </p>
          <div className="flex gap-4 mt-4">
            <button className="bg-primary-action text-white font-semibold gap-2 shadow-lg shadow-blue-600/20 flex items-center cursor-pointer px-8 py-3 rounded-xl hover:scale-105 transition-transform">
              <span><Image src={github} alt="github icon" width={25} height={25} /></span>Iniciar con Github
            </button>
            <button className="bg-cards flex items-center cursor-pointer text-white px-8 py-3 rounded-xl font-semibold gap-2 border-gray-700 hover:scale-105 transition-transform">
              <span><Image src={smartv} alt="tv icon" width={25} height={25} /></span>Mirar Demo </button>
          </div>
        </section>
      </div >
      <div className="col-span-2 row-span-3 col-start-4 row-start-1">
        <div style={{ position: 'relative', width: '100%', height: '400px' }} className="py-20 px-10">
          <Image src={editorCodigo} alt='Collaborative Code' priority placeholder="blur" className="hover:scale-105 transition-transform mask-l-from-50% mask-b-from-20% rounded-xl"></Image>
        </div>
      </div>
      <div className="col-span-2 row-span-3 col-start-1 row-start-4">
        <section className="flex flex-col border-y-taupe-200 px-10 text-center">
          <h4 className="text-blue-400">Rendimiento Primero</h4>
          <h2 className="text-6xl font-bold text-white leading-tight">Diseñado para Equipos Modernos</h2>
          <p className="text-gray-400 text-lg max-w-2xl py-5 mx-auto">
            Optimiza tu flujo de desarrollo Java con herramientas diseñadas para equipos de ingeniería de alto rendimiento.
          </p>
          <div className="grid grid-cols-3 grid-rows-1 gap-8">
            <div className="col-span-1 row-span-1 col-start-1 row-start-1">
              <Card
                title="Colaboración en Tiempo Real"
                text="Programa juntos en tiempo real con terminales compartidos y seguimiento multicursor. La programación en pareja nunca ha sido tan fluida."
                icon="group"
              />
            </div>
            <div className="col-span-1 row-span-1 col-start-2 row-start-1">
              <Card title="Ejecución Instantanéa"
                text="Ejecuta compilaciones Maven y aplicaciones SpringBoot al instante en nuestra infraestructura cloud escalable sin configuración local."
                icon="lightning" />
            </div>
            <div className="col-span-1 row-span-1 col-start-3 row-start-1">
              <Card title="Analisis Impulsado Por IA"
                text="Obtén completados de código inteligentes y detección automática de errores impulsados por modelos especializados entrenados para desarrolladores Java."
                icon="thinking" />
            </div>
          </div>
        </section>
      </div>
      <div className="col-span-3 row-span-3 col-start-3 row-start-4">
        <section>

        </section>
      </div>
      <div className="col-span-3 row-span-3 row-start-7">
        <section>
        </section>
      </div>
      <div className="col-span-2 row-span-3 col-start-4 row-start-7">
        <section>
          <Image src={codingPerson} alt="" />
        </section>
      </div>
      <div className="col-span-2 row-span-3 row-start-10">
        <section>
          <Image src={thinkingPerson} alt="Icon Thinking Person" />
        </section>
      </div>
      <div className="col-span-3 row-span-3 col-start-3 row-start-10">
        <section>
        </section>
      </div>
    </div>
  );
}
