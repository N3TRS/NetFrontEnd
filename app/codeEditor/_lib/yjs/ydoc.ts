import * as Y from "yjs";
import { SessionProvider, createSessionProvider } from "./sessionProvider";

export const ydoc = new Y.Doc();

type IndexeddbPersistenceType = import("y-indexeddb").IndexeddbPersistence;

let _sessionProvider: SessionProvider | null = null;
let _persistence: IndexeddbPersistenceType | null = null;
let _initStarted = false;
let _currentSessionId: string | null = null;

export async function initProviders(
  sessionId?: string,
  options?: {
    token?: string;
    serverUrl?: string;
  },
): Promise<void> {
  if (typeof window === "undefined") return;

  const effectiveSessionId = sessionId || "default-session";
  if (_initStarted && _currentSessionId === effectiveSessionId) return;

  if (_initStarted && _currentSessionId !== effectiveSessionId) {
    await cleanupProviders();
  }

  _initStarted = true;
  _currentSessionId = effectiveSessionId;

  const { IndexeddbPersistence } = await import("y-indexeddb");

  if (options?.token && sessionId) {
    _sessionProvider = createSessionProvider(ydoc, {
      sessionId: effectiveSessionId,
      token: options.token,
      serverUrl: options.serverUrl,
    });
    _sessionProvider.connect();
  }

  _persistence = new IndexeddbPersistence(
    `omnicode-${effectiveSessionId}`,
    ydoc,
  );

  console.log(`[Yjs] Initialized providers for session: ${effectiveSessionId}`);
}

export async function cleanupProviders(): Promise<void> {
  if (_sessionProvider) {
    _sessionProvider.disconnect();
    _sessionProvider = null;
  }

  if (_persistence) {
    await _persistence.destroy();
    _persistence = null;
  }

  _initStarted = false;
  _currentSessionId = null;

  console.log("[Yjs] Providers cleaned up");
}

export function resetDocument(): void {
  ydoc.transact(() => {
    const fileTree = ydoc.getArray("fileTree");
    fileTree.delete(0, fileTree.length);
  });
}

export const getProvider = () => _sessionProvider;

export const getPersistence = () => _persistence;

export const getAwareness = () => null;

export const getCurrentSessionId = () => _currentSessionId;

export const isInitialized = () => _initStarted;
