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
import { createYjsClient, type YjsClient } from "../lib/yjsClient";
import { LANGUAGE_VERSIONS } from "../Utils/constants";

type Language = keyof typeof LANGUAGE_VERSIONS;

export interface MonacoCanvasHandle {
  getCode: () => string;
}

interface MonacoCanvasProps {
  sessionId: string | null;
  token: string | null;
  userEmail: string | null;
  language: Language;
}

const YJS_WS_BASE = (process.env.NEXT_PUBLIC_URL_APIGATEWAY?.replace(/^https/, "wss").replace(/^http/, "ws") || "ws://localhost:3002") + "/ws/yjs";;

export const MonacoCanvas = forwardRef<MonacoCanvasHandle, MonacoCanvasProps>(
  function MonacoCanvas({ sessionId, token, userEmail, language }, ref) {
    const editorRef = useRef<MonacoEditorNs.IStandaloneCodeEditor | null>(null);
    const clientRef = useRef<YjsClient | null>(null);
    const ydocRef = useRef<Y.Doc | null>(null);
    const [editorReady, setEditorReady] = useState(false);

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

        client.awareness.setLocalStateField("user", {
          name: userEmail || "anonymous",
          color: "#22d3ee",
        });
      })();

      return () => {
        cancelled = true;
        clientRef.current?.close();
        ydocRef.current?.destroy();
        clientRef.current = null;
        ydocRef.current = null;
      };
    }, [editorReady, sessionId, token, userEmail]);

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
