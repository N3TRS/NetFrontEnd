"use client";

import Link from "next/link";
import { MailCheck } from "lucide-react";

import { forgotPasswordHook } from "../_hooks/forgotPasswordHook";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function ForgotPasswordForm() {
  const { email, setEmail, handleForgot, isPending, submitted } = forgotPasswordHook();

  if (submitted) {
    return (
      <div className="flex w-full flex-col items-center gap-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="size-8" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Revisa tu correo</h1>
          <p className="text-slate-400">
            Si el correo <span className="text-primary">{email}</span> está registrado,
            recibirás un enlace para restablecer tu contraseña. Expira en 15 minutos.
          </p>
        </div>
        <Link
          href="/login"
          className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          Volver al Inicio de Sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-bold tracking-tight">¿Olvidaste tu Contraseña?</h1>
        <p className="text-slate-400">
          Ingresa tu correo y te enviaremos un enlace para restablecerla.
        </p>
      </div>

      <form onSubmit={handleForgot} className="flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Correo</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className={cn(
            "mt-2 h-12 w-full rounded-xl text-sm font-bold",
            "bg-primary text-primary-foreground",
            "shadow-[0_4px_20px_rgba(255,139,16,0.3)]",
            "hover:bg-primary/90 hover:shadow-[0_4px_24px_rgba(255,139,16,0.5)]",
            "disabled:opacity-60 transition-all",
          )}
        >
          {isPending ? "Enviando…" : "Enviar enlace"}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-400">
        ¿Recordaste tu contraseña?{" "}
        <Link
          href="/login"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Inicia Sesión
        </Link>
      </p>
    </div>
  );
}
