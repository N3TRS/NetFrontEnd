"use client";

import { useState, useCallback } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_URL_APIGATEWAY || "http://localhost:3002/v1";

export interface SessionParticipant {
  email: string;
  isOnline: boolean;
  isOwner: boolean;
}

export interface SessionCallData {
  sessionId: string;
  name: string;
  ownerEmail: string;
  participants: SessionParticipant[];
}

interface RawSessionResponse {
  session: {
    id: string;
    name: string;
    ownerEmail: string;
  };
  participants: {
    userEmail: string;
    isOnline: boolean;
  }[];
}

interface UseSessionCallDataResult {
  loading: boolean;
  error: string | null;
  getSessionParticipants: (sessionId: string, token: string) => Promise<SessionCallData | null>;
}

export function useSessionCallData(): UseSessionCallDataResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSessionParticipants = useCallback(
    async (sessionId: string, token: string): Promise<SessionCallData | null> => {
      if (!sessionId || !token) {
        setError("Session ID and token are required");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/v1/sessions/${sessionId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to fetch session: ${response.status}`);
        }

        const data: RawSessionResponse = await response.json();

        const ownerEmail = data.session?.ownerEmail || "";

        const participants: SessionParticipant[] = data.participants.map((p) => ({
          email: p.userEmail,
          isOnline: p.isOnline,
          isOwner: p.userEmail === ownerEmail,
        }));

        return {
          sessionId: data.session.id,
          name: data.session.name,
          ownerEmail,
          participants,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch session";
        setError(errorMessage);
        console.error("[useSessionCallData] Error:", errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    getSessionParticipants,
  };
}
