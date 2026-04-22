"use client";

import { useState, useCallback } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_URL_APIGATEWAY || "http://localhost:3002/api";

/**
 * Session data returned from API
 */
export interface Session {
  sessionId: string;
  name: string;
  inviteCode: string;
}

export interface SessionDetails {
  sessionId: string;
  name: string;
  owner: string;
  inviteCode: string;
  createdAt: string;
  maxParticipants: number;
  participants: {
    email: string;
    isOnline: boolean;
    isOwner: boolean;
  }[];
}

export interface SessionSummary {
  sessionId: string;
  name: string;
  owner: string;
  participantCount: number;
  createdAt: string;
  isOwner: boolean;
}

export interface JoinSessionResponse {
  sessionId: string;
  name: string;
  participants: {
    email: string;
    isOnline: boolean;
    isOwner: boolean;
  }[];
}

interface UseSessionApiResult {
  // State
  loading: boolean;
  error: string | null;

  // Actions
  createSession: (
    name: string,
    maxParticipants?: number,
  ) => Promise<Session | null>;
  joinSession: (sessionId: string) => Promise<JoinSessionResponse | null>;
  joinSessionByCode: (
    inviteCode: string,
  ) => Promise<JoinSessionResponse | null>;
  getSession: (sessionId: string) => Promise<SessionDetails | null>;
  getMySessions: () => Promise<SessionSummary[]>;
  leaveSession: (sessionId: string) => Promise<boolean>;
  closeSession: (sessionId: string) => Promise<boolean>;
}

/**
 * Hook for interacting with the NetSession REST API
 */
export function useSessionApi(token: string | null): UseSessionApiResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Make authenticated API request
   */
  const apiRequest = useCallback(
    async <T>(
      endpoint: string,
      options: RequestInit = {},
    ): Promise<T | null> => {
      if (!token) {
        setError("Authentication required");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Request failed: ${response.status}`,
          );
        }

        // Handle 204 No Content
        if (response.status === 204) {
          return null;
        }

        return await response.json();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Request failed";
        setError(errorMessage);
        console.error(`[SessionAPI] Error: ${errorMessage}`);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  /**
   * Create a new session
   */
  const createSession = useCallback(
    async (name: string, maxParticipants = 5): Promise<Session | null> => {
      return apiRequest<Session>("/sessions", {
        method: "POST",
        body: JSON.stringify({ name, maxParticipants }),
      });
    },
    [apiRequest],
  );

  /**
   * Join a session by ID
   */
  const joinSession = useCallback(
    async (sessionId: string): Promise<JoinSessionResponse | null> => {
      return apiRequest<JoinSessionResponse>(`/sessions/${sessionId}/join`, {
        method: "POST",
      });
    },
    [apiRequest],
  );

  /**
   * Join a session by invite code
   */
  const joinSessionByCode = useCallback(
    async (inviteCode: string): Promise<JoinSessionResponse | null> => {
      return apiRequest<JoinSessionResponse>("/sessions/join-by-code", {
        method: "POST",
        body: JSON.stringify({ inviteCode }),
      });
    },
    [apiRequest],
  );

  /**
   * Get session details
   */
  const getSession = useCallback(
    async (sessionId: string): Promise<SessionDetails | null> => {
      return apiRequest<SessionDetails>(`/sessions/${sessionId}`);
    },
    [apiRequest],
  );

  /**
   * Get all sessions for current user
   */
  const getMySessions = useCallback(async (): Promise<SessionSummary[]> => {
    const result = await apiRequest<SessionSummary[]>("/sessions/my-sessions");
    return result || [];
  }, [apiRequest]);

  const leaveSession = useCallback(
    async (sessionId: string): Promise<boolean> => {
      await apiRequest(`/sessions/${sessionId}/leave`, {
        method: "DELETE",
      });
      return !error;
    },
    [apiRequest, error],
  );

  const closeSession = useCallback(
    async (sessionId: string): Promise<boolean> => {
      await apiRequest(`/sessions/${sessionId}`, {
        method: "DELETE",
      });
      return !error;
    },
    [apiRequest, error],
  );

  return {
    loading,
    error,
    createSession,
    joinSession,
    joinSessionByCode,
    getSession,
    getMySessions,
    leaveSession,
    closeSession,
  };
}