"use client";

import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor as MonacoEditorNs } from "monaco-editor";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import * as Y from "yjs";
import type { Awareness } from "y-protocols/awareness";
import { createYjsClient, type YjsClient } from "../lib/yjsClient";
import { getUserColor } from "../lib/userColor";
import { useRemoteCursorStyles } from "../hooks/useRemoteCursorStyles";
import { useRemoteNameLabels } from "../hooks/useRemoteNameLabels";
import { LANGUAGE_VERSIONS } from "../Utils/constants";

type Language = keyof typeof LANGUAGE_VERSIONS;

export interface MonacoCanvasHandle {
  getCode: () => string;
}

interface MonacoCanvasProps {
  sessionId: string | null;
  token: string | null;
  userEmail: string | null;
  userColor: string | null;
  language: Language;
}

const YJS_WS_BASE = (process.env.NEXT_PUBLIC_URL_SESSIONS?.replace(/^https/, "wss").replace(/^http/, "ws") || "ws://localhost:3002") + "/ws/yjs";;

export const MonacoCanvas = forwardRef<MonacoCanvasHandle, MonacoCanvasProps>(
  function MonacoCanvas(
    { sessionId, token, userEmail, userColor, language },
    ref,
  ) {
    const editorRef = useRef<MonacoEditorNs.IStandaloneCodeEditor | null>(null);
    const clientRef = useRef<YjsClient | null>(null);
    const ydocRef = useRef<Y.Doc | null>(null);
    const [editorReady, setEditorReady] = useState(false);
    const [awareness, setAwareness] = useState<Awareness | null>(null);
    const [ydocState, setYdocState] = useState<Y.Doc | null>(null);
    const [ytext, setYtext] = useState<Y.Text | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        getCode: () => editorRef.current?.getValue() ?? "",
      }),
      [],
    );

    const handleMount: OnMount = (editor) => {
      editorRef.current = editor;
      setEditorReady(true);
    };

    useEffect(() => {
      if (!editorReady || !sessionId || !token || !editorRef.current) return;
      let cancelled = false;

      (async () => {
        const { MonacoBinding } = await import("y-monaco");
        if (cancelled || !editorRef.current) return;

        const ydoc = new Y.Doc();
        const client = createYjsClient({
          wsUrl: YJS_WS_BASE,
          sessionId,
          token,
          ydoc,
        });
        const type = ydoc.getText("content");

        ydocRef.current = ydoc;
        clientRef.current = client;

        const model = editorRef.current.getModel();
        if (!model) return;

        new MonacoBinding(
          type,
          model,
          new Set([editorRef.current]),
          client.awareness,
        );

        const identity = userEmail || "anonymous";
        client.awareness.setLocalStateField("user", {
          email: identity,
          name: identity,
          color: userColor ?? getUserColor(identity),
        });

        setAwareness(client.awareness);
        setYdocState(ydoc);
        setYtext(type);
      })();

      return () => {
        cancelled = true;
        clientRef.current?.close();
        ydocRef.current?.destroy();
        clientRef.current = null;
        ydocRef.current = null;
        setAwareness(null);
        setYdocState(null);
        setYtext(null);
      };
    }, [editorReady, sessionId, token, userEmail]);

    useEffect(() => {
      if (!awareness) return;
      const identity = userEmail || "anonymous";
      awareness.setLocalStateField("user", {
        email: identity,
        name: identity,
        color: userColor ?? getUserColor(identity),
      });
    }, [awareness, userEmail, userColor]);

    useRemoteCursorStyles(awareness);
    useRemoteNameLabels({
      editor: editorReady ? editorRef.current : null,
      ydoc: ydocState,
      ytext,
      awareness,
    });

    return (
      <div className="h-full w-full bg-secondary">
        <Editor
          height="100%"
          language={language}
          defaultValue=""
          theme="vs-dark"
          onMount={handleMount}
          options={{
            fontSize: 14,
            fontFamily: "var(--font-jetbrains-mono), monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            renderLineHighlight: "none",
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
    );
  },
);
