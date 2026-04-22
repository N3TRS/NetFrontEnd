"use client";
import dynamic from "next/dynamic";

const DynamicTerminal = dynamic(() => import("@/lib/terminal"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
      Cargando terminal…
    </div>
  ),
});

export default function Running() {
  return <DynamicTerminal />;
}
