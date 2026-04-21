"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSession, joinSession } from "@/app/codeEditor/api";
import { useAuth } from "@/app/auth/_hooks/useAuth";

export default function Sessions() {
  const router = useRouter();
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const canCreate = useMemo(
    () => Boolean(token) && name.trim().length >= 3,
    [token, name],
  );
  const canJoin = useMemo(
    () => Boolean(token) && inviteCode.trim().length === 8,
    [token, inviteCode],
  );

  const handleCreateSession = async () => {
    if (!token || !canCreate) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const data = await createSession(token, name.trim(), "javascript");
      const sessionId = data?.session?.id;
      const createdInviteCode = data?.session?.inviteCode;

      if (!sessionId) {
        throw new Error("Session was created but no sessionId was returned");
      }

      router.push(
        `/codeEditor?sessionId=${sessionId}${createdInviteCode ? `&inviteCode=${createdInviteCode}` : ""}`,
      );
    } catch (error) {
      const text =
        error instanceof Error
          ? error.message
          : "No se pudo crear la sesion. Intenta nuevamente.";
      setMessage(text);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinSession = async () => {
    if (!token || !canJoin) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const data = await joinSession(token, inviteCode.trim().toUpperCase());
      const sessionId = data?.session?.id;
      const normalizedInviteCode = data?.session?.inviteCode || inviteCode.trim().toUpperCase();

      if (!sessionId) {
        throw new Error("No se encontro la sesion para ese codigo");
      }

      router.push(`/codeEditor?sessionId=${sessionId}&inviteCode=${normalizedInviteCode}`);
    } catch (error) {
      const text =
        error instanceof Error
          ? error.message
          : "No se pudo unir a la sesion. Verifica el codigo.";
      setMessage(text);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-4xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Sesiones colaborativas</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Crea una sesion nueva o unete con un codigo de invitacion.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-black/20 p-6">
          <h2 className="text-lg font-semibold">Crear sesion</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Define un nombre para la nueva sala colaborativa.
          </p>

          <label className="mt-5 block text-sm font-medium">Nombre de la sesion</label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Backend pairing"
            className="mt-2 w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 outline-none ring-primary/40 focus:ring"
          />

          <button
            type="button"
            onClick={handleCreateSession}
            disabled={!canCreate || isSubmitting}
            className="mt-5 w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Creando..." : "Crear y entrar"}
          </button>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-6">
          <h2 className="text-lg font-semibold">Unirse a sesion</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ingresa el codigo de 8 caracteres compartido por el anfitrion.
          </p>

          <label className="mt-5 block text-sm font-medium">Codigo de invitacion</label>
          <input
            value={inviteCode}
            onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
            placeholder="A1B2C3D4"
            maxLength={8}
            className="mt-2 w-full rounded-md border border-white/15 bg-black/30 px-3 py-2 uppercase outline-none ring-primary/40 focus:ring"
          />

          <button
            type="button"
            onClick={handleJoinSession}
            disabled={!canJoin || isSubmitting}
            className="mt-5 w-full rounded-md bg-white/10 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Conectando..." : "Unirse"}
          </button>
        </div>
      </div>

      {message ? (
        <p className="mt-6 rounded-md border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          {message}
        </p>
      ) : null}
    </section>
  );
}
