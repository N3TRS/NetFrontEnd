"use client";

import { Tree, type NodeRendererProps } from "react-arborist";
import { File, Folder, FolderOpen, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditorStore } from "../../../_stores/editorStore";
import { useFileTree } from "../../../_hooks/useFileTree";
import { useYjsSetup } from "../../../_hooks/useYjsSetup";
import type { FileNode } from "../../../_lib/fileSystem/index";

function NodeRenderer({ node, style, dragHandle }: NodeRendererProps<FileNode>) {
  const isFolder = !!node.children;

  return (
    <div
      ref={dragHandle}
      style={style}
      className={cn(
        "flex cursor-pointer select-none items-center gap-1.5 rounded px-2 py-0.5 text-sm",
        "hover:bg-white/10",
        node.isSelected ? "bg-white/10 text-foreground" : "text-muted-foreground",
      )}
    >
      {isFolder ? (
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
            node.isOpen && "rotate-90",
          )}
        />
      ) : (
        <span className="w-3.5 shrink-0" />
      )}

      {isFolder ? (
        node.isOpen ? (
          <FolderOpen className="h-4 w-4 shrink-0 text-primary" />
        ) : (
          <Folder className="h-4 w-4 shrink-0 text-primary" />
        )
      ) : (
        <File className="h-4 w-4 shrink-0 text-muted-foreground/70" />
      )}

      {node.isEditing ? (
        <input
          autoFocus
          defaultValue={node.data.name}
          onBlur={(e) => node.submit(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") node.submit(e.currentTarget.value);
            if (e.key === "Escape") node.reset();
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-full rounded bg-background px-1 text-sm text-foreground outline outline-1 outline-primary"
        />
      ) : (
        <span className="truncate">{node.data.name}</span>
      )}
    </div>
  );
}

export function FileExplorer() {
  const { isSynced } = useYjsSetup();
  const { treeData, onCreate, onMove, onRename, onDelete } = useFileTree(isSynced);
  const { openFile } = useEditorStore();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-4 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Explorer
        </h2>
      </div>

      <div className="flex-1 overflow-auto py-1">
        {isSynced ? (
          <Tree<FileNode>
            data={treeData}
            onCreate={onCreate}
            onMove={onMove}
            onRename={onRename}
            onDelete={onDelete}
            onActivate={(node) => {
              if (!node.children) {
                openFile(node.id);
              }
            }}
            openByDefault={false}
            indent={16}
            rowHeight={28}
            width="100%"
          >
            {NodeRenderer}
          </Tree>
        ) : (
          <div className="px-4 py-3 text-xs text-muted-foreground">
            Cargando...
          </div>
        )}
      </div>
    </div>
  );
}
