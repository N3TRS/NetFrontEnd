"use client";

import Editor from "@monaco-editor/react";
import { useState } from "react";
import FileExplorer from "./fileExplorer";
import FileTabs from "./fileTabs";
import RunButton from "./runButton";
import { getLanguage } from "@/lib/languages";
import { handleBeforeMount } from "@/lib/beforeMount";

type FileMap = {
  [filename: string]: string;
};

export default function MonacoEditor() {
  const [files, setFiles] = useState<FileMap>({
    "Main.java": "",
    "Controller.java": "",
  });

  const [openFiles, setOpenFiles] = useState<string[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [output, setOutput] = useState("");
  const [projectName, setProjectName] = useState("mi-proyecto");

  const openFile = (file: string) => {
    if (!openFiles.includes(file)) {
      setOpenFiles([...openFiles, file]);
    }
    setActiveFile(file);
  };

  const closeFile = (file: string) => {
    const newOpenFiles = openFiles.filter((f) => f !== file);
    setOpenFiles(newOpenFiles);
    if (activeFile === file) {
      setActiveFile(newOpenFiles[newOpenFiles.length - 1] || null);
    }
  };

  const updateCode = (value: string) => {
    if (!activeFile) return;
    setFiles({ ...files, [activeFile]: value });
  };

  const runCode = async () => {
    if (!activeFile) return;
    const response = await fetch("/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: activeFile, code: files[activeFile] }),
    });
    const data = await response.json();
    setOutput(data.output || data.error);
  };

  const addFile = (filename: string) => {
    if (files[filename]) return; // ya existe
    setFiles({ ...files, [filename]: "" });
  };

  const addFolder = (foldername: string) => {
    const name = foldername.endsWith("/") ? foldername : `${foldername}/`;
    if (files[name]) return;
    setFiles({ ...files, [name]: "" });
  };

  const deleteFile = (filename: string) => {
    const { [filename]: _, ...rest } = files;
    setFiles(rest);
    closeFile(filename);
  };

  const renameFile = (oldName: string, newName: string) => {
    if (files[newName] !== undefined) return; // ya existe
    const { [oldName]: content, ...rest } = files;
    setFiles({ ...rest, [newName]: content });
    setOpenFiles((prev) => prev.map((f) => (f === oldName ? newName : f)));
    if (activeFile === oldName) setActiveFile(newName);
  };

  return (
    <div className="flex h-screen bg-[var(--color-noir-bg)] bg-grid-white">
      {/* Explorer */}
      <FileExplorer
        files={Object.keys(files)}
        onOpenFile={openFile}
        onAddFile={addFile}
        onAddFolder={addFolder}
        onDeleteFile={deleteFile}
        onRenameFile={renameFile}
        projectName={projectName}
      />

      {/* Editor area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Tabs */}
        <FileTabs
          openFiles={openFiles}
          activeFile={activeFile || ""}
          onSelect={setActiveFile}
          onClose={closeFile}
        />

        {activeFile ? (
          <div className="flex-1">
            <Editor
              height="100%"
              theme="vs-dark"
              path={activeFile}
              defaultLanguage={getLanguage(activeFile)}
              defaultValue={files[activeFile] ?? ""}
              beforeMount={handleBeforeMount}
              onChange={(value) => updateCode(value || "")}
              options={{
                fontSize: 14,
                fontFamily: "ui-monospace, monospace",
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

        {/* Run */}
        <RunButton onRun={runCode} />

        {/* Console */}
        <div className="h-48 bg-[var(--color-noir-bg)] text-[var(--color-noir-orange-light)] font-mono text-sm border-t border-white/10 p-3 overflow-auto">
          {output || (
            <span className="opacity-30 text-primary font-mono text-sm">
              // output
            </span>
          )}
        </div>
      </div>
    </div>
  );
}