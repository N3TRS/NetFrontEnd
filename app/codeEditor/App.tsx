"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Group, Panel, Separator } from "react-resizable-panels";
import { useAuth } from "@/app/auth/_hooks/useAuth";
import { saveSessionSnapshot } from "./api";
import { FILE_EXTENSIONS, LANGUAGE_VERSIONS } from "./Utils/constants";
import { useSessionSocket } from "./hooks/useSessionSocket";
import { useCodeExecution } from "./hooks/useCodeExecution";
import { useWebRTC } from "./hooks/WebRTCHook/useWebRTC";
import { useCallStore } from "./components/_stores/callStore";
import { AIChatPanel } from "./components/AIChatPanel";
import { EditorHeader } from "./components/EditorHeader";
import { EditorSidebar } from "./components/EditorSidebar";
import { EditorTabs } from "./components/EditorTabs";
import { EditorTerminal } from "./components/EditorTerminal";
import { CallModal } from "./components/VideoCall/CallModal";
import { VideoCall } from "./components/VideoCall/VideoCall";
import { IncomingCallDialog } from "./components/VideoCall/IncomingCallDialog";
import {
  MonacoCanvas,
  type MonacoCanvasHandle,
} from "./components/MonacoCanvas";
import type { Participant } from "./components/ParticipantAvatars";

type Language = keyof typeof LANGUAGE_VERSIONS;

type ExecutionRunPayload = {
  stdout: string;
  stderr: string;
  code: number;
  signal: string | null;
  output: string;
};

const RUNNERS: Record<Language, string> = {
  typescript: "ts-node",
  python: "python",
  java: "java",
};

function resolveLanguage(value: string | null): Language {
  if (value && value in LANGUAGE_VERSIONS) return value as Language;
  return "typescript";
}

function deriveFilename(name: string, language: Language): string {
  const base = name.toLowerCase().replace(/\s+/g, "") || "session";
  return `${base}${FILE_EXTENSIONS[language]}`;
}

function deriveCommand(language: Language, filename: string): string {
  if (language === "java") return `${RUNNERS.java} ${filename.replace(/\.java$/, "")}`;
  return `${RUNNERS[language]} ${filename}`;
}

const App = () => {
  const { token, user } = useAuth();
  const searchParams = useSearchParams();

  const sessionId = searchParams.get("sessionId");
  const inviteCode = searchParams.get("inviteCode");
  const nameParam = searchParams.get("name");
  const language = resolveLanguage(searchParams.get("language"));

  const sessionName = useMemo(
    () => nameParam?.trim() || (sessionId ? `Session ${sessionId.slice(0, 6)}` : "Untitled session"),
    [nameParam, sessionId],
  );
  const filename = useMemo(
    () => deriveFilename(sessionName, language),
    [sessionName, language],
  );
  const command = useMemo(
    () => deriveCommand(language, filename),
    [language, filename],
  );

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [externalResult, setExternalResult] = useState<{
    run?: ExecutionRunPayload;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  const canvasRef = useRef<MonacoCanvasHandle>(null);
  const { isInCall, isIncomingCall, joinableCall } = useCallStore();
  const userEmail = user?.email;
  const { startCall, acceptCall, rejectCall, leaveCall, joinCall } = useWebRTC(userEmail || '', token);

  useSessionSocket({
    token,
    sessionId,
    onExecutionResult: (payload) => {
      if (user?.email && payload.runBy === user.email) return;
      setExternalResult(payload);
    },
    onPresence: (payload) => {
      if (Array.isArray(payload.members)) {
        setParticipants(payload.members.map((email) => ({ email })));
      } else if (payload.userEmail && payload.status) {
        setParticipants((prev) => {
          if (payload.status === 'online') {
            if (prev.some((p) => p.email === payload.userEmail)) return prev;
            return [...prev, { email: payload.userEmail }];
          }
          return prev.filter((p) => p.email !== payload.userEmail);
        });
      }
    },
  });

  const { lines, isRunning, run, pushLog } = useCodeExecution({
    token,
    sessionId,
    language,
    command,
    externalResult,
  });

  const handleGetCode = useCallback(() => canvasRef.current?.getCode() ?? "", []);

  const handleRun = useCallback(() => {
    const code = canvasRef.current?.getCode() ?? "";
    void run(code);
  }, [run]);

  const handleSave = useCallback(async () => {
    if (!token || !sessionId) {
      pushLog("No active session to save", "fail");
      return;
    }
    try {
      setIsSaving(true);
      const code = canvasRef.current?.getCode() ?? "";
      await saveSessionSnapshot(token, sessionId, language, code);
      pushLog("Session saved", "ok");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not save session";
      pushLog(message, "fail");
    } finally {
      setIsSaving(false);
    }
  }, [language, pushLog, sessionId, token]);

  const handleInvite = useCallback(() => {
    if (!inviteCode) {
      pushLog("No invite code available", "fail");
      return;
    }
    if (navigator?.clipboard) {
      void navigator.clipboard.writeText(inviteCode);
      pushLog(`Invite code copied: ${inviteCode}`, "ok");
    } else {
      pushLog(`Invite code: ${inviteCode}`, "ok");
    }
  }, [inviteCode, pushLog]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-white">
      <EditorHeader
        sessionName={sessionName}
        language={language}
        participants={participants}
        isSaving={isSaving}
        isRunning={isRunning}
        canRun={Boolean(token && sessionId)}
        onInvite={handleInvite}
        onSave={handleSave}
        onRun={handleRun}
      />

      <div className="flex flex-1 overflow-hidden">
        <EditorSidebar
          terminalOpen={terminalOpen}
          onToggleTerminal={() => setTerminalOpen((v) => !v)}
          aiPanelOpen={aiPanelOpen}
          onToggleAiPanel={() => setAiPanelOpen((v) => !v)}
          onToggleCall={() => setCallModalOpen(true)}
          joinableCall={joinableCall}
          onJoinCall={joinCall}
        />

        {aiPanelOpen && (
          <AIChatPanel
            onGetCode={handleGetCode}
            onClose={() => setAiPanelOpen(false)}
          />
        )}

        <div className="flex flex-1 flex-col overflow-hidden">
          <EditorTabs filename={filename} />

          <Group orientation="vertical" className="flex-1">
            <Panel defaultSize={70} minSize={5}>
              <MonacoCanvas
                ref={canvasRef}
                sessionId={sessionId}
                token={token}
                userEmail={user?.email ?? null}
                language={language}
              />
            </Panel>

            {terminalOpen ? (
              <>
                <Separator className="relative h-px bg-white/5 transition-colors hover:bg-primary/50 active:bg-primary">
                  <span className="absolute inset-x-0 -top-1 h-[9px]" />
                </Separator>
                <Panel defaultSize={30} minSize={5}>
                  <EditorTerminal
                    command={command}
                    lines={lines}
                    onCollapse={() => setTerminalOpen(false)}
                    onClose={() => setTerminalOpen(false)}
                  />
                </Panel>
              </>
            ) : null}
          </Group>
        </div>
      </div>

      <CallModal
        open={callModalOpen}
        onClose={() => setCallModalOpen(false)}
        onStartCall={(emails) => {
          startCall(emails);
          setCallModalOpen(false);
        }}
        currentUserId={userEmail || ""}
        sessionId={sessionId}
        token={token}
      />
      {isInCall && <VideoCall onEndCall={leaveCall} />}
      {isIncomingCall && (
        <IncomingCallDialog
          onAcceptCall={acceptCall}
          onRejectCall={rejectCall}
        />
      )}
    </div>
  );
};

export default App;
