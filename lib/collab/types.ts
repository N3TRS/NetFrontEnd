export type NodeKind = 'file' | 'folder';

export type CollabNode = {
  nodeId: string;
  name: string;
  type: NodeKind;
  parentId: string | null;
  content: string | null;
  version: number;
  deleted: boolean;
};

export type NodesById = Record<string, CollabNode>;

export type CollabAck<T = unknown> =
  | { ok: true; data?: T }
  | { ok: false; error: unknown };

export type NodeStatePayload = {
  sessionId: string;
  nodes: CollabNode[];
};

export type NodeCreatedPayload = {
  sessionId: string;
  nodeId: string;
  name: string;
  type: NodeKind;
  parentId: string | null;
  content: string | null;
};

export type NodeUpdatedPayload = {
  sessionId: string;
  nodeId: string;
  name: string;
  parentId: string | null;
  type: NodeKind;
};

export type NodeDeletedPayload = {
  sessionId: string;
  nodeId: string;
};

export type NodeEditedPayload = {
  sessionId: string;
  nodeId: string;
  content: string;
  version: number;
};

export type NodeMovedPayload = {
  sessionId: string;
  nodeId: string;
  parentId: string | null;
};

export type EditConflictError = {
  code?: string;
  currentVersion?: number;
  currentContent?: string;
};
