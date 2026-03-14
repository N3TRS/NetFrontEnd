export const EXTENSION_MAP: Record<string, string> = {
  java: "java",
  ts: "typescript",
  tsx: "typescript",
  js: "javascript",
  jsx: "javascript",
  py: "python",
  html: "html",
  css: "css",
  json: "json",
  md: "markdown",
  sql: "sql",
  xml: "xml",
  yaml: "yaml",
  yml: "yaml",
  sh: "shell",
  cpp: "cpp",
  c: "c",
  cs: "csharp",
  go: "go",
  rs: "rust",
  kt: "kotlin",
};

export const getLanguage = (filename: string): string => {
  const ext = filename.split(".").pop()?.toLowerCase();
  return EXTENSION_MAP[ext || ""] || "plaintext";
};