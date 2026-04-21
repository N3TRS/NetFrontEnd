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
  PhoneOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWebRTC } from "../../hooks/WebRTCHook/useWebRTC";
import { useAuth } from "@/app/auth/_hooks/useAuth";

export function VideoCall() {
  const { 
    isInCall, 
    localStream, 
    remoteStreams: remoteStreamsList, 
    isMuted, 
    isVideoOff,
    toggleMute,
    toggleVideo 
  } = useCallStore();
  
  const remoteStreams = new Map<string, MediaStream>(remoteStreamsList.map(s => [s.userId, s.stream]));
  
  const { user } = useAuth();
  const userId = user?.email || "guest";
  const { endCall } = useWebRTC(userId);
  
  const [isMinimized, setIsMinimized] = useState(true); // Start minimized
  const [position, setPosition] = useState({ x: 20, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  // Set up local video
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      console.log('Local stream connected to video element');
    }
  }, [localStream, isMinimized]); 

  useEffect(() => {
    console.log('Setting up remote videos, count:', remoteStreams.size);
    
    const timer = setTimeout(() => {
      remoteStreams.forEach((stream, userId) => {
        const videoElements = document.querySelectorAll(`[data-user-id="${userId}"]`);
        console.log(`Found ${videoElements.length} video element(s) for ${userId}`);
        
        videoElements.forEach((element) => {
          const videoEl = element as HTMLVideoElement;
          if (videoEl && videoEl.srcObject !== stream) {
            videoEl.srcObject = stream as MediaStream;
            videoEl.play().catch(e => console.log('Autoplay prevented:', e));
            console.log(`Remote stream connected for ${userId}`);
          }
        });
      });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [remoteStreams, isMinimized]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMinimized && e.target === containerRef.current || 
        (e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  if (!isInCall) return null;

  const remoteParticipants = Array.from(remoteStreams.entries()) as [string, MediaStream][];

  // Minimized view
  if (isMinimized) {
    return (
      <div
        ref={containerRef}
        style={{
          position: "fixed",
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 1000,
        }}
        className={cn(
          "w-72 rounded-lg border border-white/20 bg-black shadow-2xl",
          isDragging && "cursor-move select-none"
        )}
        onMouseDown={handleMouseDown}
      >
        {/* Header */}
        <div className="drag-handle flex items-center justify-between border-b border-white/10 bg-black/80 px-3 py-2 backdrop-blur-sm cursor-move">
          <span className="text-sm font-medium text-white">
            Llamada ({remoteParticipants.length})
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setIsMinimized(false)}
              className="rounded p-1 text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Maximizar"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mini Video Grid */}
        <div className="grid grid-cols-2 gap-1 p-2">
          {/* Local Video */}
          <div className="relative aspect-video overflow-hidden rounded bg-gray-900">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover"
            />
            {isVideoOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="text-2xl">Yo</div>
              </div>
            )}
            <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-[10px] text-white">
              Tú
            </div>
          </div>

          {/* First Remote Video or Empty */}
          {remoteParticipants.length > 0 ? (
            <div className="relative aspect-video overflow-hidden rounded bg-gray-900">
              <video
                data-user-id={remoteParticipants[0][0]}
                autoPlay
                playsInline
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-[10px] text-white">
                P1
              </div>
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded bg-gray-900/50 text-white/50">
              <div className="text-center text-xs">Esperando...</div>
            </div>
          )}
        </div>

        {/* Mini Controls */}
        <div className="flex items-center justify-center gap-2 border-t border-white/10 bg-black/80 px-3 py-2">
          <button
            onClick={toggleMute}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
              isMuted ? "bg-red-500" : "bg-white/20 hover:bg-white/30"
            )}
          >
            {isMuted ? <MicOff className="h-3 w-3 text-white" /> : <Mic className="h-3 w-3 text-white" />}
          </button>

          <button
            onClick={toggleVideo}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
              isVideoOff ? "bg-red-500" : "bg-white/20 hover:bg-white/30"
            )}
          >
            {isVideoOff ? <VideoOff className="h-3 w-3 text-white" /> : <VideoIcon className="h-3 w-3 text-white" />}
          </button>

          <button
            onClick={endCall}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 transition-colors hover:bg-red-600"
          >
            <PhoneOff className="h-3 w-3 text-white" />
          </button>
        </div>
      </div>
    );
  }

  // Maximized view 
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-black/50 px-4 py-3 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-white">Llamada en curso</h2>
        <button
          onClick={() => setIsMinimized(true)}
          className="rounded-md p-2 text-white/70 hover:bg-white/10 hover:text-white"
          aria-label="Minimizar"
        >
          <Minimize2 className="h-5 w-5" />
        </button>
      </div>

      {/* Video Grid */}
      <div className="flex flex-1 items-center justify-center p-4">
        <div
          className={cn(
            "grid h-full w-full gap-4",
            remoteParticipants.length === 0 && "grid-cols-1",
            remoteParticipants.length === 1 && "grid-cols-2",
            remoteParticipants.length === 2 && "grid-cols-2",
            remoteParticipants.length >= 3 && "grid-cols-2 grid-rows-2"
          )}
        >
          {/* Local Video */}
          <div className="relative overflow-hidden rounded-lg bg-gray-900">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2 py-1 text-sm text-white backdrop-blur-sm">
              Tú {isMuted && "Mic Off"} {isVideoOff && "Camera Off"}
            </div>
            {isVideoOff && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-700 text-3xl text-white">
                  Yo
                </div>
              </div>
            )}
          </div>

          {/* Remote Videos */}
          {remoteParticipants.map(([userId, stream], index) => (
            <div key={userId} className="relative overflow-hidden rounded-lg bg-gray-900">
              <video
                data-user-id={userId}
                autoPlay
                playsInline
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2 py-1 text-sm text-white backdrop-blur-sm">
                Participante {index + 1}
              </div>
            </div>
          ))}

          {/* Empty Slots */}
          {remoteParticipants.length === 0 && (
            <div className="flex items-center justify-center rounded-lg bg-gray-900/50 text-white/50">
              <div className="text-center">
                <p>Esperando participantes...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 border-t border-white/10 bg-black/50 px-4 py-4 backdrop-blur-sm">
        <button
          onClick={toggleMute}
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
            isMuted ? "bg-red-500 hover:bg-red-600" : "bg-white/20 hover:bg-white/30"
          )}
        >
          {isMuted ? <MicOff className="h-5 w-5 text-white" /> : <Mic className="h-5 w-5 text-white" />}
        </button>

        <button
          onClick={toggleVideo}
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
            isVideoOff ? "bg-red-500 hover:bg-red-600" : "bg-white/20 hover:bg-white/30"
          )}
        >
          {isVideoOff ? <VideoOff className="h-5 w-5 text-white" /> : <VideoIcon className="h-5 w-5 text-white" />}
        </button>

        <button
          onClick={endCall}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 transition-colors hover:bg-red-600"
        >
          <PhoneOff className="h-5 w-5 text-white" />
        </button>
      </div>
    </div>
  );
}