import { BeforeMount } from "@monaco-editor/react";

export const handleBeforeMount: BeforeMount = (monaco) => {
  monaco.languages.register({ id: "kotlin" });
  monaco.languages.setMonarchTokensProvider("kotlin", {
    tokenizer: {
      root: [
        [/\b(fun|val|var|class|object|interface|if|else|when|for|while|return|import|package|null|true|false|this|super|override|private|public|internal|protected|data|sealed|companion|by|in|is|as|try|catch|finally|throw)\b/, "keyword"],
        [/".*?"/, "string"],
        [/'.*?'/, "string"],
        [/\/\/.*$/, "comment"],
        [/\/\*[\s\S]*?\*\//, "comment"],
        [/\d+/, "number"],
      ],
    },
  });

  monaco.languages.register({ id: "rust" });
  monaco.languages.setMonarchTokensProvider("rust", {
    tokenizer: {
      root: [
        [/\b(fn|let|mut|use|mod|pub|struct|enum|impl|trait|for|while|if|else|match|return|self|Self|super|crate|const|static|type|where|async|await|move|ref|in|loop|break|continue|true|false)\b/, "keyword"],
        [/".*?"/, "string"],
        [/\/\/.*$/, "comment"],
        [/\/\*[\s\S]*?\*\//, "comment"],
        [/\d+/, "number"],
      ],
    },
  });

  monaco.languages.register({ id: "shell" });
  monaco.languages.setMonarchTokensProvider("shell", {
    tokenizer: {
      root: [
        [/\b(echo|cd|ls|mkdir|rm|cp|mv|cat|grep|find|chmod|sudo|apt|npm|yarn|git|export|source|if|then|else|fi|for|do|done|while|case|esac|function|return|exit)\b/, "keyword"],
        [/".*?"/, "string"],
        [/'.*?'/, "string"],
        [/#.*$/, "comment"],
        [/\$\w+/, "variable"],
        [/\d+/, "number"],
      ],
    },
  });
};