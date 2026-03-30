import type { ProjectStructure } from '@/app/dashboard/_hooks/useProject';

export type CreateNodeFn = (input: {
  nodeId: string;
  name: string;
  type: 'file' | 'folder';
  parentId?: string;
  content?: string;
}) => Promise<boolean>;

export interface SyncProgress {
  total: number;
  synced: number;
  currentFile: string;
  failed: Array<{
    name: string;
    path: string;
    error: string;
  }>;
}

export type ProgressCallback = (progress: SyncProgress) => void;

function generateNodeId(path: string, name: string): string {
  const fullPath = `${path}/${name}`.replace(/^\//, '');
  const hash = fullPath.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  return `node-${Math.abs(hash).toString(36)}-${Date.now().toString(36)}`;
}

function countFiles(structure: ProjectStructure): number {
  let count = 0;
  for (const item of Object.values(structure)) {
    count++;
    if (item.type === 'directory' && item.children) {
      count += countFiles(item.children);
    }
  }
  return count;
}

export async function syncProjectToEditor(
  structure: ProjectStructure,
  createNode: CreateNodeFn,
  onProgress?: ProgressCallback,
  parentId: string | null = null,
  pathPrefix: string = '',
  progress: SyncProgress = { total: 0, synced: 0, currentFile: '', failed: [] }
): Promise<SyncProgress> {
  
  if (progress.total === 0) {
    progress.total = countFiles(structure);
  }
  
  const entries = Object.entries(structure);
  
  for (const [name, item] of entries) {
    const nodeId = generateNodeId(pathPrefix, name);
    const fullPath = `${pathPrefix}/${name}`.replace(/^\//, '');
    progress.currentFile = fullPath;
    
    try {
      const success = await createNode({
        nodeId,
        name,
        type: item.type === 'directory' ? 'folder' : 'file',
        parentId: parentId ?? undefined,
        content: item.type === 'file' ? (item.content || '') : undefined
      });
      
      if (!success) {
        throw new Error(`Failed to create node`);
      }
      
      progress.synced++;
      
      if (onProgress) {
        onProgress({ ...progress });
      }
      
      if (item.type === 'directory' && item.children) {
        await syncProjectToEditor(
          item.children,
          createNode,
          onProgress,
          nodeId,
          `${pathPrefix}/${name}`,
          progress
        );
      }
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error syncing ${name}:`, errorMsg);
      
      progress.failed.push({
        name,
        path: fullPath,
        error: errorMsg
      });
      
      progress.synced++;
      if (onProgress) {
        onProgress({ ...progress });
      }
    }
  }
  
  return progress;
}

export async function retryFailedFiles(
  failedFiles: Array<{ name: string; path: string; error: string }>,
  structure: ProjectStructure,
  createNode: CreateNodeFn,
  onProgress?: ProgressCallback
): Promise<SyncProgress> {
  const progress: SyncProgress = {
    total: failedFiles.length,
    synced: 0,
    currentFile: '',
    failed: []
  };
  
  for (const failedFile of failedFiles) {
    progress.currentFile = failedFile.path;
    
    const pathParts = failedFile.path.split('/');
    const fileName = pathParts[pathParts.length - 1];
    
    const nodeId = generateNodeId(
      pathParts.slice(0, -1).join('/'), 
      fileName
    );
    
    try {
      const item = findInStructure(structure, failedFile.path);
      if (!item) {
        throw new Error('File not found in structure');
      }
      
      const success = await createNode({
        nodeId,
        name: fileName,
        type: item.type === 'directory' ? 'folder' : 'file',
        parentId: undefined,
        content: item.type === 'file' ? (item.content || '') : undefined
      });
      
      if (!success) {
        throw new Error('Failed to create node');
      }
      
      progress.synced++;
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      progress.failed.push({
        name: failedFile.name,
        path: failedFile.path,
        error: errorMsg
      });
      progress.synced++;
    }
    
    if (onProgress) {
      onProgress({ ...progress });
    }
  }
  
  return progress;
}

function findInStructure(
  structure: ProjectStructure, 
  path: string
): { type: 'file' | 'directory'; content?: string; children?: ProjectStructure } | null {
  const parts = path.split('/');
  let current: any = structure;
  
  for (const part of parts) {
    if (!current[part]) return null;
    current = current[part];
  }
  
  return current;
}

export function loadProjectStructure(
  containerId: string
): ProjectStructure | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const json = sessionStorage.getItem(`project-structure-${containerId}`);
    return json ? JSON.parse(json) : null;
  } catch (error) {
    console.error('Failed to load project structure:', error);
    return null;
  }
}

export function clearProjectStructure(containerId: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    sessionStorage.removeItem(`project-structure-${containerId}`);
  } catch (error) {
    console.error('Failed to clear project structure:', error);
  }
}
