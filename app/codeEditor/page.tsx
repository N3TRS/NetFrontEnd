"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { MonacoEditor } from "./_components/Editor/MonacoEditor";
import { useYjsSetup } from "./_hooks/useYjsSetup";
import { useAuth } from "@/app/_hooks/useAuth";
import { useSessionApi } from "./_hooks/useSessionApi";
import { AlertCircle, Loader2, RefreshCw, ArrowLeft } from "lucide-react";

function CodeEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const { token, isLoading: authLoading } = useAuth();
  const { joinSession, getSession, error: apiError } = useSessionApi(token);

  const [sessionName, setSessionName] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  // Initialize Yjs with the session ID
  const serverUrl = process.env.NEXT_PUBLIC_SESSION_API_URL || "http://localhost:3001";
  const { isSynced, isConnected, error: yjsError, reconnect } = useYjsSetup({
    sessionId: sessionId || undefined,
    token: token || undefined,
    serverUrl,
  });

  // Join session on mount
  useEffect(() => {
    const joinAndLoadSession = async () => {
      if (!sessionId || !token || authLoading) return;

      setIsJoining(true);
      setSessionError(null);

      try {
        // Try to join the session
        const joinResult = await joinSession(sessionId);
        
        if (joinResult) {
          setSessionName(joinResult.name);
        } else {
          // If join fails, try to get session details (might already be a participant)
          const sessionDetails = await getSession(sessionId);
          if (sessionDetails) {
            setSessionName(sessionDetails.name);
          } else {
            setSessionError(apiError || "No se pudo acceder a la sesión");
          }
        }
      } catch (err) {
        setSessionError("Error al conectar con la sesión");
      } finally {
        setIsJoining(false);
      }
    };

    joinAndLoadSession();
  }, [sessionId, token, authLoading, joinSession, getSession, apiError]);

  // No session ID provided
  if (!sessionId) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Sesión no especificada
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Necesitas un ID de sesión para acceder al editor colaborativo.
            Crea una nueva sesión o únete con un código de invitación.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/85 text-primary-foreground text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Ir al Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Loading states
  if (authLoading || isJoining) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">
            {authLoading ? "Verificando autenticación..." : "Conectando a la sesión..."}
          </p>
        </div>
      </div>
    );
  }

  // Session error
  if (sessionError) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Error de conexión
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            {sessionError}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/85 text-primary-foreground text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Connection status bar
  const ConnectionStatus = () => (
    <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
      {sessionName && (
        <span className="px-2 py-1 bg-white/5 rounded text-xs text-muted-foreground">
          {sessionName}
        </span>
      )}
      <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded">
        <div
          className={`w-2 h-2 rounded-full ${
            isConnected
              ? isSynced
                ? "bg-green-500"
                : "bg-yellow-500 animate-pulse"
              : "bg-red-500"
          }`}
        />
        <span className="text-xs text-muted-foreground">
          {isConnected
            ? isSynced
              ? "Sincronizado"
              : "Sincronizando..."
            : "Desconectado"}
        </span>
      </div>
      {yjsError && (
        <button
          onClick={reconnect}
          className="p-1 hover:bg-white/10 rounded transition-colors cursor-pointer"
          title="Reconectar"
        >
          <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      )}
    </div>
  );

  return (
    <div className="relative h-full w-full">
      <ConnectionStatus />
      <MonacoEditor />
    </div>
  );
}

export default function CodeEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="h-full flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      }
    >
      <CodeEditorContent />
    </Suspense>
  );
}
