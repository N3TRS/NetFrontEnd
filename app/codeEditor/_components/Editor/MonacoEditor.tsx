"use client";

import Editor, { type OnMount } from "@monaco-editor/react";
import { useCallback, useState } from "react";
import type { editor as MonacoEditorNS } from "monaco-editor";
import type * as MonacoType from "monaco-editor";
import { useEditorStore } from "../../_stores/editorStore";
import { useMonacoBinding } from "../../_hooks/useMonacoBinding";

export function MonacoEditor() {
  const { activeFile } = useEditorStore();

  const [editorInstance, setEditorInstance] =
    useState<MonacoEditorNS.IStandaloneCodeEditor | null>(null);
  const [monacoInstance, setMonacoInstance] = useState<
    typeof MonacoType | null
  >(null);

  useMonacoBinding(editorInstance, monacoInstance, activeFile);

  const handleEditorDidMount: OnMount = useCallback((editor, monaco) => {
    setEditorInstance(editor);
    setMonacoInstance(monaco);
    editor.focus();
  }, []);

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        onMount={handleEditorDidMount}
        theme="vs-dark"
        language="java"
        options={{
          fontSize: 14,
          fontFamily: "var(--font-jetbrains-mono), monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16 },
          lineNumbers: "on",
          renderLineHighlight: "line",
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          smoothScrolling: true,
        }}
      />
    </div>
  );
}
