"use client";

import { useEffect, useState, useCallback } from "react";
import { getPersistence, initProviders, cleanupProviders, isInitialized } from "../_lib/yjs/ydoc";

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

/**
 * Hook for setting up Yjs providers
 * Supports both default P2P mode and server-backed sessions
 */
export function useYjsSetup(options?: UseYjsSetupOptions): UseYjsSetupResult {
  const [isSynced, setIsSynced] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { sessionId, token, serverUrl } = options || {};

  const initializeProviders = useCallback(async () => {
    try {
      setError(null);

      // Build signaling servers array if server URL is provided
      const signalingServers = serverUrl
        ? [`${serverUrl.replace(/^http/, "ws")}/signaling${token ? `?token=${token}` : ""}`]
        : undefined;

      // Initialize providers
      await initProviders(sessionId, { signalingServers, token });

      setIsConnected(true);

      // Wait for local persistence to sync
      const persistence = getPersistence();
      if (persistence) {
        await persistence.whenSynced;
      }

      setIsSynced(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to initialize Yjs";
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
      // Cleanup on unmount if session-specific
      if (sessionId) {
        cleanupProviders();
      }
    };
  }, [initializeProviders, sessionId]);

  return { isSynced, isConnected, error, reconnect };
}
