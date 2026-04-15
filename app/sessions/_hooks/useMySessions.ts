"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { listSessions, type SessionSummary } from "@/app/codeEditor/api";

interface UseMySessionsResult {
  sessions: SessionSummary[] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMySessions(token: string | null): UseMySessionsResult {
  const [sessions, setSessions] = useState<SessionSummary[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => setReloadKey((n) => n + 1), []);

  useEffect(() => {
    if (!token) {
      setSessions(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    listSessions(token)
      .then((data) => {
        if (cancelled) return;
        setSessions(data.sessions ?? []);
      })
      .catch((err) => {
        if (cancelled) return;
        const message =
          axios.isAxiosError(err) && err.response?.data?.message
            ? String(err.response.data.message)
            : err instanceof Error
              ? err.message
              : "No se pudieron cargar las sesiones.";
        setError(message);
        setSessions(null);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, reloadKey]);

  return { sessions, isLoading, error, refetch };
}
