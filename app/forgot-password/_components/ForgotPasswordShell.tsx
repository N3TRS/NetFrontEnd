"use client";

import { Terminal } from "lucide-react";

import ForgotPasswordForm from "./ForgotPasswordForm";

export default function ForgotPasswordShell() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <div
        className="relative hidden w-1/2 items-center justify-center overflow-hidden border-r border-primary/10 lg:flex"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(255,139,16,0.07), transparent 60%)," +
            "radial-gradient(circle at bottom left, rgba(90,24,154,0.10), transparent 60%)," +
            "#09080d",
        }}
      >
        <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-1/2 w-full bg-linear-to-t from-background/90 to-transparent" />

        <div className="relative z-10 flex flex-col items-center gap-4 text-center">
          <Terminal className="size-16 text-primary" />
          <h2 className="text-3xl font-bold tracking-tight">OmniCode</h2>
          <p className="max-w-sm text-slate-400">
            Recupera el acceso a tu cuenta en segundos.
          </p>
        </div>
      </div>

      <div className="relative flex w-full flex-col items-center justify-center overflow-y-auto p-8 sm:p-12 md:p-24 lg:w-1/2">
        <div className="absolute left-8 top-8 flex items-center gap-2 lg:hidden">
          <Terminal className="size-7 text-primary" />
          <span className="text-xl font-bold">OmniCode</span>
        </div>

        <div className="w-full max-w-100">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
