"use client";

import { useEffect, useRef } from "react";
import type { editor as MonacoEditor, editor } from "monaco-editor";
import type * as MonacoType from "monaco-editor";
import { ydoc, getAwareness } from "../_lib/yjs/ydoc";
import { getFileText, findYMap } from "../_lib/fileSystem/index";
import { getLanguage } from "@/lib/languages";

export function useMonacoBinding(
  editorInstance: MonacoEditor.IStandaloneCodeEditor | null,
  monacoInstance: typeof MonacoType | null,
  activeFileId: string | null,
): void {
  const bindingRef = useRef<import("y-monaco").MonacoBinding | null>(null);

  useEffect(() => {
    bindingRef.current?.destroy();
    bindingRef.current = null;

    if (!editorInstance || !monacoInstance || !activeFileId) return;

    import("y-monaco").then(({ MonacoBinding }) => {
      const ytext = getFileText(ydoc, activeFileId);

      const found = findYMap(ydoc, activeFileId);
      const fileName = (found?.ymap.get("name") as string) ?? "";
      const language = getLanguage(fileName);

      const uri = monacoInstance.Uri.parse(`file:///${activeFileId}`);
      const existingModel = monacoInstance.editor.getModel(uri);
      const model =
        existingModel ??
        monacoInstance.editor.createModel(ytext.toString(), language, uri);

      if (existingModel && existingModel.getLanguageId() !== language) {
        monacoInstance.editor.setModelLanguage(model, language);
      }

      bindingRef.current = new MonacoBinding(
        ytext,
        model,
        new Set([editorInstance]),
        getAwareness(),
      );

      editorInstance.setModel(model);
    });

    return () => {
      bindingRef.current?.destroy();
      bindingRef.current = null;
    };
  }, [editorInstance, monacoInstance, activeFileId]);
}
