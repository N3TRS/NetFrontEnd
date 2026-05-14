"use client";

import { useEffect, useRef, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import { io, type Socket } from "socket.io-client";

const WS_URL = process.env.NEXT_PUBLIC_URL_BOARD;

// Merge remote elements with local, keeping the copy with the higher version.
// Local-only elements (in-progress strokes not yet synced) are always preserved.
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

interface CollaborativeWhiteboardProps {
  sessionId: string | null;
  token: string | null;
  userEmail: string | null;
  userColor: string | null;
  onBoardReady?: (getElements: () => readonly unknown[]) => void;
}

interface RemoteCollaborator {
  userEmail: string;
  userColor: string;
  cursor: { x: number; y: number } | null;
}

export default function CollaborativeWhiteboard({
  sessionId,
  token,
  userEmail,
  userColor,
  onBoardReady,
}: CollaborativeWhiteboardProps) {
  const excalidrawAPIRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const pendingRemoteRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const pendingEmitRef = useRef<readonly unknown[] | null>(null);
  const pendingElementsRef = useRef<any[] | null>(null);
  const collaboratorsRef = useRef(new Map<string, RemoteCollaborator>());
  const hasSyncedRef = useRef(false);

  const pushCollaboratorsToCanvas = () => {
    if (!excalidrawAPIRef.current) return;
    const map = new Map<string, any>();
    collaboratorsRef.current.forEach((info, email) => {
      map.set(email, {
        username: email,
        color: { background: info.userColor, stroke: info.userColor },
        cursor: info.cursor ?? null,
      });
    });
    excalidrawAPIRef.current.updateScene({ collaborators: map });
  };

  useEffect(() => {
    if (!sessionId || !token) return;

    collaboratorsRef.current.clear();
    pendingElementsRef.current = null;
    hasSyncedRef.current = false;

    const socket = io(`${WS_URL}/ws/whiteboard`, {
      transports: ["websocket"],
      auth: { token },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("whiteboard.join", {
        sessionId,
        userEmail: userEmail ?? "anonymous",
        userColor: userColor ?? "#7C3AED",
      });
    });

    socket.on("whiteboard.joined", (data: any) => {
      if (Array.isArray(data?.collaborators)) {
        data.collaborators.forEach((c: any) => {
          if (c?.userEmail) {
            collaboratorsRef.current.set(c.userEmail, {
              userEmail: c.userEmail,
              userColor: c.userColor ?? "#7C3AED",
              cursor: c.cursor ?? null,
            });
          }
        });
        pushCollaboratorsToCanvas();
      }

      const elements = data?.elements;
      if (Array.isArray(elements) && elements.length > 0) {
        if (excalidrawAPIRef.current) {
          pendingRemoteRef.current += 1;
          excalidrawAPIRef.current.updateScene({ elements });
        } else {
          pendingElementsRef.current = elements;
        }
      }
      hasSyncedRef.current = true;
    });

    socket.on("whiteboard.update", (data: any) => {
      const elements = data?.elements;
      if (!Array.isArray(elements) || !excalidrawAPIRef.current) return;
      const local = excalidrawAPIRef.current.getSceneElements();
      const merged = reconcileElements(local, elements);
      pendingRemoteRef.current += 1;
      excalidrawAPIRef.current.updateScene({ elements: merged });
    });

    socket.on("whiteboard.pointer", (data: any) => {
      const { userEmail: email, userColor: color, x, y } = data ?? {};
      if (!email) return;
      const existing = collaboratorsRef.current.get(email) ?? {
        userEmail: email,
        userColor: color ?? "#7C3AED",
        cursor: null,
      };
      collaboratorsRef.current.set(email, {
        ...existing,
        cursor: { x, y },
      });
      pushCollaboratorsToCanvas();
    });

    socket.on("whiteboard.collaboratorJoined", (data: any) => {
      const { userEmail: email, userColor: color } = data ?? {};
      if (!email) return;
      if (!collaboratorsRef.current.has(email)) {
        collaboratorsRef.current.set(email, {
          userEmail: email,
          userColor: color ?? "#7C3AED",
          cursor: null,
        });
        pushCollaboratorsToCanvas();
      }
    });

    socket.on("whiteboard.collaboratorLeft", (data: any) => {
      if (data?.userEmail && collaboratorsRef.current.delete(data.userEmail)) {
        pushCollaboratorsToCanvas();
      }
    });

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        const pending = pendingEmitRef.current;
        pendingEmitRef.current = null;
        if (pending && socket.connected && sessionId && hasSyncedRef.current) {
          socket.emit("whiteboard.update", { sessionId, elements: pending });
        }
      }
      hasSyncedRef.current = false;
      collaboratorsRef.current.clear();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [sessionId, token]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket?.connected || !sessionId) return;
    socket.emit("whiteboard.join", {
      sessionId,
      userEmail: userEmail ?? "anonymous",
      userColor: userColor ?? "#7C3AED",
    });
  }, [userEmail, userColor]);

  useEffect(() => {
    if (!ready) return;
    if (pendingElementsRef.current?.length && excalidrawAPIRef.current) {
      pendingRemoteRef.current += 1;
      excalidrawAPIRef.current.updateScene({
        elements: pendingElementsRef.current,
      });
      pendingElementsRef.current = null;
    }
  }, [ready]);

  return (
    <div className="h-full w-full">
      <Excalidraw
        excalidrawAPI={(api) => {
          excalidrawAPIRef.current = api;
          setReady(true);
          onBoardReady?.(() =>
            (api.getSceneElements() as readonly unknown[]) ?? [],
          );
        }}
        onChange={(elements) => {
          if (pendingRemoteRef.current > 0) {
            pendingRemoteRef.current = Math.max(0, pendingRemoteRef.current - 1);
            return;
          }
          if (!socketRef.current) return;
          if (!hasSyncedRef.current) return;
          pendingEmitRef.current = elements;
          if (rafRef.current === null) {
            rafRef.current = requestAnimationFrame(() => {
              rafRef.current = null;
              const toSend = pendingEmitRef.current;
              pendingEmitRef.current = null;
              if (toSend) {
                socketRef.current?.emit("whiteboard.update", {
                  sessionId,
                  elements: toSend,
                });
              }
            });
          }
        }}
        onPointerUpdate={({ pointer }) => {
          socketRef.current?.emit("whiteboard.pointer", {
            sessionId,
            x: pointer.x,
            y: pointer.y,
          });
        }}
        UIOptions={{
          canvasActions: {
            changeViewBackgroundColor: false,
          },
        }}
      />
    </div>
  );
}
