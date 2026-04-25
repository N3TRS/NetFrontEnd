"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Phone, Loader2 } from "lucide-react";
import { useSessionCallData, SessionParticipant } from "../../hooks/useSessionCallData";

interface CallModalProps {
  open: boolean;
  onClose: () => void;
  onStartCall: (participantEmails: string[]) => void;
  currentUserId: string;
  sessionId: string | null;
  token: string | null;
}

export function CallModal({ 
  open, 
  onClose, 
  onStartCall, 
  currentUserId, 
  sessionId,
  token 
}: CallModalProps) {
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getSessionParticipants } = useSessionCallData();

  useEffect(() => {
    if (!open || !sessionId || !token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedParticipants([]);
      setParticipants([]);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getSessionParticipants(sessionId, token).then((data) => {
      if (cancelled) return;
      if (data) {
        setParticipants(data.participants);
      } else {
        setError("Error al cargar participantes");
      }
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [open, sessionId, token, getSessionParticipants]);

  if (!open) return null;

  const otherParticipants = participants.filter(
    (p: SessionParticipant) => p.email !== currentUserId
  );

  const toggleParticipant = (email: string) => {
    if (selectedParticipants.includes(email)) {
      setSelectedParticipants(selectedParticipants.filter((e) => e !== email));
    } else {
      setSelectedParticipants([...selectedParticipants, email]);
    }
  };

  const selectAll = () => {
    const allEmails = otherParticipants.map((p: SessionParticipant) => p.email);
    setSelectedParticipants(allEmails);
  };

  const deselectAll = () => {
    setSelectedParticipants([]);
  };

  const handleStartCall = () => {
    if (selectedParticipants.length > 0) {
      onStartCall(selectedParticipants);
      setSelectedParticipants([]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-background p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Iniciar llamada</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-white/10"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!sessionId ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>No hay sesión activa</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="py-8 text-center text-red-500">
            <p>{error}</p>
          </div>
        ) : otherParticipants.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <p>No hay otros participantes en la sesión</p>
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Selecciona a quién llamar:
              </p>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-xs text-primary hover:underline"
                >
                  Todos
                </button>
                <button
                  onClick={deselectAll}
                  className="text-xs text-muted-foreground hover:underline"
                >
                  Ninguno
                </button>
              </div>
            </div>

            <div className="mb-4 max-h-60 space-y-2 overflow-y-auto">
              {otherParticipants.map((participant: SessionParticipant) => (
                <button
                  key={participant.email}
                  onClick={() => toggleParticipant(participant.email)}
                  className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left transition-colors ${
                    selectedParticipants.includes(participant.email)
                      ? "border-primary bg-primary/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        participant.isOnline ? "bg-green-500" : "bg-gray-500"
                      }`}
                    />
                    <span className="text-sm">{participant.email}</span>
                  </div>
                  {selectedParticipants.includes(participant.email) && (
                    <span className="text-xs text-primary">✓</span>
                  )}
                </button>
              ))}
            </div>

            <p className="mb-4 text-xs text-muted-foreground">
              {selectedParticipants.length > 0
                ? `${selectedParticipants.length} participante(s) seleccionado(s)`
                : "Selecciona al menos un participante"}
            </p>
          </>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleStartCall}
            disabled={selectedParticipants.length === 0 || !sessionId}
            className="gap-2 bg-green-500 hover:bg-green-600"
          >
            <Phone className="h-4 w-4" />
            Llamar ({selectedParticipants.length})
          </Button>
        </div>
      </div>
    </div>
  );
}