import * as Y from "yjs";

export const ydoc = new Y.Doc();

// Provider types
type WebrtcProviderType = import("y-webrtc").WebrtcProvider;
type IndexeddbPersistenceType = import("y-indexeddb").IndexeddbPersistence;

let _webrtcProvider: WebrtcProviderType | null = null;
let _persistence: IndexeddbPersistenceType | null = null;
let _initStarted = false;
let _currentSessionId: string | null = null;

/**
 * Initialize providers for a specific session
 * @param sessionId - The session ID to join
 * @param options - Optional configuration
 */
export async function initProviders(
  sessionId?: string,
  options?: {
    signalingServers?: string[];
    token?: string;
  }
): Promise<void> {
  if (typeof window === "undefined") return;

  // If already initialized with same session, skip
  const effectiveSessionId = sessionId || "default-session";
  if (_initStarted && _currentSessionId === effectiveSessionId) return;

  // If switching sessions, cleanup old providers
  if (_initStarted && _currentSessionId !== effectiveSessionId) {
    await cleanupProviders();
  }

  _initStarted = true;
  _currentSessionId = effectiveSessionId;

  const [{ WebrtcProvider }, { IndexeddbPersistence }] = await Promise.all([
    import("y-webrtc"),
    import("y-indexeddb"),
  ]);

  // Configure WebRTC provider
  const webrtcConfig: ConstructorParameters<typeof WebrtcProvider>[2] = {};

  // Use custom signaling servers if provided
  if (options?.signalingServers && options.signalingServers.length > 0) {
    webrtcConfig.signaling = options.signalingServers;
  }

  // Create WebRTC provider for P2P sync
  _webrtcProvider = new WebrtcProvider(effectiveSessionId, ydoc, webrtcConfig);

  // Create IndexedDB persistence for local storage
  _persistence = new IndexeddbPersistence(`omnicode-${effectiveSessionId}`, ydoc);

  console.log(`[Yjs] Initialized providers for session: ${effectiveSessionId}`);
}

/**
 * Cleanup providers (for session switching)
 */
export async function cleanupProviders(): Promise<void> {
  if (_webrtcProvider) {
    _webrtcProvider.destroy();
    _webrtcProvider = null;
  }

  if (_persistence) {
    await _persistence.destroy();
    _persistence = null;
  }

  _initStarted = false;
  _currentSessionId = null;

  console.log("[Yjs] Providers cleaned up");
}

/**
 * Reset the Y.Doc (clears all data)
 * Use with caution - this destroys all content
 */
export function resetDocument(): void {
  ydoc.transact(() => {
    // Clear all shared types
    const fileTree = ydoc.getArray("fileTree");
    fileTree.delete(0, fileTree.length);

    // Note: Y.Text instances are created on-demand and cleared by reference
    // When loading a new session, old texts will be orphaned and eventually GC'd
  });
}

/**
 * Get the WebRTC provider
 */
export const getProvider = () => _webrtcProvider;

/**
 * Get the IndexedDB persistence
 */
export const getPersistence = () => _persistence;

/**
 * Get the awareness instance for cursor sharing
 */
export const getAwareness = () => _webrtcProvider?.awareness ?? null;

/**
 * Get current session ID
 */
export const getCurrentSessionId = () => _currentSessionId;

/**
 * Check if providers are initialized
 */
export const isInitialized = () => _initStarted;
