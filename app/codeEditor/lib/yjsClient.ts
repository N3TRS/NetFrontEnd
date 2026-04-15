import * as Y from "yjs";
import * as awarenessProtocol from "y-protocols/awareness";

const FRAME_SYNC_FULL = 0x00;
const FRAME_SYNC_UPDATE = 0x01;
const FRAME_AWARENESS = 0x02;

const RECONNECT_DELAY_MS = 1500;

interface CreateYjsClientArgs {
  wsUrl: string;
  sessionId: string;
  token: string;
  ydoc: Y.Doc;
}

export interface YjsClient {
  awareness: awarenessProtocol.Awareness;
  close: () => void;
}

export function createYjsClient({
  wsUrl,
  sessionId,
  token,
  ydoc,
}: CreateYjsClientArgs): YjsClient {
  const awareness = new awarenessProtocol.Awareness(ydoc);
  let ws: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let closed = false;

  const encodeFrame = (type: number, payload: Uint8Array): Uint8Array => {
    const frame = new Uint8Array(payload.length + 1);
    frame[0] = type;
    frame.set(payload, 1);
    return frame;
  };

  const sendFrame = (type: number, payload: Uint8Array) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(encodeFrame(type, payload));
  };

  const onDocUpdate = (update: Uint8Array, origin: unknown) => {
    if (origin === "remote") return;
    sendFrame(FRAME_SYNC_UPDATE, update);
  };
  ydoc.on("update", onDocUpdate);

  const onAwarenessUpdate = (
    {
      added,
      updated,
      removed,
    }: { added: number[]; updated: number[]; removed: number[] },
    origin: unknown,
  ) => {
    if (origin === "remote") return;
    const changed = added.concat(updated, removed);
    if (changed.length === 0) return;
    sendFrame(
      FRAME_AWARENESS,
      awarenessProtocol.encodeAwarenessUpdate(awareness, changed),
    );
  };
  awareness.on("update", onAwarenessUpdate);

  const connect = () => {
    if (closed) return;

    const url = `${wsUrl}/${sessionId}?token=${encodeURIComponent(token)}`;
    ws = new WebSocket(url);
    ws.binaryType = "arraybuffer";

    ws.onopen = () => {
      const states = awareness.getStates();
      if (states.size > 0) {
        sendFrame(
          FRAME_AWARENESS,
          awarenessProtocol.encodeAwarenessUpdate(
            awareness,
            Array.from(states.keys()),
          ),
        );
      }
    };

    ws.onmessage = (event: MessageEvent<ArrayBuffer>) => {
      const data = new Uint8Array(event.data);
      if (data.length === 0) return;

      const type = data[0];
      const payload = data.subarray(1);

      if (type === FRAME_SYNC_FULL || type === FRAME_SYNC_UPDATE) {
        Y.applyUpdate(ydoc, payload, "remote");
        return;
      }

      if (type === FRAME_AWARENESS) {
        awarenessProtocol.applyAwarenessUpdate(awareness, payload, "remote");
      }
    };

    ws.onclose = () => {
      ws = null;
      if (closed) return;
      reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
    };

    ws.onerror = () => {
      ws?.close();
    };
  };

  connect();

  const close = () => {
    closed = true;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    ydoc.off("update", onDocUpdate);
    awareness.off("update", onAwarenessUpdate);
    awarenessProtocol.removeAwarenessStates(
      awareness,
      [ydoc.clientID],
      "local",
    );
    awareness.destroy();
    if (ws) {
      ws.close();
      ws = null;
    }
  };

  return { awareness, close };
}
