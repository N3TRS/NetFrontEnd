import * as Y from "yjs";
import { nanoid } from "nanoid";

export interface FileNode {
  id: string;
  name: string;
  children?: FileNode[];
}

export interface FileNodeData {
  id: string;
  name: string;
  parentId: string | null;
  isFolder: boolean;
  index: number;
}

export function getFileTreeArray(ydoc: Y.Doc): Y.Array<Y.Map<unknown>> {
  return ydoc.getArray<Y.Map<unknown>>("fileTree");
}

export function getFileText(ydoc: Y.Doc, nodeId: string): Y.Text {
  return ydoc.getText(`file:${nodeId}`);
}

export function findYMap(
  ydoc: Y.Doc,
  id: string,
): { ymap: Y.Map<unknown>; index: number } | undefined {
  const arr = getFileTreeArray(ydoc);
  for (let i = 0; i < arr.length; i++) {
    const ymap = arr.get(i) as Y.Map<unknown>;
    if (ymap.get("id") === id) return { ymap, index: i };
  }
  return undefined;
}

export function toArboristData(ydoc: Y.Doc): FileNode[] {
  const arr = getFileTreeArray(ydoc);
  const nodes: FileNodeData[] = [];

  for (let i = 0; i < arr.length; i++) {
    const ymap = arr.get(i) as Y.Map<unknown>;
    nodes.push({
      id: ymap.get("id") as string,
      name: ymap.get("name") as string,
      parentId: (ymap.get("parentId") as string | null) ?? null,
      isFolder: ymap.get("isFolder") as boolean,
      index: ymap.get("index") as number,
    });
  }

  const byParent = new Map<string | null, FileNodeData[]>();
  for (const node of nodes) {
    const key = node.parentId;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(node);
  }
  for (const children of byParent.values()) {
    children.sort((a, b) => a.index - b.index);
  }

  function buildTree(parentId: string | null): FileNode[] {
    return (byParent.get(parentId) ?? []).map((node) => {
      const result: FileNode = { id: node.id, name: node.name };
      if (node.isFolder) {
        result.children = buildTree(node.id);
      }
      return result;
    });
  }

  return buildTree(null);
}

function computeIndex(siblings: FileNodeData[], position: number): number {
  const sorted = [...siblings].sort((a, b) => a.index - b.index);
  const prev = sorted[position - 1]?.index ?? 0;
  const next = sorted[position]?.index ?? prev + 2;
  return (prev + next) / 2;
}

function getSiblings(ydoc: Y.Doc, parentId: string | null): FileNodeData[] {
  const arr = getFileTreeArray(ydoc);
  const siblings: FileNodeData[] = [];
  for (let i = 0; i < arr.length; i++) {
    const ymap = arr.get(i) as Y.Map<unknown>;
    if ((ymap.get("parentId") ?? null) === parentId) {
      siblings.push({
        id: ymap.get("id") as string,
        name: ymap.get("name") as string,
        parentId: ymap.get("parentId") as string | null,
        isFolder: ymap.get("isFolder") as boolean,
        index: ymap.get("index") as number,
      });
    }
  }
  return siblings;
}

export function createNode(
  ydoc: Y.Doc,
  parentId: string | null,
  position: number,
  name: string,
  isFolder: boolean,
): string {
  const id = nanoid();
  const siblings = getSiblings(ydoc, parentId);
  const index = computeIndex(siblings, position);

  ydoc.transact(() => {
    const ymap = new Y.Map<unknown>();
    ymap.set("id", id);
    ymap.set("name", name);
    ymap.set("parentId", parentId);
    ymap.set("isFolder", isFolder);
    ymap.set("index", index);
    getFileTreeArray(ydoc).push([ymap]);
  });

  return id;
}

export function moveNode(
  ydoc: Y.Doc,
  id: string,
  newParentId: string | null,
  newPosition: number,
): void {
  const found = findYMap(ydoc, id);
  if (!found) return;

  const siblings = getSiblings(ydoc, newParentId).filter((s) => s.id !== id);
  const newIndex = computeIndex(siblings, newPosition);

  ydoc.transact(() => {
    found.ymap.set("parentId", newParentId);
    found.ymap.set("index", newIndex);
  });
}

export function renameNode(ydoc: Y.Doc, id: string, name: string): void {
  const found = findYMap(ydoc, id);
  if (!found) return;
  ydoc.transact(() => {
    found.ymap.set("name", name);
  });
}

export function deleteNodes(ydoc: Y.Doc, ids: string[]): void {
  const arr = getFileTreeArray(ydoc);
  const toDelete = new Set<string>(ids);
  let changed = true;
  while (changed) {
    changed = false;
    for (let i = 0; i < arr.length; i++) {
      const ymap = arr.get(i) as Y.Map<unknown>;
      const parentId = ymap.get("parentId") as string | null;
      const nodeId = ymap.get("id") as string;
      if (
        parentId !== null &&
        toDelete.has(parentId) &&
        !toDelete.has(nodeId)
      ) {
        toDelete.add(nodeId);
        changed = true;
      }
    }
  }

  ydoc.transact(() => {
    for (let i = arr.length - 1; i >= 0; i--) {
      const ymap = arr.get(i) as Y.Map<unknown>;
      if (toDelete.has(ymap.get("id") as string)) {
        arr.delete(i, 1);
      }
    }
  });
}

export function seedFileTree(ydoc: Y.Doc): string | null {
  if (getFileTreeArray(ydoc).length > 0) return null;

  const fileId = createNode(ydoc, null, 0, "Main.java", false);

  const ytext = getFileText(ydoc, fileId);
  if (ytext.length === 0) {
    ytext.insert(
      0,
      `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
    );
  }

  return fileId;
}
