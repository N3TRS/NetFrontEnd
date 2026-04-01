"use client";

import { useState } from "react";
import { X, Link2, ArrowRight } from "lucide-react";
import type { JoinSessionResponse } from "../_types/collaborative-session";

interface JoinSessionModalProps {
  open: boolean;
  onClose: () => void;
  onSessionJoined: (session: JoinSessionResponse) => void;
  joinSessionByCode: (inviteCode: string) => Promise<JoinSessionResponse | null>;
  loading: boolean;
  error: string | null;
}

export default function JoinSessionModal({
  open,
  onClose,
  onSessionJoined,
  joinSessionByCode,
  loading,
  error,
}: JoinSessionModalProps) {
  const [inviteCode, setInviteCode] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleJoin = async () => {
    const code = inviteCode.trim().toUpperCase();
    
    if (!code) {
      setLocalError("Ingresa un código de invitación");
      return;
    }

    if (code.length !== 6) {
      setLocalError("El código debe tener 6 caracteres");
      return;
    }

    setLocalError(null);
    const session = await joinSessionByCode(code);
    
    if (session) {
      onSessionJoined(session);
      // Navigate to editor
      window.location.href = `/codeEditor?sessionId=${session.sessionId}`;
    }
  };

  const handleClose = () => {
    setInviteCode("");
    setLocalError(null);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !loading) {
      handleJoin();
    }
  };

  if (!open) return null;

  const displayError = localError || error;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl border border-white/10 bg-[#0d1117] p-6 shadow-[0_0_60px_-15px_rgba(90,24,154,0.2)]">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Link2 className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-white text-xl font-semibold">
                Unirse a Sesión
              </h2>
              <p className="text-xs text-muted-foreground">
                Ingresa el código de invitación
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] tracking-widest text-muted-foreground uppercase">
              Código de invitación
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => {
                setInviteCode(e.target.value.toUpperCase());
                setLocalError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder="ABCD1234"
              maxLength={6}
              className="bg-white/5 border border-white/10 text-foreground text-center font-mono text-2xl tracking-[0.3em] rounded-lg px-4 py-4 focus:outline-none focus:border-purple-500 transition-colors uppercase"
              autoFocus
            />
            <p className="text-xs text-muted-foreground text-center">
              Pide el código al creador de la sesión
            </p>
          </div>

          {displayError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
              {displayError}
            </div>
          )}

          <button
            onClick={handleJoin}
            disabled={loading || !inviteCode.trim()}
            className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-semibold rounded-xl px-6 py-3 text-sm transition-all active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(90,24,154,0.3)]"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Uniéndose...</span>
              </>
            ) : (
              <>
                <span>Unirse a la Sesión</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
