"use client";

import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { Box, HStack, Text } from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import LanguageSelector from "./LanguageSelector";
import Output from "./Output";
import { CODE_SNIPPETS } from "../Utils/constants";
import { useAuth } from "@/app/auth/_hooks/useAuth";
import { useSessionSocket } from "../hooks/useSessionSocket";

const CodeEditor = () => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const providerRef = useRef(null);
  const ydocRef = useRef(null);
  const [editorReady, setEditorReady] = useState(false);
  const searchParams = useSearchParams();
  const { token, user } = useAuth();

  const sessionId = searchParams.get("sessionId");
  const inviteCode = searchParams.get("inviteCode");

  const [language, setLanguage] = useState("javascript");
  const [value, setValue] = useState(CODE_SNIPPETS["javascript"]);
  const [lastResult, setLastResult] = useState(null);
  const [participantsOnline, setParticipantsOnline] = useState(1);

  const yjsWsBase =
    process.env.NEXT_PUBLIC_YJS_WS_URL ||
    "ws://localhost:3002/ws/yjs";

  const { isConnected, emitLanguageChanged } = useSessionSocket({
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
    onLanguageChanged: (payload) => {
      if (payload.language && payload.language !== language) {
        setLanguage(payload.language);
      }
    },
  });

  async function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    monacoRef.current = monaco;
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

  useEffect(() => {
    if (editorRef.current && monacoRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelLanguage(model, language);
      }
    }
  }, [language]);

  const onSelect = (newLanguage) => {
    setLanguage(newLanguage);
    setValue(CODE_SNIPPETS[newLanguage]);

    if (sessionId) {
      emitLanguageChanged(newLanguage);
    }
  };

  return (
    <Box>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Text fontSize="sm" color="gray.300">
          Session: {sessionId || "not-selected"}
          {inviteCode ? ` | Invite: ${inviteCode}` : ""}
        </Text>
        <Text fontSize="sm" color={isConnected ? "green.300" : "orange.300"}>
          {isConnected ? `Connected (${participantsOnline})` : "Disconnected"}
        </Text>
      </Box>
      <HStack spacing={4} align="flex-start">
        <Box w="50%">
          <LanguageSelector language={language} onSelect={onSelect} />
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
