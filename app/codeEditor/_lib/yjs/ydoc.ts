import * as Y from "yjs";

export const ydoc = new Y.Doc();

let _provider: import("y-webrtc").WebrtcProvider | null = null;
let _persistence: import("y-indexeddb").IndexeddbPersistence | null = null;
let _initStarted = false;

export async function initProviders(): Promise<void> {
  if (_initStarted || typeof window === "undefined") return;
  _initStarted = true;

  const [{ WebrtcProvider }, { IndexeddbPersistence }] = await Promise.all([
    import("y-webrtc"),
    import("y-indexeddb"),
  ]);

  _provider = new WebrtcProvider("default-session", ydoc);
  _persistence = new IndexeddbPersistence("omnicode-default", ydoc);
}

export const getProvider = () => _provider;
export const getPersistence = () => _persistence;
export const getAwareness = () => _provider?.awareness ?? null;
