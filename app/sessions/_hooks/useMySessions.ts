"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { listSessions, type SessionSummary } from "@/app/codeEditor/api";

interface UseMySessionsResult {
  sessions: SessionSummary[] | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  updateSessionName: (id: string, name: string) => void;
  removeSession: (id: string) => void;
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

  const updateSessionName = useCallback((id: string, name: string) => {
    setSessions((prev) =>
      prev
        ? prev.map((s) => (s.id === id ? { ...s, name, updatedAt: new Date().toISOString() } : s))
        : prev,
    );
  }, []);

  const removeSession = useCallback((id: string) => {
    setSessions((prev) => (prev ? prev.filter((s) => s.id !== id) : prev));
  }, []);

  return { sessions, isLoading, error, refetch, updateSessionName, removeSession };
}
