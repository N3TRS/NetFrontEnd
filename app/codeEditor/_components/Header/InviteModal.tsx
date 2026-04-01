"use client";

import { useState } from "react";
import { X, Users, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "../../_stores/editorStore";

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
}

export function InviteModal({ open, onClose }: InviteModalProps) {
  const { inviteCode } = useEditorStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!inviteCode) return;
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl border border-white/10 bg-[#0d1117] p-6 shadow-[0_0_60px_-15px_rgba(255,139,16,0.15)]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors cursor-pointer"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-white text-xl font-semibold">
                Invitar al Equipo
              </h2>
              <p className="text-xs text-muted-foreground">
                Comparte el código con tus colaboradores
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3">
            <span className="text-[10px] tracking-widest text-muted-foreground uppercase">
              Código de invitación
            </span>
            {inviteCode ? (
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-primary font-mono text-lg tracking-widest text-center">
                  {inviteCode}
                </code>
                <button
                  onClick={handleCopy}
                  className="p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  title="Copiar código"
                  aria-label="Copiar código de invitación"
                >
                  {copied ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <Copy className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-2 text-center">
                Cargando sesión...
              </p>
            )}
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
