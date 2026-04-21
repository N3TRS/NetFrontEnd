"use client";

import { useState } from "react";
import Link from "next/link";
import { User, AtSign, ArrowRight, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { githubLoginHook } from "../../login/_hooks/githubLoginHook";
import { signUpHook } from "../_hooks/signUpHook";

interface FormState {
  fullName: string;
  email: string;
  password: string;
}

interface FieldError {
  fullName?: string;
  email?: string;
  password?: string;
}

export interface RegistrationFormProps {
  onTypingChange?: (isTyping: boolean) => void;
  onPasswordVisibilityChange?: (visible: boolean) => void;
  onPasswordChange?: (value: string) => void;
}

function IconInput({
  icon: Icon,
  ...props
}: React.ComponentProps<typeof Input> & {
  icon: React.ElementType;
}) {
  return (
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
      <Input className="pl-11" {...props} />
    </div>
  );
}

export default function RegistrationForm({
  onTypingChange,
  onPasswordVisibilityChange,
  onPasswordChange,
}: RegistrationFormProps = {}) {
  const [errors, setErrors] = useState<FieldError>({});
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { handleGithubLogin } = githubLoginHook();
  const { name, email, password, setName, setEmail, setPassword, handleSignUp } = signUpHook();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "fullName") setName(value);
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
    if (errors[name as keyof FieldError]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (name === "password") onPasswordChange?.(value);
  };

  const validate = (): boolean => {
    const next: FieldError = {};
    if (!name.trim()) next.fullName = "El nombre es requerido.";
    if (!email.trim()) {
      next.email = "El email es requerido.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Ingrese una dirección de email válida.";
    }
    if (!password) {
      next.password = "La contraseña es requerida.";
    } else if (password.length < 8) {
      next.password = "Mínimo 8 caracteres.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  return (
    <div className="flex flex-col gap-6">
      <Button
        type="button"
        variant="outline"
        className="h-12 w-full gap-3 rounded-xl border-primary/20 text-sm font-medium hover:bg-primary/5"
        onClick={handleGithubLogin}
      >
        <img
          src="/github-icon-logo.png"
          alt=""
          aria-hidden="true"
          className="size-5 shrink-0"
        />
        Continuar con GitHub
      </Button>

      <div className="relative flex items-center">
        <span className="flex-1 border-t border-white/10" />
        <span className="px-3 text-xs uppercase tracking-widest text-muted-foreground">
          O regístrate con un correo
        </span>
        <span className="flex-1 border-t border-white/10" />
      </div>

      <form onSubmit={handleSignUp} className="flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-2">
          <Label htmlFor="fullName">Nombre de Usuario</Label>
          <IconInput
            icon={User}
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Nombre de Usuario"
            value={name}
            onChange={handleChange}
            aria-invalid={!!errors.fullName}
          />
          {errors.fullName && (
            <p className="text-xs text-destructive">{errors.fullName}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Correo Electrónico</Label>
          <IconInput
            icon={AtSign}
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="correo@compañia.com"
            value={email}
            onChange={handleChange}
            onFocus={() => onTypingChange?.(true)}
            onBlur={() => onTypingChange?.(false)}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={handleChange}
              aria-invalid={!!errors.password}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => {
                const next = !showPassword;
                setShowPassword(next);
                onPasswordVisibilityChange?.(next);
              }}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password}</p>
          )}
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
            "flex items-center justify-center gap-2 group",
          )}
        >
          {isPending ? (
            "Processing…"
          ) : (
            <>
              Registrarse
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>

        <div className="mt-2 flex flex-col items-center gap-2 border-t border-white/10 pt-6">
          <p className="text-center text-sm text-slate-400">
            Ya tienes una cuenta?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
