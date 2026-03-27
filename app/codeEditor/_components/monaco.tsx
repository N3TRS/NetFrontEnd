'use client';

import Editor from '@monaco-editor/react';
import { useMemo, useState } from 'react';

import FileExplorer from './fileExplorer';
import FileTabs from './fileTabs';
import RunButton from './runButton';
import { getLanguage } from '@/lib/languages';
import { handleBeforeMount } from '@/lib/beforeMount';
import { useSocket } from '@/hooks/useSocket';
import { useSession } from '@/hooks/useSession';
import { useNodes } from '@/hooks/useNodes';

const createRandomId = (): string => {
  return (globalThis.crypto?.randomUUID?.() ?? `node-${Date.now()}-${Math.random().toString(16).slice(2)}`).replaceAll('-', '');
};

const getQueryParam = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get(key);
};

const getSessionId = (): string => {
  return getQueryParam('sessionId') ?? 'default-session';
};

const getUserId = (): string => {
  if (typeof window === 'undefined') return 'anonymous-user';

  const fromQuery = getQueryParam('userId');
  if (fromQuery) {
    localStorage.setItem('collab:userId', fromQuery);
    return fromQuery;
  }

  const stored = localStorage.getItem('collab:userId');
  if (stored) return stored;

  const generated = `user-${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem('collab:userId', generated);
  return generated;
};

export default function MonacoEditor() {
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [output, setOutput] = useState('');
  const [projectName] = useState('mi-proyecto');
  const [sessionId] = useState(() => getSessionId());
  const [userId] = useState(() => getUserId());

  const { socket, connected, connectionError } = useSocket();
  const { joined, sessionError } = useSession(socket, sessionId, userId, connected);
  const { nodesById, tree, loading, error, createNode, renameNode, deleteNode, editNode, moveNode, getNodePath } = useNodes(
    socket,
    sessionId,
    userId,
    joined,
  );

  const activeNode = activeFile ? nodesById[activeFile] : undefined;

  const statusText = useMemo(() => {
    if (connectionError) return `Error de conexion: ${connectionError}`;
    if (sessionError) return `Error de sesion: ${sessionError}`;
    if (error) return `Error: ${error}`;
    if (!connected) return 'Conectando al servidor...';
    if (!joined) return 'Uniendo a la sesion...';
    if (loading) return 'Cargando nodos...';
    return `Conectado como ${userId} en ${sessionId}`;
  }, [connectionError, sessionError, error, connected, joined, loading, userId, sessionId]);

  const openFile = (nodeId: string) => {
    const node = nodesById[nodeId];
    if (!node || node.deleted || node.type !== 'file') return;

    setOpenFiles((current) => (current.includes(nodeId) ? current : [...current, nodeId]));
    setActiveFile(nodeId);
  };

  const closeFile = (nodeId: string) => {
    setOpenFiles((current) => {
      const next = current.filter((id) => id !== nodeId);
      if (activeFile === nodeId) {
        setActiveFile(next[next.length - 1] ?? null);
      }
      return next;
    });
  };

  const handleCreateNode = async (input: {
    parentId?: string;
    type: 'file' | 'folder';
    name: string;
  }): Promise<boolean> => {
    const nodeId = createRandomId();
    const ok = await createNode({
      nodeId,
      name: input.name,
      type: input.type,
      parentId: input.parentId,
      content: input.type === 'file' ? '' : undefined,
    });

    if (ok && input.type === 'file') {
      openFile(nodeId);
    }

    return ok;
  };

  const handleDeleteNode = async (nodeId: string): Promise<boolean> => {
    const ok = await deleteNode({ nodeId });
    if (!ok) return false;

    const node = nodesById[nodeId];
    if (!node) return true;

    const descendants = Object.values(nodesById).filter((candidate) => {
      let cursor = candidate;
      while (cursor.parentId) {
        if (cursor.parentId === nodeId) return true;
        cursor = nodesById[cursor.parentId];
        if (!cursor) break;
      }
      return false;
    });

    const idsToClose = new Set([nodeId, ...descendants.map((item) => item.nodeId)]);

    setOpenFiles((current) => {
      const next = current.filter((id) => !idsToClose.has(id));
      if (activeFile && idsToClose.has(activeFile)) {
        setActiveFile(next[next.length - 1] ?? null);
      }
      return next;
    });

    return true;
  };

  const handleRenameNode = async (nodeId: string, newName: string): Promise<boolean> => {
    return renameNode({ nodeId, newName });
  };

  const handleMoveNode = async (nodeId: string, newParentId: string | null): Promise<boolean> => {
    return moveNode({ nodeId, newParentId });
  };

  const updateCode = async (value: string) => {
    if (!activeNode || activeNode.type !== 'file') return;

    const result = await editNode({
      nodeId: activeNode.nodeId,
      baseVersion: activeNode.version,
      newContent: value,
    });

    if (!result.ok && result.conflict?.currentContent) {
      setOutput('Conflicto detectado, se sincronizo el contenido mas reciente.');
    }
  };

  const runCode = async () => {
    if (!activeNode || activeNode.type !== 'file') return;

    const response = await fetch('/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: getNodePath(activeNode.nodeId),
        code: activeNode.content ?? '',
      }),
    });

    const data = await response.json();
    setOutput(data.output || data.error || 'Sin salida');
  };

  return (
    <div className="flex h-screen bg-[var(--color-noir-bg)] bg-grid-white">
      <FileExplorer
        tree={tree}
        nodesById={nodesById}
        activeNodeId={activeFile}
        projectName={projectName}
        getNodePath={getNodePath}
        onOpenFile={openFile}
        onCreateNode={handleCreateNode}
        onDeleteNode={handleDeleteNode}
        onRenameNode={handleRenameNode}
        onMoveNode={handleMoveNode}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        <FileTabs
          openFiles={openFiles}
          activeFile={activeFile}
          nodesById={nodesById}
          getNodePath={getNodePath}
          onSelect={setActiveFile}
          onClose={closeFile}
        />

        <div className="h-8 px-3 flex items-center border-b border-white/10 font-mono text-xs text-white/60">{statusText}</div>

        {activeNode && activeNode.type === 'file' && !activeNode.deleted ? (
          <div className="flex-1">
            <Editor
              height="100%"
              theme="vs-dark"
              path={activeNode.nodeId}
              language={getLanguage(activeNode.name)}
              value={activeNode.content ?? ''}
              beforeMount={handleBeforeMount}
              onChange={(value) => {
                void updateCode(value ?? '');
              }}
              options={{
                fontSize: 14,
                fontFamily: 'ui-monospace, monospace',
                minimap: { enabled: false },
                automaticLayout: true,
              }}
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center font-mono text-sm text-primary opacity-30">
            Selecciona un archivo para editar
          </div>
        )}

        <RunButton onRun={runCode} />

        <div className="h-48 bg-[var(--color-noir-bg)] text-[var(--color-noir-orange-light)] font-mono text-sm border-t border-white/10 p-3 overflow-auto">
          {output || <span className="opacity-30 text-primary font-mono text-sm">{'// output'}</span>}
        </div>
      </div>
    </div>
  );
}
