"use client";

import { useEffect, useRef, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import * as Y from "yjs";
import { createYjsClient, type YjsClient } from "../lib/yjsClient";
import { getUserColor } from "../lib/userColor";

const YJS_WS_BASE =
  (process.env.NEXT_PUBLIC_URL_SESSIONS
    ?.replace(/^https/, "wss")
    .replace(/^http/, "ws") ?? "ws://localhost:3002") + "/ws/yjs";

interface CollaborativeWhiteboardProps {
  sessionId: string | null;
  token: string | null;
  userEmail: string | null;
  userColor: string | null;
}

export default function CollaborativeWhiteboard({
  sessionId,
  token,
  userEmail,
  userColor,
}: CollaborativeWhiteboardProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const excalidrawAPIRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const ydocRef = useRef<Y.Doc | null>(null);
  const clientRef = useRef<YjsClient | null>(null);
  const boardMapRef = useRef<Y.Map<string> | null>(null);
  // Counter instead of boolean: incremented before updateScene, decremented inside onChange
  // to correctly handle the async gap between updateScene() and the resulting onChange call.
  const pendingRemoteRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep awareness in sync when user identity changes without tearing down the connection.
  useEffect(() => {
    if (!clientRef.current) return;
    const identity = userEmail ?? "anonymous";
    clientRef.current.awareness.setLocalStateField("user", {
      email: identity,
      name: identity,
      color: userColor ?? getUserColor(identity),
    });
  }, [userEmail, userColor]);

  // Main effect: only re-runs when the session or auth token changes.
  useEffect(() => {
    if (!sessionId || !token) return;

    const ydoc = new Y.Doc();
    const client = createYjsClient({
      wsUrl: YJS_WS_BASE,
      sessionId: `board-${sessionId}`,
      token,
      ydoc,
    });

    const boardMap = ydoc.getMap<string>("board");
    ydocRef.current = ydoc;
    clientRef.current = client;
    boardMapRef.current = boardMap;

    const identity = userEmail ?? "anonymous";
    client.awareness.setLocalStateField("user", {
      email: identity,
      name: identity,
      color: userColor ?? getUserColor(identity),
    });

    const applyRemote = () => {
      const raw = boardMap.get("scene");
      if (!raw || !excalidrawAPIRef.current) return;
      try {
        const { elements } = JSON.parse(raw) as { elements: unknown[] };
        // Increment before updateScene; the matching decrement happens inside onChange
        // after Excalidraw's async render cycle completes.
        pendingRemoteRef.current += 1;
        excalidrawAPIRef.current.updateScene({ elements });
      } catch {
        // ignore malformed scene data
      }
    };
    boardMap.observe(applyRemote);

    const syncCollaborators = () => {
      if (!excalidrawAPIRef.current) return;
      const { awareness } = client;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const collaborators = new Map<string, any>();
      awareness.getStates().forEach((state, clientId) => {
        if (clientId === awareness.clientID || !state.user) return;
        collaborators.set(String(clientId), {
          username: state.user.name ?? state.user.email ?? "Anonymous",
          color: {
            background: state.user.color ?? "#a855f7",
            stroke: state.user.color ?? "#a855f7",
          },
          cursor: state.cursor ?? null,
        });
      });
      excalidrawAPIRef.current.updateScene({ collaborators });
    };
    client.awareness.on("change", syncCollaborators);

    return () => {
      boardMap.unobserve(applyRemote);
      client.awareness.off("change", syncCollaborators);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      client.close();
      ydoc.destroy();
      ydocRef.current = null;
      clientRef.current = null;
      boardMapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, token]);

  // Apply initial remote scene once Excalidraw mounts
  useEffect(() => {
    if (!ready || !boardMapRef.current || !excalidrawAPIRef.current) return;
    const raw = boardMapRef.current.get("scene");
    if (!raw) return;
    try {
      const { elements } = JSON.parse(raw) as { elements: unknown[] };
      pendingRemoteRef.current += 1;
      excalidrawAPIRef.current.updateScene({ elements });
    } catch {
      // ignore
    }
  }, [ready]);

  return (
    <div className="h-full w-full">
      <Excalidraw
        excalidrawAPI={(api) => {
          excalidrawAPIRef.current = api;
          setReady(true);
        }}
        onChange={(elements) => {
          // If this onChange was triggered by a programmatic updateScene from a remote
          // update, consume the pending count and skip re-broadcasting to Y.Map.
          if (pendingRemoteRef.current > 0) {
            pendingRemoteRef.current -= 1;
            return;
          }
          if (!boardMapRef.current) return;
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(() => {
            boardMapRef.current?.set("scene", JSON.stringify({ elements }));
          }, 150);
        }}
        onPointerUpdate={({ pointer }) => {
          clientRef.current?.awareness.setLocalStateField("cursor", pointer);
        }}
        theme="dark"
        UIOptions={{
          canvasActions: {
            changeViewBackgroundColor: false,
          },
        }}
      />
    </div>
  );
}
