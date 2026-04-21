"use client";

import { X } from "lucide-react";

interface JoinSessionModalProps {
  open: boolean;
  inviteCode: string;
  isJoining: boolean;
  error: string | null;
  canJoin: boolean;
  onChangeInviteCode: (value: string) => void;
  onClose: () => void;
  onJoin: () => void;
}

export default function JoinSessionModal({
  open,
  inviteCode,
  isJoining,
  error,
  canJoin,
  onChangeInviteCode,
  onClose,
  onJoin,
}: JoinSessionModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1117] p-6 shadow-[0_0_60px_-15px_rgba(141,82,255,0.35)] mx-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Unirse a sesion</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          Escribe el codigo de invitacion para ingresar.
        </p>

        <label className="mt-5 block text-sm font-medium text-white">Codigo de invitacion</label>
        <input
          value={inviteCode}
          onChange={(event) => onChangeInviteCode(event.target.value.toUpperCase())}
          placeholder="A1B2C3D4"
          maxLength={8}
          className="mt-2 w-full rounded-md border border-primary/30 bg-black/30 px-3 py-2 uppercase text-white outline-none ring-purple-400/40 focus:ring"
        />

        {error ? (
          <p className="mt-3 text-xs text-amber-300 bg-amber-500/10 border border-amber-400/20 rounded-md px-3 py-2">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-white/15 px-4 py-2 text-sm text-white hover:bg-white/5"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onJoin}
            disabled={!canJoin || isJoining}
            className="rounded-md bg-linear-to-r from-primary to-purple-500 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isJoining ? "Conectando..." : "Unirse"}
          </button>
        </div>
      </div>
    </div>
  );
}
