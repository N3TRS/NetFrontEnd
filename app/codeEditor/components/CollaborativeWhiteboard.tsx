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
  const isRemoteRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        isRemoteRef.current = true;
        excalidrawAPIRef.current.updateScene({ elements });
        isRemoteRef.current = false;
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
  }, [sessionId, token, userEmail, userColor]);

  // Apply initial remote scene once Excalidraw mounts
  useEffect(() => {
    if (!ready || !boardMapRef.current || !excalidrawAPIRef.current) return;
    const raw = boardMapRef.current.get("scene");
    if (!raw) return;
    try {
      const { elements } = JSON.parse(raw) as { elements: unknown[] };
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
          if (isRemoteRef.current || !boardMapRef.current) return;
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
