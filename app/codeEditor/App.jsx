"use client";

import { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

const App = () => {
    const editorRef = useRef(null);

    async function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
        
        // Importar MonacoBinding dinámicamente solo en el cliente
        const { MonacoBinding } = await import("y-monaco");
        
        // Initialize Yjs and the WebSocket provider
        const ydoc = new Y.Doc();
        const provider = new WebsocketProvider("ws://localhost:1234", "test-room", ydoc);
        const type = ydoc.getText("monaco"); 
        
        // Bind the Monaco editor to the Yjs document
        const binding = new MonacoBinding(
            type, 
            editorRef.current.getModel(), 
            new Set([editorRef.current]), 
            provider.awareness
        );
    }

    return (
        <Editor
        height="100vh"
        width="1000vh"
        language="javascript"
        theme="vs-dark"
        onMount={handleEditorDidMount}
        />
    )
}
export default App;
