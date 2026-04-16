"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { createSession, joinSession } from "@/app/codeEditor/api";
import { useAuth } from "@/app/auth/_hooks/useAuth";
import { LANGUAGE_VERSIONS } from "@/app/codeEditor/Utils/constants";

type SupportedLanguage = keyof typeof LANGUAGE_VERSIONS;

const DEFAULT_LANGUAGE: SupportedLanguage = "javascript";

export function useSessionActions() {
  const router = useRouter();
  const { token } = useAuth();

  const [sessionName, setSessionName] = useState("");
  const [language, setLanguage] = useState<SupportedLanguage>(DEFAULT_LANGUAGE);
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
      const data = await createSession(token, sessionName.trim(), language);
      const sessionId = data?.session?.id;
      const createdInviteCode = data?.session?.inviteCode;
      const createdLanguage = (data?.session?.language as SupportedLanguage) || language;

      if (!sessionId) {
        throw new Error("Session was created but no sessionId was returned");
      }

      router.push(
        `/codeEditor?sessionId=${sessionId}&language=${createdLanguage}${createdInviteCode ? `&inviteCode=${createdInviteCode}` : ""}`,
      );
    } catch (error) {
      const message =
        axios.isAxiosError(error) && error.response?.status === 409
          ? "Ya existe una sesión con este nombre, intenta otro"
          : error instanceof Error
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
      const joinedLanguage =
        (data?.session?.language as SupportedLanguage) || DEFAULT_LANGUAGE;

      if (!sessionId) {
        throw new Error("No se encontro la sesion para ese codigo");
      }

      router.push(
        `/codeEditor?sessionId=${sessionId}&inviteCode=${normalizedInviteCode}&language=${joinedLanguage}`,
      );
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
    setLanguage(DEFAULT_LANGUAGE);
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
    language,
    setLanguage,
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
