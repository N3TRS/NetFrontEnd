'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Socket } from 'socket.io-client';

import type {
  CollabAck,
  CollabNode,
  EditConflictError,
  NodeCreatedPayload,
  NodeDeletedPayload,
  NodeEditedPayload,
  NodeMovedPayload,
  NodesById,
  NodeStatePayload,
  NodeUpdatedPayload,
} from '@/lib/collab/types';
import { buildNodePath, buildNodeTree, type TreeNode } from '@/lib/collab/tree';

type CreateNodeInput = {
  nodeId: string;
  name: string;
  type: 'file' | 'folder';
  parentId?: string;
  content?: string;
};

type RenameNodeInput = {
  nodeId: string;
  newName: string;
};

type DeleteNodeInput = {
  nodeId: string;
};

type EditNodeInput = {
  nodeId: string;
  baseVersion: number;
  newContent: string;
};

type MoveNodeInput = {
  nodeId: string;
  newParentId: string | null;
};

const toMap = (nodes: CollabNode[]): NodesById => {
  return nodes.reduce<NodesById>((acc, node) => {
    acc[node.nodeId] = node;
    return acc;
  }, {});
};

const parseErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return fallback;
};

export const useNodes = (
  socket: Socket,
  sessionId: string,
  userId: string,
  joined: boolean,
): {
  nodesById: NodesById;
  tree: TreeNode[];
  loading: boolean;
  error: string | null;
  createNode: (input: CreateNodeInput) => Promise<boolean>;
  renameNode: (input: RenameNodeInput) => Promise<boolean>;
  deleteNode: (input: DeleteNodeInput) => Promise<boolean>;
  editNode: (input: EditNodeInput) => Promise<{ ok: true; version: number } | { ok: false; conflict?: EditConflictError }>;
  moveNode: (input: MoveNodeInput) => Promise<boolean>;
  getNodePath: (nodeId: string) => string;
} => {
  const [nodesById, setNodesById] = useState<NodesById>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!joined) return;

    let cancelled = false;

    socket.emit('node.state', { sessionId }, (ack: CollabAck<NodeStatePayload>) => {
      if (cancelled) return;

      if (ack.ok && ack.data) {
        setNodesById(toMap(ack.data.nodes));
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(false);
      setError(parseErrorMessage(ack.ok ? null : ack.error, 'No se pudo cargar el estado de nodos'));
    });

    return () => {
      cancelled = true;
    };
  }, [socket, sessionId, joined]);

  useEffect(() => {
    if (!joined) return;

    const onCreated = (payload: NodeCreatedPayload) => {
      if (payload.sessionId !== sessionId) return;
      setNodesById((current) => ({
        ...current,
        [payload.nodeId]: {
          nodeId: payload.nodeId,
          name: payload.name,
          type: payload.type,
          parentId: payload.parentId,
          content: payload.content,
          version: 0,
          deleted: false,
        },
      }));
    };

    const onUpdated = (payload: NodeUpdatedPayload) => {
      if (payload.sessionId !== sessionId) return;
      setNodesById((current) => {
        const node = current[payload.nodeId];
        if (!node) return current;

        return {
          ...current,
          [payload.nodeId]: {
            ...node,
            name: payload.name,
            parentId: payload.parentId,
            type: payload.type,
          },
        };
      });
    };

    const onDeleted = (payload: NodeDeletedPayload) => {
      if (payload.sessionId !== sessionId) return;
      setNodesById((current) => {
        const node = current[payload.nodeId];
        if (!node) return current;

        return {
          ...current,
          [payload.nodeId]: {
            ...node,
            deleted: true,
          },
        };
      });
    };

    const onEdited = (payload: NodeEditedPayload) => {
      if (payload.sessionId !== sessionId) return;
      setNodesById((current) => {
        const node = current[payload.nodeId];
        if (!node) return current;

        return {
          ...current,
          [payload.nodeId]: {
            ...node,
            content: payload.content,
            version: payload.version,
          },
        };
      });
    };

    const onMoved = (payload: NodeMovedPayload) => {
      if (payload.sessionId !== sessionId) return;
      setNodesById((current) => {
        const node = current[payload.nodeId];
        if (!node) return current;

        return {
          ...current,
          [payload.nodeId]: {
            ...node,
            parentId: payload.parentId,
          },
        };
      });
    };

    socket.on('node.created', onCreated);
    socket.on('node.updated', onUpdated);
    socket.on('node.deleted', onDeleted);
    socket.on('node.edited', onEdited);
    socket.on('node.moved', onMoved);

    return () => {
      socket.off('node.created', onCreated);
      socket.off('node.updated', onUpdated);
      socket.off('node.deleted', onDeleted);
      socket.off('node.edited', onEdited);
      socket.off('node.moved', onMoved);
    };
  }, [socket, sessionId, joined]);

  const createNode = useCallback(
    async (input: CreateNodeInput): Promise<boolean> => {
      return new Promise((resolve) => {
        socket.emit(
          'node.create',
          {
            sessionId,
            userId,
            nodeId: input.nodeId,
            name: input.name,
            type: input.type,
            parentId: input.parentId,
            content: input.content,
          },
          (ack: CollabAck) => {
            if (!ack.ok) {
              setError(parseErrorMessage(ack.error, 'No se pudo crear el nodo'));
              resolve(false);
              return;
            }

            setError(null);
            resolve(true);
          },
        );
      });
    },
    [socket, sessionId, userId],
  );

  const renameNode = useCallback(
    async (input: RenameNodeInput): Promise<boolean> => {
      return new Promise((resolve) => {
        socket.emit(
          'node.rename',
          {
            sessionId,
            userId,
            nodeId: input.nodeId,
            newName: input.newName,
          },
          (ack: CollabAck) => {
            if (!ack.ok) {
              setError(parseErrorMessage(ack.error, 'No se pudo renombrar el nodo'));
              resolve(false);
              return;
            }

            setError(null);
            resolve(true);
          },
        );
      });
    },
    [socket, sessionId, userId],
  );

  const deleteNode = useCallback(
    async (input: DeleteNodeInput): Promise<boolean> => {
      return new Promise((resolve) => {
        socket.emit(
          'node.delete',
          {
            sessionId,
            userId,
            nodeId: input.nodeId,
          },
          (ack: CollabAck) => {
            if (!ack.ok) {
              setError(parseErrorMessage(ack.error, 'No se pudo eliminar el nodo'));
              resolve(false);
              return;
            }

            setError(null);
            resolve(true);
          },
        );
      });
    },
    [socket, sessionId, userId],
  );

  const editNode = useCallback(
    async (input: EditNodeInput): Promise<{ ok: true; version: number } | { ok: false; conflict?: EditConflictError }> => {
      return new Promise((resolve) => {
        socket.emit(
          'node.edit',
          {
            sessionId,
            userId,
            nodeId: input.nodeId,
            baseVersion: input.baseVersion,
            newContent: input.newContent,
          },
          (ack: CollabAck<{ version: number }>) => {
            if (!ack.ok) {
              const conflict = (ack.error ?? {}) as EditConflictError;

              if (typeof conflict.currentVersion === 'number') {
                setNodesById((current) => {
                  const node = current[input.nodeId];
                  if (!node) return current;

                  return {
                    ...current,
                    [input.nodeId]: {
                      ...node,
                      version: conflict.currentVersion ?? node.version,
                      content:
                        typeof conflict.currentContent === 'string'
                          ? conflict.currentContent
                          : node.content,
                    },
                  };
                });
              }

              setError(parseErrorMessage(ack.error, 'No se pudo editar el nodo'));
              resolve({ ok: false, conflict });
              return;
            }

            const nextVersion = ack.data?.version ?? input.baseVersion + 1;
            setNodesById((current) => {
              const node = current[input.nodeId];
              if (!node) return current;

              return {
                ...current,
                [input.nodeId]: {
                  ...node,
                  content: input.newContent,
                  version: nextVersion,
                },
              };
            });

            setError(null);
            resolve({ ok: true, version: nextVersion });
          },
        );
      });
    },
    [socket, sessionId, userId],
  );

  const moveNode = useCallback(
    async (input: MoveNodeInput): Promise<boolean> => {
      return new Promise((resolve) => {
        socket.emit(
          'node.move',
          {
            sessionId,
            userId,
            nodeId: input.nodeId,
            newParentId: input.newParentId,
          },
          (ack: CollabAck) => {
            if (!ack.ok) {
              setError(parseErrorMessage(ack.error, 'No se pudo mover el nodo'));
              resolve(false);
              return;
            }

            setError(null);
            resolve(true);
          },
        );
      });
    },
    [socket, sessionId, userId],
  );

  const getNodePath = useCallback(
    (nodeId: string) => {
      return buildNodePath(nodesById, nodeId);
    },
    [nodesById],
  );

  const tree = useMemo(() => buildNodeTree(nodesById), [nodesById]);

  const visibleNodesById = useMemo(() => {
    if (!joined) return {};
    return nodesById;
  }, [joined, nodesById]);

  return {
    nodesById: visibleNodesById,
    tree: joined ? tree : [],
    loading: joined ? loading : true,
    error: joined ? error : null,
    createNode,
    renameNode,
    deleteNode,
    editNode,
    moveNode,
    getNodePath,
  };
};
