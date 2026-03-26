'use client';

import { useMemo, useState } from 'react';

import { getMovableFolderDestinations, type TreeNode } from '@/lib/collab/tree';
import type { NodesById } from '@/lib/collab/types';

type FileExplorerProps = {
  tree: TreeNode[];
  nodesById: NodesById;
  activeNodeId: string | null;
  projectName: string;
  getNodePath: (nodeId: string) => string;
  onOpenFile: (nodeId: string) => void;
  onCreateNode: (input: {
    parentId?: string;
    type: 'file' | 'folder';
    name: string;
  }) => Promise<boolean>;
  onDeleteNode: (nodeId: string) => Promise<boolean>;
  onRenameNode: (nodeId: string, newName: string) => Promise<boolean>;
  onMoveNode: (nodeId: string, newParentId: string | null) => Promise<boolean>;
};

type ContextMenu = {
  x: number;
  y: number;
  nodeId: string;
};

type AddDraft = {
  type: 'file' | 'folder';
  parentId?: string;
};

export default function FileExplorer({
  tree,
  nodesById,
  activeNodeId,
  projectName,
  getNodePath,
  onOpenFile,
  onCreateNode,
  onDeleteNode,
  onRenameNode,
  onMoveNode,
}: FileExplorerProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [renamingNodeId, setRenamingNodeId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [addDraft, setAddDraft] = useState<AddDraft | null>(null);
  const [addValue, setAddValue] = useState('');
  const [movingNodeId, setMovingNodeId] = useState<string | null>(null);
  const [moveSearch, setMoveSearch] = useState('');

  const movingNode = movingNodeId ? nodesById[movingNodeId] : undefined;

  const moveDestinations = useMemo(() => {
    if (!movingNodeId) return [];

    const options = getMovableFolderDestinations(nodesById, movingNodeId).map((folder) => ({
      parentId: folder.nodeId,
      label: getNodePath(folder.nodeId),
    }));

    return [{ parentId: null, label: 'Root /' }, ...options].filter((item) =>
      item.label.toLowerCase().includes(moveSearch.toLowerCase()),
    );
  }, [movingNodeId, nodesById, getNodePath, moveSearch]);

  const toggleFolder = (nodeId: string) => {
    setExpandedFolders((current) => ({
      ...current,
      [nodeId]: !current[nodeId],
    }));
  };

  const openContextMenu = (event: React.MouseEvent, nodeId: string) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, nodeId });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const startRename = (nodeId: string) => {
    const node = nodesById[nodeId];
    if (!node) return;
    setRenamingNodeId(nodeId);
    setRenameValue(node.name);
    closeContextMenu();
  };

  const confirmRename = async () => {
    if (!renamingNodeId) return;
    const name = renameValue.trim();
    if (!name) {
      setRenamingNodeId(null);
      setRenameValue('');
      return;
    }

    const ok = await onRenameNode(renamingNodeId, name);
    if (ok) {
      setRenamingNodeId(null);
      setRenameValue('');
    }
  };

  const startAdd = (type: 'file' | 'folder', parentId?: string) => {
    setAddDraft({ type, parentId });
    setAddValue('');
    if (parentId) {
      setExpandedFolders((current) => ({ ...current, [parentId]: true }));
    }
    closeContextMenu();
    setCollapsed(false);
  };

  const confirmAdd = async () => {
    if (!addDraft) return;
    const name = addValue.trim();
    if (!name) {
      setAddDraft(null);
      setAddValue('');
      return;
    }

    const ok = await onCreateNode({
      type: addDraft.type,
      name,
      parentId: addDraft.parentId,
    });

    if (ok) {
      setAddDraft(null);
      setAddValue('');
    }
  };

  const handleDelete = async (nodeId: string) => {
    closeContextMenu();
    await onDeleteNode(nodeId);
  };

  const openMovePicker = (nodeId: string) => {
    setMovingNodeId(nodeId);
    setMoveSearch('');
    closeContextMenu();
  };

  const applyMove = async (newParentId: string | null) => {
    if (!movingNodeId) return;

    const node = nodesById[movingNodeId];
    if (!node) return;
    if (node.parentId === newParentId) {
      setMovingNodeId(null);
      setMoveSearch('');
      return;
    }

    const ok = await onMoveNode(movingNodeId, newParentId);
    if (ok) {
      setMovingNodeId(null);
      setMoveSearch('');
    }
  };

  const renderNode = (node: TreeNode, depth: number): React.ReactNode => {
    const isFolder = node.type === 'folder';
    const isExpanded = expandedFolders[node.nodeId] ?? true;
    const isActive = activeNodeId === node.nodeId;

    return (
      <div key={node.nodeId}>
        <div
          className={`font-mono text-sm px-2 py-1 rounded cursor-pointer flex items-center gap-2 ${
            isActive ? 'bg-[var(--color-noir-purple-mid)] text-primary' : 'text-primary hover:bg-[var(--color-noir-purple-mid)]'
          }`}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
          onContextMenu={(event) => openContextMenu(event, node.nodeId)}
          onClick={() => {
            if (isFolder) {
              toggleFolder(node.nodeId);
              return;
            }
            onOpenFile(node.nodeId);
          }}
        >
          {isFolder ? <span className="text-xs text-white/40">{isExpanded ? '▾' : '▸'}</span> : <span className="text-xs text-white/30">·</span>}

          {renamingNodeId === node.nodeId ? (
            <input
              autoFocus
              value={renameValue}
              onChange={(event) => setRenameValue(event.target.value)}
              onBlur={() => {
                void confirmRename();
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  void confirmRename();
                }
                if (event.key === 'Escape') {
                  setRenamingNodeId(null);
                  setRenameValue('');
                }
              }}
              className="bg-transparent border-b border-primary outline-none w-full"
            />
          ) : (
            <span>{node.name}</span>
          )}
        </div>

        {isFolder && isExpanded && node.children.map((child) => renderNode(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="w-64 bg-[var(--color-noir-purple-deep)] text-white border-r border-white/10 p-3 flex flex-col gap-1 relative">
      <div className="font-mono text-xs text-white/40 uppercase tracking-widest px-2 py-1">Explorer</div>

      <div className="flex items-center justify-between group px-1">
        <div
          onClick={() => setCollapsed(!collapsed)}
          className="font-mono text-sm text-primary py-1 flex items-center gap-1 cursor-pointer hover:text-white/80 select-none flex-1"
        >
          <span className={`text-xs transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`}>▾</span>
          <span>{projectName}</span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => startAdd('file')}
            title="Nuevo archivo"
            className="font-mono text-sm text-white/40 hover:text-primary px-1 leading-none"
          >
            +
          </button>
          <button
            onClick={() => startAdd('folder')}
            title="Nueva carpeta"
            className="font-mono text-sm text-white/40 hover:text-primary px-1 leading-none"
          >
            ⊞
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="flex-1 overflow-auto mt-1">
          {tree.length > 0 ? (
            tree.map((node) => renderNode(node, 0))
          ) : (
            <div className="font-mono text-xs text-white/30 px-2 py-3">No hay nodos todavia</div>
          )}

          {addDraft && (
            <div className="px-2 py-1 mt-2 border-t border-white/10">
              <div className="font-mono text-xs text-white/40 mb-1">
                {addDraft.type === 'file' ? 'Nuevo archivo' : 'Nueva carpeta'}
                {addDraft.parentId ? ` en ${getNodePath(addDraft.parentId)}` : ' en raiz'}
              </div>
              <input
                autoFocus
                value={addValue}
                onChange={(event) => setAddValue(event.target.value)}
                placeholder={addDraft.type === 'file' ? 'archivo.java' : 'carpeta'}
                className="bg-transparent border-b border-primary outline-none font-mono text-sm text-primary w-full"
                onBlur={() => {
                  void confirmAdd();
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    void confirmAdd();
                  }
                  if (event.key === 'Escape') {
                    setAddDraft(null);
                    setAddValue('');
                  }
                }}
              />
            </div>
          )}
        </div>
      )}

      {contextMenu && (
        <div
          className="fixed z-50 bg-[var(--color-noir-purple-deep)] border border-white/10 rounded shadow-xl py-1 min-w-40"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onMouseLeave={closeContextMenu}
        >
          {nodesById[contextMenu.nodeId]?.type === 'folder' && (
            <>
              <button
                onClick={() => startAdd('file', contextMenu.nodeId)}
                className="w-full text-left font-mono text-sm text-primary px-3 py-1.5 hover:bg-[var(--color-noir-purple-mid)]"
              >
                Nuevo archivo
              </button>
              <button
                onClick={() => startAdd('folder', contextMenu.nodeId)}
                className="w-full text-left font-mono text-sm text-primary px-3 py-1.5 hover:bg-[var(--color-noir-purple-mid)]"
              >
                Nueva carpeta
              </button>
              <div className="border-t border-white/10 my-1" />
            </>
          )}

          <button
            onClick={() => startRename(contextMenu.nodeId)}
            className="w-full text-left font-mono text-sm text-primary px-3 py-1.5 hover:bg-[var(--color-noir-purple-mid)]"
          >
            Renombrar
          </button>

          <button
            onClick={() => openMovePicker(contextMenu.nodeId)}
            className="w-full text-left font-mono text-sm text-primary px-3 py-1.5 hover:bg-[var(--color-noir-purple-mid)]"
          >
            Mover a...
          </button>

          <div className="border-t border-white/10 my-1" />

          <button
            onClick={() => {
              void handleDelete(contextMenu.nodeId);
            }}
            className="w-full text-left font-mono text-sm px-3 py-1.5 hover:bg-[var(--color-noir-purple-mid)] text-red-400"
          >
            Eliminar
          </button>
        </div>
      )}

      {movingNode && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--color-noir-bg)] border border-white/10 rounded-lg p-4">
            <div className="font-mono text-sm text-primary mb-1">Mover: {movingNode.name}</div>
            <div className="font-mono text-xs text-white/40 mb-3">Selecciona carpeta destino</div>

            <input
              value={moveSearch}
              onChange={(event) => setMoveSearch(event.target.value)}
              placeholder="Buscar carpeta..."
              className="w-full bg-transparent border border-white/15 rounded px-2 py-1.5 text-sm font-mono text-primary outline-none mb-3"
            />

            <div className="max-h-64 overflow-auto border border-white/10 rounded">
              {moveDestinations.length > 0 ? (
                moveDestinations.map((destination) => (
                  <button
                    key={destination.parentId ?? 'root'}
                    onClick={() => {
                      void applyMove(destination.parentId);
                    }}
                    className="w-full text-left px-3 py-2 font-mono text-sm text-primary hover:bg-[var(--color-noir-purple-mid)] border-b border-white/5 last:border-b-0"
                  >
                    {destination.label}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 font-mono text-sm text-white/40">Sin resultados</div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => {
                  setMovingNodeId(null);
                  setMoveSearch('');
                }}
                className="font-mono text-sm px-3 py-1.5 border border-white/15 text-white/70 rounded hover:bg-white/5"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
