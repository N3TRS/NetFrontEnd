import type { CollabNode, NodesById } from '@/lib/collab/types';

export type TreeNode = CollabNode & {
  children: TreeNode[];
};

export const sortNodes = <T extends { type: 'file' | 'folder'; name: string }>(nodes: T[]): T[] => {
  return [...nodes].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
};

export const buildNodeTree = (nodesById: NodesById): TreeNode[] => {
  const visibleNodes = Object.values(nodesById).filter((node) => !node.deleted);
  const byParent = new Map<string | null, CollabNode[]>();

  for (const node of visibleNodes) {
    const current = byParent.get(node.parentId) ?? [];
    current.push(node);
    byParent.set(node.parentId, current);
  }

  const visit = (parentId: string | null): TreeNode[] => {
    const children = sortNodes(byParent.get(parentId) ?? []);
    return children.map((child) => ({
      ...child,
      children: visit(child.nodeId),
    }));
  };

  return visit(null);
};

export const buildNodePath = (nodesById: NodesById, nodeId: string): string => {
  const names: string[] = [];
  let current: CollabNode | undefined = nodesById[nodeId];

  while (current && !current.deleted) {
    names.unshift(current.name);
    current = current.parentId ? nodesById[current.parentId] : undefined;
  }

  return names.join('/');
};

export const isDescendant = (nodesById: NodesById, nodeId: string, maybeAncestorId: string): boolean => {
  let current = nodesById[nodeId];

  while (current?.parentId) {
    if (current.parentId === maybeAncestorId) return true;
    current = nodesById[current.parentId];
  }

  return false;
};

export const getMovableFolderDestinations = (nodesById: NodesById, nodeId: string): CollabNode[] => {
  const folders = Object.values(nodesById).filter((node) => node.type === 'folder' && !node.deleted);

  return sortNodes(
    folders.filter((folder) => {
      if (folder.nodeId === nodeId) return false;
      if (isDescendant(nodesById, folder.nodeId, nodeId)) return false;
      return true;
    }),
  );
};
