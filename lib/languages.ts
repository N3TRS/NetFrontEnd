export const EXTENSION_MAP: Record<string, string> = {
  java: "java",
};

export const getLanguage = (filename: string): string => {
  const ext = filename.split(".").pop()?.toLowerCase();
  return EXTENSION_MAP[ext || ""] || "plaintext";
};

