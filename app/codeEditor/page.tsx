"use client";

import { MonacoEditor } from "./_components/Editor/MonacoEditor";

const DEFAULT_CODE = `package com.omnicode.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class OmniCodeApplication {
    
    // Entry point — shared live with your team
    public static void main(String[] args) {
        SpringApplication.run(OmniCodeApplication.class, args);
    }
}
`;

export default function CodeEditorPage() {
  return <MonacoEditor language="java" value={DEFAULT_CODE} />;
}
