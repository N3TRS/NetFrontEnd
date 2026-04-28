"use client";

import { useEffect, useRef, useState } from "react";
import { useCallStore } from "../_stores/callStore";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Maximize2,
  Minimize2,
  PhoneOff,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoCallProps {
  onEndCall: () => void | Promise<void>;
}

// Genera color de avatar por userId
function avatarColor(userId: string) {
  const colors = [
    "bg-violet-600",
    "bg-blue-600",
    "bg-emerald-600",
    "bg-amber-600",
    "bg-rose-600",
    "bg-cyan-600",
  ];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function initials(label: string) {
  return label.slice(0, 2).toUpperCase();
}

function displayName(email: string): string {
  const local = email.includes('@') ? email.split('@')[0] : email;
  return local
    .replace(/[._]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface ParticipantTileProps {
  label: string;
  userId: string;
  isLocal?: boolean;
  isMuted?: boolean;
  isVideoOff?: boolean;
  isSpeaking?: boolean;
  videoRef?: React.RefObject<HTMLVideoElement | null>;
}

function ParticipantTile({
  label,
  userId,
  isLocal,
  isMuted,
  isVideoOff,
  isSpeaking,
  videoRef,
}: ParticipantTileProps) {
  const color = avatarColor(userId);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-xl bg-[#0d1117]",
        isSpeaking && "ring-2 ring-green-500 ring-offset-2 ring-offset-black"
      )}
    >
      {/* Video o Avatar */}
      {!isVideoOff ? (
        <video
          ref={videoRef}
          data-user-id={!isLocal ? userId : undefined}
          autoPlay
          muted={isLocal}
          playsInline
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full text-xl font-semibold text-white",
              color
            )}
          >
            {initials(label)}
          </div>
          <span className="text-xs text-white/50">{label}</span>
        </div>
      )}

      {/* Badge: nombre */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm">
        {isLocal && isMuted && (
          <MicOff className="h-3 w-3 text-red-400" />
        )}
        {isSpeaking && !isLocal && (
          <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
        )}
        {label}
      </div>

      {/* Badge: muted remoto */}
      {!isLocal && isMuted && (
        <div className="absolute right-2 top-2 rounded-md bg-red-500/20 px-1.5 py-0.5 text-[10px] text-red-300 ring-1 ring-red-500/40">
          Mic off
        </div>
      )}
    </div>
  );
}

