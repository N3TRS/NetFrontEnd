"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const ExcalidrawBoard = dynamic(
  () => import("./_components/ExcalidrawBoard"),
  { ssr: false }
);

export default function DesignPage() {
  return (
    <div className="flex h-screen w-full flex-col">
      <div className="flex items-center gap-3 border-b border-white/10 bg-[#0d1117] px-4 py-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>
        <span className="text-white/20">|</span>
        <span className="text-sm font-semibold text-white/80">Pizarra de Diseño</span>
      </div>
      <div className="flex-1">
        <ExcalidrawBoard />
      </div>
    </div>
  );
}
