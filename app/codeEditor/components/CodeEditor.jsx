"use client";

import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { Box, HStack, Text } from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import LanguageSelector from "./LanguageSelector";
import Output from "./Output";
import { LANGUAGE_VERSIONS } from "../Utils/constants";
import { useAuth } from "@/app/auth/_hooks/useAuth";
import { useSessionSocket } from "../hooks/useSessionSocket";
import { saveSessionSnapshot } from "../api";

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
  const providerRef = useRef(null);
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

  const [value, setValue] = useState("");
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

  async function handleEditorDidMount(editor) {
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
      const provider = new WebsocketProvider(yjsWsBase, sessionId, ydoc, {
        params: {
          token,
        },
      });
      const type = ydoc.getText("monaco");

      ydocRef.current = ydoc;
      providerRef.current = provider;

      new MonacoBinding(
        type,
        editorRef.current.getModel(),
        new Set([editorRef.current]),
        provider.awareness
      );

      provider.awareness.setLocalStateField("user", {
        name: user?.email || "anonymous",
        color: "#22d3ee",
      });
    };

    void setup();

    return () => {
      cancelled = true;
      providerRef.current?.destroy();
      ydocRef.current?.destroy();
      providerRef.current = null;
      ydocRef.current = null;
    };
  }, [editorReady, sessionId, token, user?.email, yjsWsBase]);

  const handleSaveSession = async () => {
    if (!token || !sessionId) {
      setSaveMessage("No hay sesion activa para guardar.");
      return;
    }

    try {
      setIsSaving(true);
      setSaveMessage("");

      await saveSessionSnapshot(token, sessionId, language, value || "");
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
            value={value}
            theme="vs-dark"
            onMount={handleEditorDidMount}
            onChange={(newValue) => setValue(newValue)}
          />
        </Box>
        <Output
          code={value}
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
