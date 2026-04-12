"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import { loginHook } from "../_hooks/loginHook";
import { githubLoginHook } from "../_hooks/githubLoginHook";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormState {
  email: string;
  password: string;
}

export interface LoginFormProps {
  onTypingChange?: (isTyping: boolean) => void;
  onPasswordVisibilityChange?: (visible: boolean) => void;
  onPasswordChange?: (value: string) => void;
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <img
      src="/github-icon-logo.png"
      alt=""
      aria-hidden="true"
      className={cn("size-5 shrink-0", className)}
    />
  );
}

export default function LoginForm({
  onTypingChange,
  onPasswordVisibilityChange,
  onPasswordChange,
}: LoginFormProps) {
  const { email, password, setEmail, setPassword, handleLogin, isPending } = loginHook();
  const { handleGithubLogin } = githubLoginHook();
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    if (name === "password") {
      setPassword(value);
      onPasswordChange?.(value);
    }
  };

  const togglePasswordVisibility = () => {
    const next = !showPassword;
    setShowPassword(next);
    onPasswordVisibilityChange?.(next);
  };

  return (
    <div className="flex w-full flex-col gap-8">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-bold tracking-tight">
          Bienvenido de nuevo!
        </h1>
        <p className="text-slate-400">
          Digita tus credeciales para acceder a tu cuenta
        </p>
      </div>

      <Button
        type="button"
        variant="outline"
        className="h-12 w-full gap-3 rounded-xl border-primary/20 text-sm font-medium hover:bg-primary/5"
        onClick={handleGithubLogin}
      >
        <GitHubIcon />
        Continuar Con GitHub
      </Button>

      <div className="relative flex items-center">
        <span className="flex-1 border-t border-white/10" />
        <span className="px-3 text-xs uppercase tracking-widest text-muted-foreground">
          O inicia sesión con
        </span>
        <span className="flex-1 border-t border-white/10" />
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Correo</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@company.com"
            value={email}
            onChange={handleChange}
            onFocus={() => onTypingChange?.(true)}
            onBlur={() => onTypingChange?.(false)}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Contraseña</Label>
            <Link
              href="#"
              className="text-xs text-primary underline-offset-4 hover:underline"
            >
              ¿Olvidaste tu Contraseña?
            </Link>
          </div>

          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={handleChange}
              onFocus={() => onTypingChange?.(true)}
              onBlur={() => onTypingChange?.(false)}
              className="pr-10"
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2",
                "text-muted-foreground transition-colors hover:text-foreground",
              )}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
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
          {isPending ? "Iniciando Sesión…" : "Iniciar Sesión"}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-400">
        ¿No tienes una Cuenta?{" "}
        <Link
          href="/register"
          className="font-semibold text-primary underline-offset-4 hover:underline"
        >
          Registrate
        </Link>
      </p>
    </div>
  );
}
