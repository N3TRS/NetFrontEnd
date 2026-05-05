"use client";
import { Excalidraw } from "@excalidraw/excalidraw";
import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";

const WS_URL = process.env.NEXT_PUBLIC_URL_SESSIONS ?? "http://localhost:3002";

function getStoredToken(): string | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { token?: string };
    return parsed?.token ?? null;
  } catch {
    return null;
  }
}

function getSessionId(): string {
  if (typeof window === "undefined") return "global";
  return new URLSearchParams(window.location.search).get("sessionId") ?? "global";
}

export default function ExcalidrawBoard() {

  const excalidrawApiRef = useRef<any>(null);
  const socketRef = useRef<Socket | null>(null);
  const isRemoteUpdateRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionIdRef = useRef(getSessionId());

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return;

    const socket = io(`${WS_URL}/ws/whiteboard`, {
      transports: ["websocket"],
      auth: { token },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("whiteboard.join", { sessionId: sessionIdRef.current });
    });

    const applyRemoteElements = (elements: any[]) => {
      if (!excalidrawApiRef.current || !Array.isArray(elements) || elements.length === 0) return;
      isRemoteUpdateRef.current = true;
      excalidrawApiRef.current.updateScene({ elements });
      setTimeout(() => {
        isRemoteUpdateRef.current = false;
      }, 80);
    };

    socket.on("whiteboard.joined", (data: any) => {
      applyRemoteElements(data?.elements);
    });

    socket.on("whiteboard.update", (data: any) => {
      applyRemoteElements(data?.elements);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const handleChange = (elements: readonly any[]) => {
    if (isRemoteUpdateRef.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      socketRef.current?.emit("whiteboard.update", {
        sessionId: sessionIdRef.current,
        elements,
      });
    }, 50);
  };

  return (
    <div className="h-full w-full">
      <Excalidraw
        excalidrawAPI={(api) => {
          excalidrawApiRef.current = api;
        }}
        onChange={handleChange}
      />
    </div>
  );
}
