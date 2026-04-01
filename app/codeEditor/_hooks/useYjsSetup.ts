"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getProvider,
  getPersistence,
  initProviders,
  cleanupProviders,
} from "../_lib/yjs/ydoc";

interface UseYjsSetupOptions {
  sessionId?: string;
  token?: string;
  serverUrl?: string;
}

interface UseYjsSetupResult {
  isSynced: boolean;
  isConnected: boolean;
  error: string | null;
  reconnect: () => Promise<void>;
}

export function useYjsSetup(options?: UseYjsSetupOptions): UseYjsSetupResult {
  const [isSynced, setIsSynced] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { sessionId, token, serverUrl } = options || {};

  const initializeProviders = useCallback(async () => {
    try {
      setError(null);

      await initProviders(sessionId, { token, serverUrl });

      const provider = getProvider();
      if (provider) {
        if (provider.synced) {
          setIsConnected(true);
          setIsSynced(true);
        } else {
          if (provider.connected) setIsConnected(true);
          provider.on("onConnected", () => setIsConnected(true));
          provider.on("onSynced", () => setIsSynced(true));
          provider.on("onError", (e) => setError(e.message));
        }
      } else {
        setIsConnected(true);
        const persistence = getPersistence();
        if (persistence) {
          await persistence.whenSynced;
        }
        setIsSynced(true);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to initialize Yjs";
      setError(errorMessage);
      console.error("[useYjsSetup] Error:", errorMessage);
    }
  }, [sessionId, token, serverUrl]);

  const reconnect = useCallback(async () => {
    await cleanupProviders();
    setIsSynced(false);
    setIsConnected(false);
    await initializeProviders();
  }, [initializeProviders]);

  useEffect(() => {
    initializeProviders();

    return () => {
      if (sessionId) {
        cleanupProviders();
      }
    };
  }, [initializeProviders, sessionId]);

  return { isSynced, isConnected, error, reconnect };
}
