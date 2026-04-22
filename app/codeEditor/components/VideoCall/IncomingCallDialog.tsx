"use client";

import { useCallStore } from "../_stores/callStore";
import { Phone, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface IncomingCallDialogProps {
  onAcceptCall: (callId: string) => void | Promise<void>;
  onRejectCall: (callId: string) => void | Promise<void>;
}

export function IncomingCallDialog({ onAcceptCall, onRejectCall }: IncomingCallDialogProps) {
  const { isIncomingCall, currentCall } = useCallStore();

  const handleAccept = () => {
    if (currentCall) {
      onAcceptCall(currentCall.id);
    }
  };

  const handleReject = () => {
    if (currentCall) {
      onRejectCall(currentCall.id);
    }
  };

  if (!isIncomingCall || !currentCall) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-background p-6 shadow-xl">
        <div className="mb-6 text-center">
          <h2 className="mb-2 text-xl font-semibold">Llamada entrante</h2>
          <p className="text-sm text-muted-foreground">
            {currentCall.callerId} te está llamando
          </p>
        </div>

        <div className="mb-4 flex items-center justify-center gap-4">
          <Button
            onClick={handleReject}
            variant="outline"
            size="lg"
            className="gap-2 border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-400"
          >
            <PhoneOff className="h-5 w-5" />
            Rechazar
          </Button>

          <Button
            onClick={handleAccept}
            size="lg"
            className="gap-2 bg-green-500 hover:bg-green-600"
          >
            <Phone className="h-5 w-5" />
            Aceptar
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Al aceptar la llamada se activarán tu micrófono y cámara
        </p>
      </div>
    </div>
  );
}
