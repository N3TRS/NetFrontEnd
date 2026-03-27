import type { NodesById } from '@/lib/collab/types';

type FileTabsProps = {
  openFiles: string[];
  activeFile: string | null;
  nodesById: NodesById;
  getNodePath: (nodeId: string) => string;
  onSelect: (nodeId: string) => void;
  onClose: (nodeId: string) => void;
};

export default function FileTabs({
  openFiles,
  activeFile,
  nodesById,
  getNodePath,
  onSelect,
  onClose,
}: FileTabsProps) {
  return (
    <div className="flex bg-[var(--color-noir-bg)] border-b border-white/10">
      {openFiles.map((nodeId) => {
        const node = nodesById[nodeId];
        if (!node || node.deleted || node.type !== 'file') return null;

        const displayName = node.name;
        const path = getNodePath(nodeId);

        return (
        <div
          key={nodeId}
          onClick={() => onSelect(nodeId)}
          className={`flex items-center gap-2 font-mono text-sm px-3 py-2 cursor-pointer ${
            nodeId === activeFile
              ? "bg-[var(--color-noir-purple-mid)] text-primary"
              : "text-gray-400 hover:bg-[var(--color-noir-purple-deep)]"
          }`}
          title={path}
        >
          <span>{displayName}</span>
          <span
            onClick={(e) => {
              e.stopPropagation();
              onClose(nodeId);
            }}
            className="text-gray-400 hover:text-[var(--color-noir-orange)] leading-none"
          >
            ×
          </span>
        </div>
        );
      })}
    </div>
  );
}
