"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSession, joinSession } from "@/app/codeEditor/api";
import { useAuth } from "@/app/auth/_hooks/useAuth";

export function useSessionActions() {
  const router = useRouter();
  const { token } = useAuth();

  const [sessionName, setSessionName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  const canCreate = useMemo(
    () => Boolean(token) && sessionName.trim().length >= 3,
    [token, sessionName],
  );

  const canJoin = useMemo(
    () => Boolean(token) && inviteCode.trim().length === 8,
    [token, inviteCode],
  );

  const handleCreateSession = async () => {
    if (!token || !canCreate) {
      return;
    }

    setIsCreating(true);
    setCreateError(null);

    try {
      const data = await createSession(token, sessionName.trim(), "javascript");
      const sessionId = data?.session?.id;
      const createdInviteCode = data?.session?.inviteCode;

      if (!sessionId) {
        throw new Error("Session was created but no sessionId was returned");
      }

      router.push(
        `/codeEditor?sessionId=${sessionId}${createdInviteCode ? `&inviteCode=${createdInviteCode}` : ""}`,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo crear la sesion. Intenta nuevamente.";
      setCreateError(message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinSession = async () => {
    if (!token || !canJoin) {
      return;
    }

    setIsJoining(true);
    setJoinError(null);

    try {
      const normalizedCode = inviteCode.trim().toUpperCase();
      const data = await joinSession(token, normalizedCode);
      const sessionId = data?.session?.id;
      const normalizedInviteCode = data?.session?.inviteCode || normalizedCode;

      if (!sessionId) {
        throw new Error("No se encontro la sesion para ese codigo");
      }

      router.push(`/codeEditor?sessionId=${sessionId}&inviteCode=${normalizedInviteCode}`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo unir a la sesion. Verifica el codigo.";
      setJoinError(message);
    } finally {
      setIsJoining(false);
    }
  };

  const resetCreateState = () => {
    setSessionName("");
    setCreateError(null);
    setIsCreating(false);
  };

  const resetJoinState = () => {
    setInviteCode("");
    setJoinError(null);
    setIsJoining(false);
  };

  return {
    token,
    sessionName,
    setSessionName,
    inviteCode,
    setInviteCode,
    isCreating,
    isJoining,
    createError,
    joinError,
    canCreate,
    canJoin,
    handleCreateSession,
    handleJoinSession,
    resetCreateState,
    resetJoinState,
  };
}
