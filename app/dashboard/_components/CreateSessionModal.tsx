"use client";

import { X } from "lucide-react";
import { LANGUAGE_VERSIONS, LANGUAGE_COLORS } from "@/app/codeEditor/Utils/constants";

const LANGUAGE_OPTIONS = Object.keys(LANGUAGE_VERSIONS) as Array<
  keyof typeof LANGUAGE_VERSIONS
>;

interface CreateSessionModalProps {
  open: boolean;
  sessionName: string;
  language: string;
  isCreating: boolean;
  error: string | null;
  canCreate: boolean;
  onChangeSessionName: (value: string) => void;
  onChangeLanguage: (value: string) => void;
  onClose: () => void;
  onCreate: () => void;
}

export default function CreateSessionModal({
  open,
  sessionName,
  language,
  isCreating,
  error,
  canCreate,
  onChangeSessionName,
  onChangeLanguage,
  onClose,
  onCreate,
}: CreateSessionModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1117] p-6 shadow-[0_0_60px_-15px_rgba(255,139,16,0.25)] mx-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Crear sesion</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          Ingresa un nombre para la sesion colaborativa.
        </p>

        <label className="mt-5 block text-sm font-medium text-white">Nombre de la sesion</label>
        <input
          value={sessionName}
          onChange={(event) => onChangeSessionName(event.target.value)}
          placeholder="Backend pairing"
          className="mt-2 w-full rounded-md border border-purple-400/30 bg-black/30 px-3 py-2 text-white outline-none ring-primary/40 focus:ring"
        />

        <label className="mt-4 block text-sm font-medium text-white">Lenguaje de programacion</label>
        <div className="mt-2 flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: LANGUAGE_COLORS[language as keyof typeof LANGUAGE_COLORS] }}
          />
          <select
            value={language}
            onChange={(event) => onChangeLanguage(event.target.value)}
            className="w-full rounded-md border border-purple-400/30 bg-black/30 px-3 py-2 text-white outline-none ring-primary/40 focus:ring"
          >
            {LANGUAGE_OPTIONS.map((lang) => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)} ({LANGUAGE_VERSIONS[lang]})
              </option>
            ))}
          </select>
        </div>

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
            onClick={onCreate}
            disabled={!canCreate || isCreating}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isCreating ? "Creando..." : "Crear y entrar"}
          </button>
        </div>
      </div>
    </div>
  );
}
