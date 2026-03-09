import type { Metadata } from "next";
import { Terminal } from "lucide-react";
import Link from "next/link";

import RegistrationForm from "./_components/RegistrationForm";

export const metadata: Metadata = {
  title: "Register | OmniCode",
  description: "Create your OmniCode account and start building.",
};

export default function RegisterPage() {
  return (
    <div
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-4 py-12"
      style={{
        background:
          "radial-gradient(circle at top left, #23190f 0%, #0a0e14 60%)," +
          "radial-gradient(circle at bottom right, rgba(90,24,154,0.18) 0%, transparent 60%)",
      }}
    >
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-accent/10 blur-[120px]" />
      </div>

      {/* Header bar */}
      <header className="z-10 mb-8 flex w-full max-w-lg items-center justify-between px-1">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary shadow-[0_0_16px_rgba(255,139,16,0.35)]">
            <Terminal className="size-4 text-black" />
          </div>
          <span className="text-xl font-bold text-white">OmniCode</span>
        </Link>
      </header>

      {/* Card */}
      <main className="z-10 w-full max-w-lg">
        <div
          className="relative overflow-hidden rounded-2xl border border-white/10 p-8 shadow-2xl md:p-10"
          style={{
            background: "rgba(13, 17, 23, 0.75)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
        >
          <h1 className="text-4xl font-bold text-white text-center">Sign In</h1>
          <div className="mt-8">
            <RegistrationForm />
          </div>
        </div>
      </main>

      <footer className="z-10 mt-12 text-xs uppercase tracking-wider text-slate-500">
        © 2026 OmniCode
      </footer>
    </div>
  );
}
