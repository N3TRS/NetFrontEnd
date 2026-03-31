"use client";

import { ChevronRight, File, Folder } from "lucide-react";

const MOCK_FILES = [
  {
    id: "1",
    name: "src",
    isFolder: true,
    children: [
      {
        id: "1-1",
        name: "main",
        isFolder: true,
        children: [
          {
            id: "1-1-1",
            name: "java",
            isFolder: true,
            children: [
              {
                id: "1-1-1-1",
                name: "com",
                isFolder: true,
                children: [
                  {
                    id: "1-1-1-1-1",
                    name: "omnicode",
                    isFolder: true,
                    children: [
                      { id: "f1", name: "Application.java", isFolder: false },
                      { id: "f2", name: "Controller.java", isFolder: false },
                    ],
                  },
                ],
              },
            ],
          },
          {
            id: "1-1-2",
            name: "resources",
            isFolder: true,
            children: [
              { id: "f3", name: "application.properties", isFolder: false },
            ],
          },
        ],
      },
      {
        id: "1-2",
        name: "test",
        isFolder: true,
        children: [],
      },
    ],
  },
  { id: "f4", name: "pom.xml", isFolder: false },
  { id: "f5", name: "README.md", isFolder: false },
];

interface FileNode {
  id: string;
  name: string;
  isFolder: boolean;
  children?: FileNode[];
}

interface FileTreeItemProps {
  node: FileNode;
  level: number;
}

function FileTreeItem({ node, level }: FileTreeItemProps) {
  const [isOpen, setIsOpen] = React.useState(level < 2);

  const handleClick = () => {
    if (node.isFolder) {
      setIsOpen(!isOpen);
    } else {
      // TODO: Open file in editor
      console.log("Open file:", node.name);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className="flex w-full items-center gap-1 rounded px-2 py-1 text-sm hover:bg-white/10"
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {node.isFolder && (
          <ChevronRight
            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-90" : ""}`}
          />
        )}
        {node.isFolder ? (
          <Folder className="h-4 w-4 text-primary" />
        ) : (
          <File className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="truncate">{node.name}</span>
      </button>
      {node.isFolder && isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

import React from "react";

export function FileExplorer() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-4 py-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Explorer
        </h2>
      </div>
      <div className="flex-1 overflow-auto py-2">
        {MOCK_FILES.map((node) => (
          <FileTreeItem key={node.id} node={node} level={0} />
        ))}
      </div>
    </div>
  );
}
