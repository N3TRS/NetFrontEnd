"use client";

import dynamic from "next/dynamic";

const CodeEditor = dynamic(() => import("./App"), {
  ssr: false,
  loading: () => <div style={{ padding: "20px" }}>Cargando editor...</div>,
});

export default function CodeEditorPage() {
  return <CodeEditor />;
}
