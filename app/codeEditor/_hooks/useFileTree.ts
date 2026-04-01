"use client";

import { useEffect, useState, useCallback } from "react";
import type {
  CreateHandler,
  MoveHandler,
  RenameHandler,
  DeleteHandler,
} from "react-arborist";
import { ydoc } from "../_lib/yjs/ydoc";
import {
  toArboristData,
  createNode,
  moveNode,
  renameNode,
  deleteNodes,
  seedFileTree,
  getFileTreeArray,
  type FileNode,
} from "../_lib/fileSystem/index";
import { useEditorStore } from "../_stores/editorStore";

interface UseFileTreeResult {
  treeData: FileNode[];
  onCreate: CreateHandler<FileNode>;
  onMove: MoveHandler<FileNode>;
  onRename: RenameHandler<FileNode>;
  onDelete: DeleteHandler<FileNode>;
}

function findFirstFile(nodes: FileNode[]): FileNode | null {
  for (const node of nodes) {
    if (!node.children) return node;
    const found = findFirstFile(node.children);
    if (found) return found;
  }
  return null;
}

export function useFileTree(isSynced: boolean): UseFileTreeResult {
  const [treeData, setTreeData] = useState<FileNode[]>(() =>
    toArboristData(ydoc),
  );
  const { openFile } = useEditorStore();

  useEffect(() => {
    if (!isSynced) return;

    const seededId = seedFileTree(ydoc);
    const tree = toArboristData(ydoc);
    setTreeData(tree);

    if (seededId) {
      openFile(seededId);
    } else {
      const firstFile = findFirstFile(tree);
      if (firstFile) openFile(firstFile.id);
    }
  }, [isSynced, openFile]);

  useEffect(() => {
    const arr = getFileTreeArray(ydoc);
    const handler = () => setTreeData(toArboristData(ydoc));
    arr.observe(handler);
    return () => arr.unobserve(handler);
  }, []);

  const onCreate: CreateHandler<FileNode> = useCallback(
    ({ parentId, index, type }) => {
      const isFolder = type === "internal";
      const name = isFolder ? "Nueva carpeta" : "NuevoArchivo.java";
      const id = createNode(ydoc, parentId, index, name, isFolder);
      return { id };
    },
    [],
  );

  const onMove: MoveHandler<FileNode> = useCallback(
    ({ dragIds, parentId, index }) => {
      dragIds.forEach((id) => moveNode(ydoc, id, parentId, index));
    },
    [],
  );

  const onRename: RenameHandler<FileNode> = useCallback(({ id, name }) => {
    renameNode(ydoc, id, name);
  }, []);

  const onDelete: DeleteHandler<FileNode> = useCallback(({ ids }) => {
    deleteNodes(ydoc, ids);
  }, []);

  return { treeData, onCreate, onMove, onRename, onDelete };
}
