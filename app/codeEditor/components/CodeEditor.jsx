"use client";

import { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { Box, HStack } from "@chakra-ui/react";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS } from "../Utils/constants";

const CodeEditor = () => {
    const editorRef = useRef(null);
    const monacoRef = useRef(null);
    const [language, setLanguage] = useState("javascript");
    const [value, setValue] = useState(CODE_SNIPPETS["javascript"]);

    async function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
        monacoRef.current = monaco;
        
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

    // Efecto para actualizar el lenguaje cuando cambia
    useEffect(() => {
        if (editorRef.current && monacoRef.current) {
            const model = editorRef.current.getModel();
            if (model) {
                monacoRef.current.editor.setModelLanguage(model, language);
            }
        }
    }, [language]);

    const onSelect = (newLanguage) => {
        setLanguage(newLanguage);
        setValue(CODE_SNIPPETS[newLanguage]);
    }

    return (
        <Box>
            <HStack spacing = {4}>
                <Box w="50%" >
                    <LanguageSelector language={language} onSelect={onSelect} />
                    <Editor
                        height="80vh"
                        language={language}
                        value={value}
                        theme="vs-dark"
                        onMount={handleEditorDidMount}
                        onChange={(newValue) => setValue(newValue)}
                    />
                </Box>
            </HStack>
            
        </Box>
    )
}
export default CodeEditor;
