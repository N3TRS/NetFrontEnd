"use client";

import { useState, useRef, useEffect } from "react";

type FileExplorerProps = {files: string[];
  onOpenFile: (file: string) => void;
  onAddFile: (filename: string) => void;
  onAddFolder: (foldername: string) => void;
  onDeleteFile: (filename: string) => void;
  onRenameFile: (oldName: string, newName: string) => void;
  projectName: string;
};

type ContextMenu = {
  x: number;
  y: number;
  file: string;
};

export default function FileExplorer({files,onOpenFile,onAddFile,onAddFolder,
  onDeleteFile,onRenameFile,projectName,}: FileExplorerProps) {

  const [collapsed, setCollapsed] = useState(false);
  const [adding, setAdding] = useState<"file" | "folder" | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, file: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, file });
  };

  const handleConfirmAdd = () => {
    if (!inputValue.trim()) {
      setAdding(null);
      return;
    }
    if (adding === "file") onAddFile(inputValue.trim());
    if (adding === "folder") onAddFolder(inputValue.trim());
    setInputValue("");
    setAdding(null);
  };

  const handleConfirmRename = () => {
    if (!renameValue.trim() || !renaming) {
      setRenaming(null);
      return;
    }
    onRenameFile(renaming, renameValue.trim());
    setRenaming(null);
    setRenameValue("");
  };

  return (
    <div className="w-56 bg-[var(--color-noir-purple-deep)] text-white border-r border-white/10 p-3 flex flex-col gap-1">
      {/* Header */}
      <div className="font-mono text-xs text-white/40 uppercase tracking-widest px-2 py-1">
        Explorer
      </div>

      {/* Project row */}
      <div className="flex items-center justify-between group px-1">
        <div
          onClick={() => setCollapsed(!collapsed)}
          className="font-mono text-sm text-primary py-1 flex items-center gap-1 cursor-pointer hover:text-white/80 select-none flex-1"
        >
          <span className={`text-xs transition-transform duration-200 ${collapsed ? "-rotate-90" : ""}`}>
            ▾
          </span>
          <span>{projectName}</span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => {
              setAdding("file");
              setCollapsed(false);
            }}
            title="Nuevo archivo"
            className="font-mono text-sm text-white/40 hover:text-primary px-1 leading-none"
          >
            +
          </button>
          <button
            onClick={() => {
              setAdding("folder");
              setCollapsed(false);
            }}
            title="Nueva carpeta"
            className="font-mono text-sm text-white/40 hover:text-primary px-1 leading-none"
          >
            ⊞
          </button>
        </div>
      </div>

      {/* Archivos */}
      <div className={`flex flex-col gap-0.5 pl-3 border-l border-white/10 ml-2 overflow-hidden transition-all duration-200 ${
        collapsed ? "max-h-0 opacity-0" : "max-h-96 opacity-100"
      }`}>
        {files.map((file) => (
          <div
            key={file}
            onClick={() => !renaming && onOpenFile(file)}
            onContextMenu={(e) => handleContextMenu(e, file)}
            className="font-mono text-sm text-primary px-2 py-1 rounded cursor-pointer hover:bg-[var(--color-noir-purple-mid)] flex items-center gap-2"
          >
            <span className="text-white/30 text-xs">{file.endsWith("/") ? "▸" : "·"}</span>

            {/* Modo renombrar inline */}
            {renaming === file ? (
              <input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConfirmRename();
                  if (e.key === "Escape") {
                    setRenaming(null);
                    setRenameValue("");
                  }
                }}
                onBlur={handleConfirmRename}
                className="bg-transparent border-b border-primary outline-none font-mono text-sm text-primary w-full"
              />
            ) : (
              <span>{file}</span>
            )}
          </div>
        ))}

        {/* Input nuevo archivo/carpeta */}
        {adding && (
          <div className="flex items-center gap-1 px-2 py-1">
            <span className="text-white/30 text-xs">{adding === "file" ? "·" : "▸"}</span>
            <input
              autoFocus
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleConfirmAdd();
                if (e.key === "Escape") {
                  setAdding(null);
                  setInputValue("");
                }
              }}
              onBlur={handleConfirmAdd}
              placeholder={adding === "file" ? "archivo.java" : "carpeta/"}
              className="bg-transparent border-b border-primary outline-none font-mono text-sm text-primary w-full placeholder:text-white/20"
            />
          </div>
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 bg-[var(--color-noir-purple-deep)] border border-white/10 rounded shadow-xl py-1 min-w-36"
        >
          <button
            onClick={() => {
              setRenaming(contextMenu.file);
              setRenameValue(contextMenu.file);
              setContextMenu(null);
            }}
            className="w-full text-left font-mono text-sm text-primary px-3 py-1.5 hover:bg-[var(--color-noir-purple-mid)] flex items-center gap-2"
          >
            <span className="text-white/40">✎</span> Renombrar
          </button>

          <div className="border-t border-white/10 my-1" />

          <button
            onClick={() => {
              onDeleteFile(contextMenu.file);
              setContextMenu(null);
            }}
            className="w-full text-left font-mono text-sm px-3 py-1.5 hover:bg-[var(--color-noir-purple-mid)] flex items-center gap-2 text-red-400"
          >
            <span>✕</span> Eliminar
          </button>
        </div>
      )}
    </div>
  );
}