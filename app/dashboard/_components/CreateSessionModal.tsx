"use client";

import { useState } from "react";
import { X, Users, Copy, Check } from "lucide-react";
import type { Session } from "../_types/collaborative-session";

interface CreateSessionModalProps {
  open: boolean;
  onClose: () => void;
  onSessionCreated: (session: Session) => void;
  createSession: (name: string, maxParticipants?: number) => Promise<Session | null>;
  loading: boolean;
  error: string | null;
}

export default function CreateSessionModal({
  open,
  onClose,
  onSessionCreated,
  createSession,
  loading,
  error,
}: CreateSessionModalProps) {
  const [name, setName] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(5);
  const [createdSession, setCreatedSession] = useState<Session | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;

    const session = await createSession(name.trim(), maxParticipants);
    if (session) {
      setCreatedSession(session);
      onSessionCreated(session);
    }
  };

  const handleCopyCode = async () => {
    if (createdSession?.inviteCode) {
      await navigator.clipboard.writeText(createdSession.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setName("");
    setMaxParticipants(5);
    setCreatedSession(null);
    setCopied(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl border border-white/10 bg-[#0d1117] p-6 shadow-[0_0_60px_-15px_rgba(255,139,16,0.15)]">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {!createdSession ? (
          // Form to create session
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-white text-xl font-semibold">
                  Nueva Sesión Colaborativa
                </h2>
                <p className="text-xs text-muted-foreground">
                  Crea un espacio para codificar en tiempo real
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] tracking-widest text-muted-foreground uppercase">
                  Nombre de la sesión
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Mi proyecto colaborativo"
                  className="bg-white/5 border border-white/10 text-foreground/80 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary transition-colors"
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] tracking-widest text-muted-foreground uppercase">
                  Máximo de participantes
                </label>
                <select
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(Number(e.target.value))}
                  className="bg-white/5 border border-white/10 text-foreground/80 text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
                >
                  {[2, 3, 4, 5, 6, 8, 10].map((n) => (
                    <option key={n} value={n} className="bg-[#0d1117]">
                      {n} participantes
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              onClick={handleCreate}
              disabled={loading || !name.trim()}
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/85 disabled:opacity-60 text-primary-foreground font-semibold rounded-xl px-6 py-3 text-sm transition-all active:scale-95 cursor-pointer glow-orange"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  <span>Creando...</span>
                </>
              ) : (
                <>
                  <Users className="h-4 w-4" />
                  <span>Crear Sesión</span>
                </>
              )}
            </button>
          </div>
        ) : (
          // Success view with invite code
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <Check className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h2 className="text-white text-xl font-semibold">
                  Sesión Creada
                </h2>
                <p className="text-xs text-muted-foreground">
                  Comparte el código con tu equipo
                </p>
              </div>
            </div>

            <div className="card-noir p-4 flex flex-col gap-3">
              <div>
                <span className="text-[10px] tracking-widest text-muted-foreground uppercase">
                  Nombre
                </span>
                <p className="text-white font-medium">{createdSession.name}</p>
              </div>

              <div>
                <span className="text-[10px] tracking-widest text-muted-foreground uppercase">
                  Código de invitación
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-primary font-mono text-lg tracking-widest text-center">
                    {createdSession.inviteCode}
                  </code>
                  <button
                    onClick={handleCopyCode}
                    className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    title="Copiar código"
                  >
                    {copied ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <Copy className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium rounded-xl px-6 py-3 text-sm transition-all cursor-pointer"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  window.location.href = `/codeEditor?sessionId=${createdSession.sessionId}`;
                }}
                className="flex-1 bg-primary hover:bg-primary/85 text-primary-foreground font-semibold rounded-xl px-6 py-3 text-sm transition-all cursor-pointer glow-orange"
              >
                Abrir Editor
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
