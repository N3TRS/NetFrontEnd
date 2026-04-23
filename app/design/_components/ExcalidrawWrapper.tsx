"use client";
import dynamic from "next/dynamic";

const ExcalidrawBoard = dynamic(() => import("./ExcalidrawBoard"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      Cargando pizarra…
    </div>
  ),
});

export default function ExcalidrawWrapper() {
  return <ExcalidrawBoard />;
}
