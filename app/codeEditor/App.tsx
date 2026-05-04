"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Group, Panel, Separator } from "react-resizable-panels";
import { useAuth } from "@/app/auth/_hooks/useAuth";
import {
  getSession,
  saveSessionSnapshot,
  updateParticipantRole,
} from "./api";
import type { PermissionLevel } from "./lib/permissions";
import { useSessionPermissions } from "./hooks/useSessionPermissions";
import { SessionRolesModal } from "./components/SessionRolesModal";
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
  const [colors, setColors] = useState<Record<string, string>>({});
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null);
  const [rolesModalOpen, setRolesModalOpen] = useState(false);
  const [externalResult, setExternalResult] = useState<{
    run?: ExecutionRunPayload;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(true);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  useEffect(() => {
    if (!token || !sessionId) return;
    let cancelled = false;
    void (async () => {
      try {
        const detail = await getSession(token, sessionId);
        if (cancelled) return;
        setOwnerEmail(detail.session.ownerEmail);
        setParticipants((prev) => {
          const map = new Map(prev.map((p) => [p.email, p]));
          for (const dp of detail.participants) {
            const existing = map.get(dp.userEmail);
            map.set(dp.userEmail, {
              email: dp.userEmail,
              color: existing?.color,
              role:
                dp.userEmail === detail.session.ownerEmail
                  ? "OWNER"
                  : (dp.role ?? "VIEW"),
            });
          }
          return Array.from(map.values());
        });
      } catch {
        // network errors handled elsewhere; permissions fall back to VIEW
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, sessionId]);

  const canvasRef = useRef<MonacoCanvasHandle>(null);
  const { isInCall, isIncomingCall, joinableCall, currentCall } = useCallStore();
  const userEmail = user?.email;
  const { startCall, acceptCall, rejectCall, leaveCall, joinCall, inviteToCall } =
    useWebRTC(userEmail || '', token);
  const [callModalMode, setCallModalMode] = useState<'start' | 'invite' | null>(null);

  useSessionSocket({
    token,
    sessionId,
    onExecutionResult: (payload) => {
      if (user?.email && payload.runBy === user.email) return;
      setExternalResult(payload);
    },
    onPresence: (payload) => {
      if (payload.colors) {
        setColors((prev) => ({ ...prev, ...payload.colors }));
      }
      const colorFor = (email: string): string | undefined =>
        payload.colors?.[email] ?? colors[email];
      const roleFor = (email: string): PermissionLevel | undefined =>
        payload.roles?.[email];
      // members[] is treated as additive (snapshot or partial — never authoritative).
      // Removals must arrive as an explicit { userEmail, status: 'offline' } delta.
      if (Array.isArray(payload.members)) {
        const incoming = payload.members;
        setParticipants((prev) => {
          const seen = new Set(prev.map((p) => p.email));
          const additions = incoming
            .filter((email) => !seen.has(email))
            .map((email) => ({
              email,
              color: colorFor(email),
              role: roleFor(email),
            }));
          const updated = prev.map((p) => ({
            ...p,
            color: colorFor(p.email) ?? p.color,
            role: roleFor(p.email) ?? p.role,
          }));
          return additions.length === 0 ? updated : [...updated, ...additions];
        });
      } else if (payload.userEmail && payload.status) {
        setParticipants((prev) => {
          if (payload.status === 'online') {
            if (prev.some((p) => p.email === payload.userEmail)) {
              return prev.map((p) =>
                p.email === payload.userEmail
                  ? {
                      ...p,
                      color: colorFor(p.email) ?? p.color,
                      role: roleFor(p.email) ?? p.role,
                    }
                  : p,
              );
            }
            return [
              ...prev,
              {
                email: payload.userEmail,
                color: colorFor(payload.userEmail),
                role: roleFor(payload.userEmail),
              },
            ];
          }
          return prev.filter((p) => p.email !== payload.userEmail);
        });
      }
    },
    onRoleUpdated: (payload) => {
      setParticipants((prev) =>
        prev.map((p) =>
          p.email === payload.userEmail ? { ...p, role: payload.role } : p,
        ),
      );
    },
  });

  const myRole = useMemo(
    () =>
      participants.find((p) => p.email === user?.email)?.role ?? null,
    [participants, user?.email],
  );

  const permissions = useSessionPermissions({
    ownerEmail,
    userEmail: user?.email ?? null,
    role: myRole,
  });

  const { lines, isRunning, run, pushLog } = useCodeExecution({
    token,
    sessionId,
    language,
    command,
    externalResult,
  });

  const handleRoleChange = useCallback(
    async (targetEmail: string, role: Exclude<PermissionLevel, "OWNER">) => {
      if (!token || !sessionId) return;
      try {
        await updateParticipantRole(token, sessionId, targetEmail, role);
        setParticipants((prev) =>
          prev.map((p) => (p.email === targetEmail ? { ...p, role } : p)),
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Could not update role";
        pushLog(message, "fail");
      }
    },
    [token, sessionId, pushLog],
  );

  const handleGetCode = useCallback(() => canvasRef.current?.getCode() ?? "", []);

  const handleRun = useCallback(() => {
    if (!permissions.canExecute) {
      pushLog("You do not have permission to run code", "fail");
      return;
    }
    const code = canvasRef.current?.getCode() ?? "";
    void run(code);
  }, [run, permissions.canExecute, pushLog]);

  const handleSave = useCallback(async () => {
    if (!permissions.canSave) {
      pushLog("You do not have permission to save", "fail");
      return;
    }
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
  }, [language, permissions.canSave, pushLog, sessionId, token]);

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
        canRun={Boolean(token && sessionId) && permissions.canExecute}
        canSaveSnapshot={permissions.canSave}
        onInvite={handleInvite}
        onSave={handleSave}
        onRun={handleRun}
        onOpenRoles={() => setRolesModalOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <EditorSidebar
          terminalOpen={terminalOpen}
          onToggleTerminal={() => setTerminalOpen((v) => !v)}
          aiPanelOpen={aiPanelOpen}
          onToggleAiPanel={() => setAiPanelOpen((v) => !v)}
          onToggleCall={() => setCallModalMode(isInCall ? 'invite' : 'start')}
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
                userColor={user?.email ? colors[user.email] ?? null : null}
                canEdit={permissions.canEdit}
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
        open={callModalMode !== null}
        onClose={() => setCallModalMode(null)}
        onSubmit={(emails) => {
          if (callModalMode === 'invite') {
            void inviteToCall(emails);
          } else {
            void startCall(emails);
          }
          setCallModalMode(null);
        }}
        currentUserId={userEmail || ""}
        sessionId={sessionId}
        token={token}
        mode={callModalMode ?? 'start'}
        excludeEmails={
          callModalMode === 'invite' && currentCall ? currentCall.participants : []
        }
      />
      {isInCall && (
        <VideoCall
          onEndCall={leaveCall}
          onAddToCall={() => setCallModalMode('invite')}
          currentUserLabel={userEmail || ''}
        />
      )}
      {isIncomingCall && (
        <IncomingCallDialog
          onAcceptCall={acceptCall}
          onRejectCall={rejectCall}
        />
      )}

      <SessionRolesModal
        open={rolesModalOpen}
        participants={participants}
        ownerEmail={ownerEmail}
        currentUserEmail={user?.email ?? null}
        canChangeRoles={permissions.canChangeRoles}
        onClose={() => setRolesModalOpen(false)}
        onChangeRole={handleRoleChange}
      />
    </div>
  );
};

export default App;
