import { useEffect } from "react";
import type { editor as MonacoEditorNs } from "monaco-editor";
import type { Awareness } from "y-protocols/awareness";
import * as Y from "yjs";
import { getUserColor } from "../lib/userColor";

interface RemoteUser {
  email?: string;
  name?: string;
  color?: string;
}

interface RemoteSelection {
  anchor: Y.RelativePosition;
  head: Y.RelativePosition;
}

interface Args {
  editor: MonacoEditorNs.IStandaloneCodeEditor | null;
  ydoc: Y.Doc | null;
  ytext: Y.Text | null;
  awareness: Awareness | null;
}

export function useRemoteNameLabels({
  editor,
  ydoc,
  ytext,
  awareness,
}: Args): void {
  useEffect(() => {
    if (!editor || !ydoc || !ytext || !awareness) return;

    const widgets = new Map<number, MonacoEditorNs.IContentWidget>();

    const upsert = (
      clientID: number,
      line: number,
      col: number,
      label: string,
      color: string,
    ) => {
      let w = widgets.get(clientID);
      if (!w) {
        const dom = document.createElement("div");
        dom.className = "omni-cursor-label";
        dom.style.cssText = `background:${color};color:#fff;font:10px/14px var(--font-jetbrains-mono),monospace;padding:0 4px;border-radius:3px;white-space:nowrap;pointer-events:none;transform:translateY(-2px);`;
        dom.textContent = label;
        w = {
          getId: () => `omni-cursor-label-${clientID}`,
          getDomNode: () => dom,
          getPosition: () => ({
            position: { lineNumber: line, column: col },
            preference: [1, 2],
          }),
        };
        editor.addContentWidget(w);
        widgets.set(clientID, w);
      } else {
        const dom = w.getDomNode();
        dom.style.background = color;
        dom.textContent = label;
        w.getPosition = () => ({
          position: { lineNumber: line, column: col },
          preference: [1, 2],
        });
        editor.layoutContentWidget(w);
      }
    };

    const remove = (clientID: number) => {
      const w = widgets.get(clientID);
      if (!w) return;
      editor.removeContentWidget(w);
      widgets.delete(clientID);
    };

    let raf = 0;
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const model = editor.getModel();
        if (!model) return;
        const seen = new Set<number>();
        awareness.getStates().forEach((state, clientID) => {
          if (clientID === awareness.clientID) return;
          const sel = (state as { selection?: RemoteSelection }).selection;
          const u = (state as { user?: RemoteUser }).user;
          if (!sel?.head || !u?.email) return;
          const headAbs = Y.createAbsolutePositionFromRelativePosition(
            sel.head,
            ydoc,
          );
          if (!headAbs || headAbs.type !== ytext) return;
          const pos = model.getPositionAt(headAbs.index);
          const color = u.color ?? getUserColor(u.email);
          upsert(
            clientID,
            pos.lineNumber,
            pos.column,
            u.name || u.email,
            color,
          );
          seen.add(clientID);
        });
        for (const id of Array.from(widgets.keys())) {
          if (!seen.has(id)) remove(id);
        }
      });
    };

    awareness.on("change", schedule);
    schedule();

    return () => {
      awareness.off("change", schedule);
      if (raf) cancelAnimationFrame(raf);
      for (const id of Array.from(widgets.keys())) remove(id);
    };
  }, [editor, ydoc, ytext, awareness]);
}
