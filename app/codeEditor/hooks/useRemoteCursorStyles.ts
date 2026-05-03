import { useEffect } from "react";
import type { Awareness } from "y-protocols/awareness";
import { getUserColor } from "../lib/userColor";

interface RemoteUserState {
  email?: string;
  color?: string;
}

export function useRemoteCursorStyles(awareness: Awareness | null): void {
  useEffect(() => {
    if (!awareness) return;
    const styleEl = document.createElement("style");
    styleEl.dataset.omniCursors = "1";
    document.head.appendChild(styleEl);

    const rebuild = () => {
      const rules: string[] = [];
      awareness.getStates().forEach((state, clientID) => {
        if (clientID === awareness.clientID) return;
        const u = (state as { user?: RemoteUserState }).user;
        const color =
          u?.color ?? (u?.email ? getUserColor(u.email) : "#22d3ee");
        rules.push(
          `.yRemoteSelection-${clientID}{background:${color}33;}`,
          `.yRemoteSelectionHead-${clientID}{position:relative;border-left:2px solid ${color};border-top:2px solid ${color};border-bottom:2px solid ${color};height:100%;box-sizing:border-box;}`,
          `.yRemoteSelectionHead-${clientID}::after{position:absolute;content:" ";border:3px solid ${color};border-radius:4px;left:-4px;top:-5px;}`,
        );
      });
      styleEl.textContent = rules.join("\n");
    };

    rebuild();
    awareness.on("change", rebuild);
    return () => {
      awareness.off("change", rebuild);
      styleEl.remove();
    };
  }, [awareness]);
}
