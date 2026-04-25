"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";

import { useResetPassword } from "../_hooks/resetPasswordHook";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function ResetPasswordForm() {
  const {
    token,
    newPassword,
    confirmPassword,
    setNewPassword,
    setConfirmPassword,
    handleReset,
    isPending,
    success,
    error,
  } = useResetPassword();

  const [showPassword, setShowPassword] = useState(false);

  if (success) {
    return (
      <div className="flex w-full flex-col items-center gap-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="size-8" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">¡Contraseña actualizada!</h1>
          <p className="text-slate-400">
            Ya puedes iniciar sesión con tu nueva contraseña. Te redirigiremos en un momento…
          </p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex w-full flex-col items-center gap-6 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Enlace inválido</h1>
          <p className="text-slate-400">
            El enlace no es válido o ya caducó. Solicita uno nuevo.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          Solicitar nuevo enlace
        </Link>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-bold tracking-tight">Nueva contraseña</h1>
        <p className="text-slate-400">
          Escoge una contraseña segura. Mínimo 8 caracteres, con mayúscula, minúscula y número o símbolo.
        </p>
      </div>

      <form onSubmit={handleReset} className="flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-2">
          <Label htmlFor="newPassword">Nueva contraseña</Label>
          <div className="relative">
            <Input
              id="newPassword"
              name="newPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2",
                "text-muted-foreground transition-colors hover:text-foreground",
              )}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

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
          {isPending ? "Guardando…" : "Restablecer contraseña"}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-400">
        <Link
          href="/login"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Volver al inicio de sesión
        </Link>
      </p>
    </div>
  );
}