export function VideoCall({ onEndCall }: VideoCallProps) {
  const {
    isInCall,
    localStream,
    remoteStreams: remoteStreamsList,
    isMuted,
    isVideoOff,
    toggleMute,
    toggleVideo,
  } = useCallStore();

  const remoteStreams = new Map<string, MediaStream>(
    remoteStreamsList.map((s) => [s.userId, s.stream])
  );

  const [isMinimized, setIsMinimized] = useState(true);
  const [position, setPosition] = useState({ x: 20, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [callDuration, setCallDuration] = useState(0);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const remoteParticipants = Array.from(remoteStreams.entries()) as [string, MediaStream][];
  const totalParticipants = remoteParticipants.length + 1; // +1 = yo

  // Reloj de duración
  useEffect(() => {
    if (!isInCall) return;
    const interval = setInterval(() => setCallDuration((d) => d + 1), 1000);
    return () => clearInterval(interval);
  }, [isInCall]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Local video
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isMinimized]);

  // Remote videos
  useEffect(() => {
    const timer = setTimeout(() => {
      remoteStreams.forEach((stream, userId) => {
        document.querySelectorAll<HTMLVideoElement>(`[data-user-id="${userId}"]`).forEach((el) => {
          if (el.srcObject !== stream) {
            el.srcObject = stream;
            el.play().catch(() => {});
          }
        });
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [remoteStreams, isMinimized]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (
      isMinimized &&
      (e.target === containerRef.current ||
        (e.target as HTMLElement).closest(".drag-handle"))
    ) {
      setIsDragging(true);
      setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  useEffect(() => {
    if (!isDragging) return;
    const onMove = (e: MouseEvent) =>
      setPosition({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
    const onUp = () => setIsDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging, dragOffset]);

  if (!isInCall) return null;

  // Minimized Screen
  if (isMinimized) {
    return (
      <div
        ref={containerRef}
        style={{ position: "fixed", left: `${position.x}px`, top: `${position.y}px`, zIndex: 1000 }}
        className={cn(
          "w-72 overflow-hidden rounded-xl border border-white/10 bg-[#111] shadow-2xl",
          isDragging && "cursor-move select-none"
        )}
        onMouseDown={handleMouseDown}
      >
        {/* Header mini */}
        <div className="drag-handle flex cursor-move items-center justify-between border-b border-white/10 bg-[#1a1a1a] px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium text-white">En llamada</span>
            {/* ← contador dinámico */}
            <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/70">
              <Users className="h-3 w-3" />
              {totalParticipants}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">{formatDuration(callDuration)}</span>
            <button
              onClick={() => setIsMinimized(false)}
              className="rounded p-1 text-white/60 hover:bg-white/10 hover:text-white"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Grid mini: yo + primer remoto */}
        <div className="grid grid-cols-2 gap-1 bg-black p-1">
          <div className="relative aspect-video overflow-hidden rounded-lg bg-[#0d1117]">
            {!isVideoOff ? (
              <video ref={localVideoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white", avatarColor("local"))}>
                  Yo
                </div>
              </div>
            )}
            <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 text-[10px] text-white">
              {isMuted && <MicOff className="inline h-2.5 w-2.5 text-red-400" />} Tú
            </div>
          </div>

          {remoteParticipants.length > 0 ? (
            <div className="relative aspect-video overflow-hidden rounded-lg bg-[#0d1117]">
              <video data-user-id={remoteParticipants[0][0]} autoPlay playsInline className="h-full w-full object-cover" />
              <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 text-[10px] text-white">{displayName(remoteParticipants[0][0])}</div>
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-lg bg-[#0d1117] text-white/30">
              <span className="text-[11px]">Esperando...</span>
            </div>
          )}

          {/* Indicador de más participantes */}
          {remoteParticipants.length > 1 && (
            <div className="col-span-2 flex items-center justify-center gap-1 py-0.5 text-[11px] text-white/40">
              <Users className="h-3 w-3" />
              +{remoteParticipants.length - 1} más en llamada
            </div>
          )}
        </div>

        {/* Controles mini */}
        <div className="flex items-center justify-center gap-2 border-t border-white/10 bg-[#1a1a1a] px-3 py-2">
          <button
            onClick={toggleMute}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
              isMuted ? "bg-red-500 hover:bg-red-600" : "bg-white/15 hover:bg-white/25"
            )}
          >
            {isMuted ? <MicOff className="h-4 w-4 text-white" /> : <Mic className="h-4 w-4 text-white" />}
          </button>
          <button
            onClick={toggleVideo}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
              isVideoOff ? "bg-red-500 hover:bg-red-600" : "bg-white/15 hover:bg-white/25"
            )}
          >
            {isVideoOff ? <VideoOff className="h-4 w-4 text-white" /> : <VideoIcon className="h-4 w-4 text-white" />}
          </button>
          <button
            onClick={onEndCall}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500 transition-colors hover:bg-red-600"
          >
            <PhoneOff className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>
    );
  }

  //MAXIMIZED ScREEN
  // Layout adaptativo según número de participantes
  const gridClass = cn(
    "grid h-full w-full gap-2",
    totalParticipants === 1 && "grid-cols-1",
    totalParticipants === 2 && "grid-cols-2",
    totalParticipants === 3 && "grid-cols-2",
    totalParticipants === 4 && "grid-cols-2 grid-rows-2",
    totalParticipants >= 5 && "grid-cols-3 grid-rows-2"
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#111] px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_6px_#22c55e]" />
          <h2 className="text-base font-semibold text-white">Llamada en curso</h2>
          {/* ← contador dinámico */}
          <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/70">
            <Users className="h-3.5 w-3.5" />
            {totalParticipants} participante{totalParticipants !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm tabular-nums text-white/40">
            {formatDuration(callDuration)}
          </span>
          <button
            onClick={() => setIsMinimized(true)}
            className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <Minimize2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Grid de videos */}
      <div className="flex flex-1 overflow-hidden p-3">
        <div className={gridClass}>
          {/* Yo */}
          <ParticipantTile
            label={`Tú${isMuted ? " · Silenciado" : ""}${isVideoOff ? " · Sin cámara" : ""}`}
            userId="local"
            isLocal
            isMuted={isMuted}
            isVideoOff={isVideoOff}
            videoRef={localVideoRef}
          />

          {/* Remotos */}
          {remoteParticipants.map(([userId]) => (
            <ParticipantTile
              key={userId}
              label={displayName(userId)}
              userId={userId}
            />
          ))}

          {/* Placeholder si estoy solo */}
          {remoteParticipants.length === 0 && (
            <div className="flex items-center justify-center rounded-xl bg-[#0d1117] text-white/30">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-white/20">
                  <Users className="h-5 w-5 text-white/30" />
                </div>
                <p className="text-sm">Esperando participantes...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controles */}
      <div className="flex items-center justify-center gap-4 border-t border-white/10 bg-[#111] px-4 py-4">
        <button
          onClick={toggleMute}
          className={cn(
            "group flex h-12 w-12 flex-col items-center justify-center rounded-full transition-all",
            isMuted ? "bg-red-500 hover:bg-red-600" : "bg-white/15 hover:bg-white/25"
          )}
          title={isMuted ? "Activar micrófono" : "Silenciar"}
        >
          {isMuted ? <MicOff className="h-5 w-5 text-white" /> : <Mic className="h-5 w-5 text-white" />}
        </button>

        <button
          onClick={toggleVideo}
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full transition-all",
            isVideoOff ? "bg-red-500 hover:bg-red-600" : "bg-white/15 hover:bg-white/25"
          )}
          title={isVideoOff ? "Activar cámara" : "Apagar cámara"}
        >
          {isVideoOff ? <VideoOff className="h-5 w-5 text-white" /> : <VideoIcon className="h-5 w-5 text-white" />}
        </button>

        <button
          onClick={onEndCall}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 transition-all hover:bg-red-600 hover:scale-105"
          title="Finalizar llamada"
        >
          <PhoneOff className="h-6 w-6 text-white" />
        </button>
      </div>
    </div>
  );
}