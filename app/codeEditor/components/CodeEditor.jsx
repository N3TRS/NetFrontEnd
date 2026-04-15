"use client";

import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { Box, HStack, Text } from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import LanguageSelector from "./LanguageSelector";
import Output from "./Output";
import { LANGUAGE_VERSIONS } from "../Utils/constants";
import { useAuth } from "@/app/auth/_hooks/useAuth";
import { useSessionSocket } from "../hooks/useSessionSocket";
import { saveSessionSnapshot } from "../api";
import { createYjsClient } from "../lib/yjsClient";

function extractErrorMessage(error, fallback) {
  if (error && typeof error === "object") {
    if (error.response?.data?.message) {
      return String(error.response.data.message);
    }
    if (error.message) {
      return String(error.message);
    }
  }

  return fallback;
}

const CodeEditor = () => {
  const editorRef = useRef(null);
  const clientRef = useRef(null);
  const ydocRef = useRef(null);
  const [editorReady, setEditorReady] = useState(false);
  const searchParams = useSearchParams();
  const { token, user } = useAuth();

  const sessionId = searchParams.get("sessionId");
  const inviteCode = searchParams.get("inviteCode");
  const languageParam = searchParams.get("language");
  const language =
    languageParam && languageParam in LANGUAGE_VERSIONS
      ? languageParam
      : "javascript";

  const [lastResult, setLastResult] = useState(null);
  const [participantsOnline, setParticipantsOnline] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const yjsWsBase =
    process.env.NEXT_PUBLIC_YJS_WS_URL ||
    "ws://localhost:3002/ws/yjs";

  const { isConnected } = useSessionSocket({
    token,
    sessionId,
    onExecutionResult: (payload) => {
      setLastResult(payload);
    },
    onPresence: (payload) => {
      if (typeof payload.participantsOnline === "number") {
        setParticipantsOnline(payload.participantsOnline);
      }
    },
  });

  function handleEditorDidMount(editor) {
    editorRef.current = editor;
    setEditorReady(true);
  }

  useEffect(() => {
    if (!editorReady || !sessionId || !token || !editorRef.current) {
      return;
    }

    let cancelled = false;

    const setup = async () => {
      const { MonacoBinding } = await import("y-monaco");

      if (cancelled || !editorRef.current) {
        return;
      }

      const ydoc = new Y.Doc();
      const client = createYjsClient({
        wsUrl: yjsWsBase,
        sessionId,
        token,
        ydoc,
      });
      const type = ydoc.getText("content");

      ydocRef.current = ydoc;
      clientRef.current = client;

      new MonacoBinding(
        type,
        editorRef.current.getModel(),
        new Set([editorRef.current]),
        client.awareness
      );

      client.awareness.setLocalStateField("user", {
        name: user?.email || "anonymous",
        color: "#22d3ee",
      });
    };

    void setup();

    return () => {
      cancelled = true;
      clientRef.current?.close();
      ydocRef.current?.destroy();
      clientRef.current = null;
      ydocRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorReady, sessionId, token, yjsWsBase]);

  const getCode = () => editorRef.current?.getValue() ?? "";

  const handleSaveSession = async () => {
    if (!token || !sessionId) {
      setSaveMessage("No hay sesion activa para guardar.");
      return;
    }

    try {
      setIsSaving(true);
      setSaveMessage("");

      await saveSessionSnapshot(token, sessionId, language, getCode());
      setSaveMessage("Sesion guardada correctamente.");
    } catch (error) {
      setSaveMessage(extractErrorMessage(error, "No se pudo guardar la sesion."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Text fontSize="sm" color="gray.300">
          Session: {sessionId || "not-selected"}
          {inviteCode ? ` | Invite: ${inviteCode}` : ""}
        </Text>
        <Box display="flex" alignItems="center" gap={3}>
          <Text fontSize="sm" color={isConnected ? "green.300" : "orange.300"}>
            {isConnected ? `Connected (${participantsOnline})` : "Disconnected"}
          </Text>
          <button
            type="button"
            onClick={handleSaveSession}
            disabled={!sessionId || !token || isSaving}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Guardando..." : "Guardar sesion"}
          </button>
        </Box>
      </Box>
      {saveMessage ? (
        <Text mb={3} fontSize="xs" color={saveMessage.includes("correctamente") ? "green.300" : "red.300"}>
          {saveMessage}
        </Text>
      ) : null}
      <HStack spacing={4} align="flex-start">
        <Box w="50%">
          <LanguageSelector language={language} />
          <Editor
            height="75vh"
            language={language}
            defaultValue=""
            theme="vs-dark"
            onMount={handleEditorDidMount}
          />
        </Box>
        <Output
          getCode={getCode}
          language={language}
          token={token}
          sessionId={sessionId}
          externalResult={lastResult}
        />
      </HStack>
    </Box>
  );
};
export default CodeEditor;
