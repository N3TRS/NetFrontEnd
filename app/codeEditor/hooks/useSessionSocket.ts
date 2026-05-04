"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { PermissionLevel } from "../lib/permissions";

type PresencePayload = {
  sessionId: string;
  userEmail: string;
  status: "online" | "offline";
  members?: string[];
  participantsOnline?: number;
  colors?: Record<string, string>;
  roles?: Record<string, PermissionLevel>;
};

type RoleUpdatedPayload = {
  sessionId: string;
  userEmail: string;
  role: PermissionLevel;
  changedBy: string;
  timestamp: number;
};

type ExecutionPayload = {
  sessionId: string;
  runBy: string;
  run: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
  language: string;
  version: string;
};

interface UseSessionSocketOptions {
  token: string | null;
  sessionId: string | null;
  onExecutionResult?: (payload: ExecutionPayload) => void;
  onPresence?: (payload: PresencePayload) => void;
  onRoleUpdated?: (payload: RoleUpdatedPayload) => void;
}

export function useSessionSocket({
  token,
  sessionId,
  onExecutionResult,
  onPresence,
  onRoleUpdated,
}: UseSessionSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const executionRef = useRef(onExecutionResult);
  const presenceRef = useRef(onPresence);
  const roleUpdatedRef = useRef(onRoleUpdated);

  useEffect(() => {
    executionRef.current = onExecutionResult;
  }, [onExecutionResult]);

  useEffect(() => {
    presenceRef.current = onPresence;
  }, [onPresence]);

  useEffect(() => {
    roleUpdatedRef.current = onRoleUpdated;
  }, [onRoleUpdated]);

  const socketBaseUrl = useMemo(() => {
    return process.env.NEXT_PUBLIC_URL_SESSIONS || "http://localhost:3002";
  }, []);

  useEffect(() => {
    if (!token || !sessionId) {
      return;
    }

    const socket = io(`${socketBaseUrl}/ws/session`, {
      transports: ["websocket"],
      auth: {
        token,
      },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("session.join", { sessionId });
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("session.presence", (payload: PresencePayload) => {
      presenceRef.current?.(payload);
    });

    socket.on("execution.result", (payload: ExecutionPayload) => {
      executionRef.current?.(payload);
    });

    socket.on("session.roleUpdated", (payload: RoleUpdatedPayload) => {
      roleUpdatedRef.current?.(payload);
    });

    return () => {
      socket.emit("session.leave", { sessionId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [
    token,
    sessionId,
    socketBaseUrl,
  ]);

  return {
    isConnected,
  };
}
