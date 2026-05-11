"use client";
import { Excalidraw } from "@excalidraw/excalidraw";
import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";

const WS_URL = process.env.NEXT_PUBLIC_URL_SESSIONS ?? "http://localhost:3002";

function getStoredUser(): { token: string | null; email: string; color: string } {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return { token: null, email: "anonymous", color: "#7C3AED" };
    const parsed = JSON.parse(raw) as { token?: string; email?: string; color?: string };
    return {
      token: parsed.token ?? null,
      email: parsed.email ?? "anonymous",
      color: parsed.color ?? "#7C3AED",
    };
  } catch {
    return { token: null, email: "anonymous", color: "#7C3AED" };
  }
}

function getSessionId(): string {
  if (typeof window === "undefined") return "global";
  return new URLSearchParams(window.location.search).get("sessionId") ?? "global";
}

// Local-only elements 
function reconcileElements(local: readonly any[], remote: any[]): any[] {
  const result = new Map<string, any>(remote.map((el: any) => [el.id, el]));
  for (const localEl of local) {
    const remoteEl = result.get(localEl.id);
    if (!remoteEl || localEl.version > remoteEl.version) {
      result.set(localEl.id, localEl);
    }
  }
  return Array.from(result.values());
}

export default function ExcalidrawBoard() {
  const excalidrawApiRef = useRef<any>(null);
  const socketRef = useRef<Socket | null>(null);
  const pendingRemoteRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const pendingEmitRef = useRef<readonly any[] | null>(null);
  const pendingElementsRef = useRef<any[] | null>(null);
  const sessionIdRef = useRef(getSessionId());

  useEffect(() => {
    const { token, email, color } = getStoredUser();
    if (!token) return;

    const socket = io(`${WS_URL}/ws/whiteboard`, {
      transports: ["websocket"],
      auth: { token },
    });
    socketRef.current = socket;

    const applyRemoteUpdate = (elements: any[], skipEmpty = false) => {
      if (!Array.isArray(elements)) return;
      if (skipEmpty && elements.length === 0) return;
      if (!excalidrawApiRef.current) {
        pendingElementsRef.current = elements;
        return;
      }
      const local = excalidrawApiRef.current.getSceneElements();
      const merged = reconcileElements(local, elements);
      pendingRemoteRef.current += 1;
      excalidrawApiRef.current.updateScene({ elements: merged });
    };

    socket.on("connect", () => {
      socket.emit("whiteboard.join", {
        sessionId: sessionIdRef.current,
        userEmail: email,
        userColor: color,
      });
    });

    socket.on("whiteboard.joined", (data: any) => {
      applyRemoteUpdate(data?.elements, true);
    });

    socket.on("whiteboard.update", (data: any) => {
      applyRemoteUpdate(data?.elements);
    });

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        pendingEmitRef.current = null;
      }
      const finalElements = excalidrawApiRef.current?.getSceneElements();
      if (finalElements && finalElements.length > 0 && socket.connected) {
        socket.emit("whiteboard.update", {
          sessionId: sessionIdRef.current,
          elements: finalElements,
        });
      }
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return (
    <div className="h-full w-full">
      <Excalidraw
        excalidrawAPI={(api) => {
          excalidrawApiRef.current = api;
          if (pendingElementsRef.current !== null) {
            if (pendingElementsRef.current.length > 0) {
              pendingRemoteRef.current += 1;
              api.updateScene({ elements: pendingElementsRef.current });
            }
            pendingElementsRef.current = null;
          }
        }}
        onChange={(elements) => {
          if (pendingRemoteRef.current > 0) {
            pendingRemoteRef.current = Math.max(0, pendingRemoteRef.current - 1);
            return;
          }
          pendingEmitRef.current = elements;
          if (rafRef.current === null) {
            rafRef.current = requestAnimationFrame(() => {
              rafRef.current = null;
              const toSend = pendingEmitRef.current;
              pendingEmitRef.current = null;
              if (toSend) {
                socketRef.current?.emit("whiteboard.update", {
                  sessionId: sessionIdRef.current,
                  elements: toSend,
                });
              }
            });
          }
        }}
      />
    </div>
  );
}
