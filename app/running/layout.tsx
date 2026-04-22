import type { Metadata } from "next";
import HeaderRunnning from "./_components/Header";

export const metadata: Metadata = {
  title: "Ejecutar Repositorio | OmniCode",
  description: "Ejecuta tu repositorio de GitHub en la nube y obtén una URL de prueba pública.",
};

export default function RunningLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <div className="flex min-h-screen flex-col transition-theme">
      <HeaderRunnning />
      <main className="grow pb-10">{children}</main>
    </div>
  )

}
