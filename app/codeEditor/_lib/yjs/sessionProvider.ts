import { io, Socket } from "socket.io-client";
import * as Y from "yjs";

/**
 * Configuration for the session provider
 */
export interface SessionProviderConfig {
  sessionId: string;
  token: string;
  serverUrl?: string;
}

/**
 * Events emitted by the SessionProvider
 */
export interface SessionProviderEvents {
  onConnected: () => void;
  onDisconnected: () => void;
  onError: (error: { message: string }) => void;
  onPeerJoined: (data: { peerId: string; user: { email: string } }) => void;
  onPeerLeft: (data: { peerId: string }) => void;
  onPeersInSession: (data: { peers: string[] }) => void;
  onSynced: () => void;
}

/**
 * SessionProvider - Connects to the NetSession backend for collaborative editing
 * Handles:
 * - WebSocket connection with authentication
 * - Yjs document synchronization
 * - Awareness state for cursors
 * - WebRTC signaling (peer discovery)
 */
export class SessionProvider {
  private socket: Socket | null = null;
  private doc: Y.Doc;
  private sessionId: string;
  private token: string;
  private serverUrl: string;
  private isConnected = false;
  private isSynced = false;
  private eventHandlers: Partial<SessionProviderEvents> = {};
  private updateHandler: ((update: Uint8Array, origin: any) => void) | null = null;

  constructor(doc: Y.Doc, config: SessionProviderConfig) {
    this.doc = doc;
    this.sessionId = config.sessionId;
    this.token = config.token;
    this.serverUrl = config.serverUrl || "http://localhost:3001";
  }

  /**
   * Connect to the session
   */
  connect(): void {
    if (this.socket) {
      return;
    }

    this.socket = io(`${this.serverUrl}/signaling`, {
      auth: { token: this.token },
      query: { sessionId: this.sessionId },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupSocketListeners();
    this.setupDocumentListener();
  }

  /**
   * Disconnect from the session
   */
  disconnect(): void {
    if (this.updateHandler) {
      this.doc.off("update", this.updateHandler);
      this.updateHandler = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.isConnected = false;
    this.isSynced = false;
  }

  /**
   * Register event handlers
   */
  on<K extends keyof SessionProviderEvents>(
    event: K,
    handler: SessionProviderEvents[K]
  ): void {
    this.eventHandlers[event] = handler;
  }

  /**
   * Check if connected
   */
  get connected(): boolean {
    return this.isConnected;
  }

  /**
   * Check if document is synced
   */
  get synced(): boolean {
    return this.isSynced;
  }

  /**
   * Send awareness update
   */
  sendAwarenessUpdate(states: Record<string, unknown>): void {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit("awareness:update", { states });
  }

  /**
   * Request awareness states from all peers
   */
  requestAwareness(): void {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit("awareness:request");
  }

  /**
   * Get the socket for WebRTC signaling
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Setup socket event listeners
   */
  private setupSocketListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on("connect", () => {
      this.isConnected = true;
      this.eventHandlers.onConnected?.();

      // Request initial state from server
      this.requestState();
    });

    this.socket.on("disconnect", () => {
      this.isConnected = false;
      this.isSynced = false;
      this.eventHandlers.onDisconnected?.();
    });

    this.socket.on("error", (error: { message: string }) => {
      this.eventHandlers.onError?.(error);
    });

    // Peer events
    this.socket.on("peer-joined", (data: { peerId: string; user: { email: string } }) => {
      this.eventHandlers.onPeerJoined?.(data);
    });

    this.socket.on("peer-left", (data: { peerId: string }) => {
      this.eventHandlers.onPeerLeft?.(data);
    });

    this.socket.on("peers-in-session", (data: { peers: string[] }) => {
      this.eventHandlers.onPeersInSession?.(data);
    });

    // Yjs sync events
    this.socket.on("yjs:state", (data: { state: number[] }) => {
      const state = new Uint8Array(data.state);
      Y.applyUpdate(this.doc, state, "remote");
      this.isSynced = true;
      this.eventHandlers.onSynced?.();
    });

    this.socket.on("yjs:update", (data: { update: number[]; fromPeerId: string }) => {
      const update = new Uint8Array(data.update);
      Y.applyUpdate(this.doc, update, "remote");
    });

    // Awareness events
    this.socket.on("awareness:update", (data: { clientId: string; user: { email: string }; states: Record<string, unknown> }) => {
      // Handle awareness update from other peers
      // This can be used to update cursor positions, user presence, etc.
      // Emit a custom event or update a store
    });

    this.socket.on("awareness:all", (data: { awareness: Record<string, unknown> }) => {
      // Handle full awareness state
      // This is received when requesting all awareness states
    });
  }

  /**
   * Setup document update listener
   */
  private setupDocumentListener(): void {
    this.updateHandler = (update: Uint8Array, origin: any) => {
      // Only send updates that originated locally
      if (origin !== "remote" && this.socket && this.isConnected) {
        this.socket.emit("yjs:sync", {
          update: Array.from(update),
        });
      }
    };

    this.doc.on("update", this.updateHandler);
  }

  /**
   * Request initial state from server
   */
  private requestState(): void {
    if (!this.socket) return;

    // Get our current state vector for efficient diff sync
    const stateVector = Y.encodeStateVector(this.doc);

    this.socket.emit("yjs:state-request", {
      stateVector: Array.from(stateVector),
    });
  }
}

/**
 * Helper function to create a session provider
 */
export function createSessionProvider(
  doc: Y.Doc,
  config: SessionProviderConfig
): SessionProvider {
  return new SessionProvider(doc, config);
}
